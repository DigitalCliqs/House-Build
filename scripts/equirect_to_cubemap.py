#!/usr/bin/env python3
import argparse, math, os
import numpy as np
from PIL import Image

FACES = {
    'px': lambda u,v: np.stack([np.ones_like(u), -v, -u], axis=-1),
    'nx': lambda u,v: np.stack([-np.ones_like(u), -v, u], axis=-1),
    'py': lambda u,v: np.stack([u, np.ones_like(u), v], axis=-1),
    'ny': lambda u,v: np.stack([u, -np.ones_like(u), -v], axis=-1),
    'pz': lambda u,v: np.stack([u, -v, np.ones_like(u)], axis=-1),
    'nz': lambda u,v: np.stack([-u, -v, -np.ones_like(u)], axis=-1),
}

def sample_equirect(img, dirs):
    dirs = dirs / np.linalg.norm(dirs, axis=-1, keepdims=True)
    x,y,z = dirs[...,0], dirs[...,1], dirs[...,2]
    lon = np.arctan2(x, z)
    lat = np.arcsin(np.clip(y, -1, 1))
    h,w = img.shape[:2]
    fx = (lon / (2*np.pi) + 0.5) * (w-1)
    fy = (0.5 - lat / np.pi) * (h-1)
    x0 = np.floor(fx).astype(np.int32); y0 = np.floor(fy).astype(np.int32)
    x1 = (x0 + 1) % w; y1 = np.clip(y0 + 1, 0, h-1)
    dx = (fx - x0)[...,None]; dy = (fy - y0)[...,None]
    c00 = img[y0, x0]; c10 = img[y0, x1]; c01 = img[y1, x0]; c11 = img[y1, x1]
    top = c00*(1-dx) + c10*dx
    bot = c01*(1-dx) + c11*dx
    return np.clip(top*(1-dy) + bot*dy, 0, 255).astype(np.uint8)

def main():
    ap=argparse.ArgumentParser(description='Convert a 2:1 equirectangular panorama into six square cubemap faces.')
    ap.add_argument('input')
    ap.add_argument('output_dir')
    ap.add_argument('--size', type=int, default=2048)
    ap.add_argument('--quality', type=int, default=92)
    args=ap.parse_args()
    im=Image.open(args.input).convert('RGB')
    if im.width < im.height*1.9:
        raise SystemExit('Input must be approximately 2:1 equirectangular.')
    arr=np.asarray(im).astype(np.float32)
    n=args.size
    q=(np.arange(n)+0.5)/n*2-1
    u,v=np.meshgrid(q,q)
    os.makedirs(args.output_dir, exist_ok=True)
    for name,fn in FACES.items():
        face=sample_equirect(arr, fn(u,v))
        Image.fromarray(face).save(os.path.join(args.output_dir,f'{name}.jpg'), quality=args.quality, subsampling=0, optimize=True)
        print(name)

if __name__=='__main__':
    main()
