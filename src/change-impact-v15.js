import { DESIGN_OBJECTS } from './house-design-v15.js';
import { TOUR_SCENES } from './tour-manifest-v14.js';

const SCENE_ROOMS={
  'entrance':['entrance','hallway','living','shared'],
  'hallway':['entrance','hallway','living','office','accessible-bedroom','master-bedroom','shared'],
  'living':['living','dining','kitchen','terrace','shared'],
  'dining':['dining','living','kitchen','terrace','shared'],
  'kitchen':['kitchen','dining','living','shared'],
  'office':['office','hallway'],
  'accessible-bedroom':['accessible-bedroom','accessible-bathroom','hallway'],
  'accessible-bathroom':['accessible-bathroom','accessible-bedroom','hallway'],
  'master-bedroom':['master-bedroom','ensuite','hallway','bedrooms'],
  'ensuite':['ensuite','master-bedroom'],
  'guest-bedroom':['guest-bedroom','hallway','bedrooms'],
  'terrace':['terrace','living','dining','pool','garden'],
  'pool':['pool','terrace','garden'],
  'exterior-front':['exterior','garden','entrance'],
  'garden-front':['garden','exterior','entrance'],
  'garden-rear':['garden','terrace','pool','exterior']
};

function hasRoom(sceneId,room){return (SCENE_ROOMS[sceneId]||[]).includes(room)}
function allScenes(){return TOUR_SCENES.map(s=>s.id)}

export function calculateImpact(objectId,{reason='design change',variant=null}={}){
  const obj=DESIGN_OBJECTS[objectId];
  if(!obj) throw new Error(`Unknown design object: ${objectId}`);
  let scenes=[];
  const propagation=obj.propagation;
  if(propagation==='global') scenes=allScenes();
  else if(propagation==='exterior') scenes=TOUR_SCENES.filter(s=>['exterior-front','garden-front','garden-rear','terrace','pool'].includes(s.id)).map(s=>s.id);
  else if(propagation==='lighting') scenes=TOUR_SCENES.filter(s=>['entrance','hallway','living','dining','kitchen','terrace'].includes(s.id)).map(s=>s.id);
  else if(obj.room==='whole-house') scenes=allScenes();
  else if(obj.room==='bedrooms') scenes=TOUR_SCENES.filter(s=>['master-bedroom','guest-bedroom','accessible-bedroom','office','hallway'].includes(s.id)).map(s=>s.id);
  else scenes=TOUR_SCENES.filter(s=>hasRoom(s.id,obj.room)).map(s=>s.id);

  // Structural/opening/layout changes can alter navigation and accessibility graph as well as pixels.
  const recalcNavigation=['structure','accessibility'].includes(obj.type);
  const recalcAccessibility=['structure','accessibility','fixed-furniture','furniture'].includes(obj.type);
  const recalcLighting=['structure','finish','lighting','fixed-furniture','amenity','landscape'].includes(obj.type);

  return {
    objectId,
    label:obj.label,
    type:obj.type,
    reason,
    variant,
    affectedScenes:[...new Set(scenes)],
    requiredCubeFaces:[...new Set(scenes)].flatMap(sceneId=>['px','nx','py','ny','pz','nz'].map(face=>({sceneId,face}))),
    recalcNavigation,
    recalcAccessibility,
    recalcLighting,
    requiresFloorplanUpdate:['structure','accessibility','fixed-furniture'].includes(obj.type),
    status:'dirty'
  };
}

export function combineImpacts(changes){
  const impacts=changes.map(c=>calculateImpact(c.objectId,c));
  const scenes=[...new Set(impacts.flatMap(i=>i.affectedScenes))];
  return {
    impacts,
    scenes,
    faces:scenes.flatMap(sceneId=>['px','nx','py','ny','pz','nz'].map(face=>({sceneId,face}))),
    recalcNavigation:impacts.some(i=>i.recalcNavigation),
    recalcAccessibility:impacts.some(i=>i.recalcAccessibility),
    recalcLighting:impacts.some(i=>i.recalcLighting),
    requiresFloorplanUpdate:impacts.some(i=>i.requiresFloorplanUpdate)
  };
}

export function nextRevision(revision,kind='minor'){
  const [a,b,c]=String(revision).split('.').map(Number);
  if(kind==='major') return `${a+1}.0.0`;
  if(kind==='patch') return `${a}.${b}.${c+1}`;
  return `${a}.${b+1}.0`;
}
