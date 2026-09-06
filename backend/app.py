import json
import os
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Literal

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

SCENE_PATH = Path(os.environ.get("SCENE_PATH", Path(__file__).with_name("scene.json")))

app = FastAPI(title="Anamarija Live Scene API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in os.environ.get("CORS_ORIGINS", "http://localhost:8000,https://digitalcliqs.github.io").split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class ScenePatch(BaseModel):
    item_id: str = Field(min_length=1)
    action: Literal["add", "modify", "delete"]
    item_type: str | None = None
    room: str | None = None
    asset: str | None = None
    position: list[float] | None = None
    rotation: list[float] | None = None
    scale: list[float] | None = None
    material: str | None = None


class ScenePatchBatch(BaseModel):
    patches: list[ScenePatch]
    reason: str = "manual"


class PromptRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=4000)


class ConnectionManager:
    def __init__(self) -> None:
        self.connections: set[WebSocket] = set()

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.connections.add(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        self.connections.discard(websocket)

    async def broadcast(self, payload: dict[str, Any]) -> None:
        stale: list[WebSocket] = []
        for ws in self.connections:
            try:
                await ws.send_json(payload)
            except Exception:
                stale.append(ws)
        for ws in stale:
            self.connections.discard(ws)


manager = ConnectionManager()


def _now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def load_scene() -> dict[str, Any]:
    if not SCENE_PATH.exists():
        raise RuntimeError(f"Scene file missing: {SCENE_PATH}")
    return json.loads(SCENE_PATH.read_text(encoding="utf-8"))


def save_scene(scene: dict[str, Any]) -> None:
    SCENE_PATH.write_text(json.dumps(scene, indent=2) + "\n", encoding="utf-8")


def _vec3(name: str, value: list[float] | None) -> list[float] | None:
    if value is None:
        return None
    if len(value) != 3:
        raise HTTPException(status_code=422, detail=f"{name} must contain exactly 3 numbers")
    return [float(v) for v in value]


def apply_patch(scene: dict[str, Any], patch: ScenePatch) -> None:
    objects = scene.setdefault("objects", {})
    item_id = patch.item_id

    if patch.action == "delete":
        if item_id not in objects:
            raise HTTPException(status_code=404, detail=f"Unknown object: {item_id}")
        del objects[item_id]
        return

    if patch.action == "add":
        if item_id in objects:
            raise HTTPException(status_code=409, detail=f"Object already exists: {item_id}")
        objects[item_id] = {
            "type": patch.item_type or "furniture",
            "room": patch.room or "unassigned",
            "asset": patch.asset or "placeholder",
            "position": _vec3("position", patch.position) or [0.0, 0.0, 0.0],
            "rotation": _vec3("rotation", patch.rotation) or [0.0, 0.0, 0.0],
            "scale": _vec3("scale", patch.scale) or [1.0, 1.0, 1.0],
            "material": patch.material or "default",
        }
        return

    if item_id not in objects:
        raise HTTPException(status_code=404, detail=f"Unknown object: {item_id}")

    item = objects[item_id]
    for key in ("type", "room", "asset", "material"):
        value = getattr(patch, "item_type" if key == "type" else key)
        if value is not None:
            item[key] = value
    for key in ("position", "rotation", "scale"):
        value = _vec3(key, getattr(patch, key))
        if value is not None:
            item[key] = value


def apply_batch(scene: dict[str, Any], batch: ScenePatchBatch) -> dict[str, Any]:
    before = deepcopy(scene)
    for patch in batch.patches:
        apply_patch(scene, patch)

    metadata = scene.setdefault("metadata", {})
    metadata["updatedAt"] = _now()
    revision = {
        "at": metadata["updatedAt"],
        "reason": batch.reason,
        "patches": [p.model_dump(exclude_none=True) for p in batch.patches],
        "previousVersion": before.get("metadata", {}).get("version", "unknown"),
    }
    scene.setdefault("revisions", []).append(revision)
    return scene


SCENE_TOOL = {
    "type": "function",
    "name": "apply_scene_patches",
    "description": "Apply one or more precise edits to the canonical 3D house scene.",
    "strict": True,
    "parameters": {
        "type": "object",
        "properties": {
            "patches": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "item_id": {"type": "string"},
                        "action": {"type": "string", "enum": ["add", "modify", "delete"]},
                        "item_type": {"type": ["string", "null"]},
                        "room": {"type": ["string", "null"]},
                        "asset": {"type": ["string", "null"]},
                        "position": {"type": ["array", "null"], "items": {"type": "number"}, "minItems": 3, "maxItems": 3},
                        "rotation": {"type": ["array", "null"], "items": {"type": "number"}, "minItems": 3, "maxItems": 3},
                        "scale": {"type": ["array", "null"], "items": {"type": "number"}, "minItems": 3, "maxItems": 3},
                        "material": {"type": ["string", "null"]},
                    },
                    "required": ["item_id", "action", "item_type", "room", "asset", "position", "rotation", "scale", "material"],
                    "additionalProperties": False,
                },
            },
            "reason": {"type": "string"},
        },
        "required": ["patches", "reason"],
        "additionalProperties": False,
    },
}


def prompt_to_batch(prompt: str, scene: dict[str, Any]) -> ScenePatchBatch:
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="OPENAI_API_KEY is not configured")

    try:
        from openai import OpenAI
    except ImportError as exc:
        raise HTTPException(status_code=503, detail="openai package is not installed") from exc

    client = OpenAI(api_key=api_key)
    model = os.environ.get("OPENAI_MODEL", "gpt-5.6-terra")
    compact_scene = {
        "metadata": scene.get("metadata", {}),
        "objects": scene.get("objects", {}),
    }

    response = client.responses.create(
        model=model,
        input=[
            {
                "role": "system",
                "content": (
                    "You are the spatial editing agent for a dimensioned single-storey house. "
                    "Translate the user's instruction into the smallest safe set of scene patches. "
                    "Use meters. Never invent an existing object ID. Preserve unrelated objects. "
                    "If the user gives a relative move, calculate it from the current object position. "
                    "Return scene edits only through the provided function. Current scene: "
                    + json.dumps(compact_scene, separators=(",", ":"))
                ),
            },
            {"role": "user", "content": prompt},
        ],
        tools=[SCENE_TOOL],
        tool_choice="auto",
    )

    for item in response.output:
        if getattr(item, "type", None) == "function_call" and getattr(item, "name", None) == "apply_scene_patches":
            args = json.loads(item.arguments)
            return ScenePatchBatch.model_validate(args)

    raise HTTPException(status_code=422, detail="The model did not produce a scene edit")


@app.get("/health")
def health() -> dict[str, Any]:
    return {"ok": True, "scene": str(SCENE_PATH)}


@app.get("/api/scene")
def get_scene() -> dict[str, Any]:
    return load_scene()


@app.post("/api/scene/patch")
async def patch_scene(batch: ScenePatchBatch) -> dict[str, Any]:
    scene = load_scene()
    apply_batch(scene, batch)
    save_scene(scene)
    await manager.broadcast({"type": "scene.updated", "scene": scene, "reason": batch.reason})
    return scene


@app.post("/api/scene/prompt")
async def prompt_scene(request: PromptRequest) -> dict[str, Any]:
    scene = load_scene()
    batch = prompt_to_batch(request.prompt, scene)
    apply_batch(scene, batch)
    save_scene(scene)
    await manager.broadcast({"type": "scene.updated", "scene": scene, "reason": batch.reason})
    return {"scene": scene, "applied": batch.model_dump()}


@app.websocket("/ws/scene")
async def scene_socket(websocket: WebSocket) -> None:
    await manager.connect(websocket)
    await websocket.send_json({"type": "scene.snapshot", "scene": load_scene()})
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
