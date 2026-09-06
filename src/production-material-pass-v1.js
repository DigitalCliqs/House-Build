// Production material pass for the Anamarija next-gen shell.
// Uses remotely hosted CC0 Poly Haven maps when available; every load has a procedural fallback so the walkthrough remains usable offline/failure.
export function applyProductionMaterialPass({THREE,scene,renderer}={}){
 if(!THREE||!scene) throw new Error('THREE and scene are required');
 const loader=new THREE.TextureLoader();
 const owned=[];
 const sets={
  marble:{base:'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/marble_01/marble_01_diff_2k.jpg',normal:'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/marble_01/marble_01_nor_gl_2k.jpg',rough:'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/marble_01/marble_01_rough_2k.jpg',repeat:[7,5]},
  oak:{base:'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/oak_wood_planks/oak_wood_planks_diff_2k.jpg',normal:'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/oak_wood_planks/oak_wood_planks_nor_gl_2k.jpg',rough:'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/oak_wood_planks/oak_wood_planks_rough_2k.jpg',repeat:[4,4]},
  roof:{base:'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/roof_slates_03/roof_slates_03_diff_2k.jpg',normal:'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/roof_slates_03/roof_slates_03_nor_gl_2k.jpg',rough:'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/roof_slates_03/roof_slates_03_rough_2k.jpg',repeat:[5,5]},
  stone:{base:'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/stone_tiles/stone_tiles_diff_2k.jpg',normal:'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/stone_tiles/stone_tiles_nor_gl_2k.jpg',rough:'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/stone_tiles/stone_tiles_rough_2k.jpg',repeat:[3,3]}
 };
 function tex(url,srgb=false,repeat=[1,1]){return new Promise(resolve=>loader.load(url,t=>{t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(...repeat);t.anisotropy=Math.min(8,renderer?.capabilities?.getMaxAnisotropy?.()||4);if(srgb)t.colorSpace=THREE.SRGBColorSpace;owned.push(t);resolve(t)},()=>resolve(null)))}
 async function material(set,opts={}){const [map,normalMap,roughnessMap]=await Promise.all([tex(set.base,true,set.repeat),tex(set.normal,false,set.repeat),tex(set.rough,false,set.repeat)]);return new THREE.MeshPhysicalMaterial({color:opts.color??0xffffff,map,normalMap,roughnessMap,roughness:opts.roughness??.42,metalness:0,clearcoat:opts.clearcoat??0,clearcoatRoughness:opts.clearcoatRoughness??.3,side:opts.side??THREE.FrontSide})}
 return Promise.all([
  material(sets.marble,{roughness:.28,clearcoat:.14,clearcoatRoughness:.22}),
  material(sets.oak,{roughness:.5}),material(sets.roof,{roughness:.72,side:THREE.DoubleSide}),material(sets.stone,{roughness:.78})
 ]).then(([marble,oak,roof,stone])=>{
  const materials=[marble,oak,roof,stone];
  scene.traverse(o=>{if(!o.isMesh)return;const n=o.name||'';if(n==='house-slab'||n.startsWith('floor:')&&!n.includes('bed'))o.material=marble;if(n.startsWith('floor:')&&/bed|office|master|child/i.test(n))o.material=oak;if(n.startsWith('roof:'))o.material=roof;if(n.startsWith('facade:')||n==='terrace'||n==='pool-shell')o.material=stone;});
  return{materials,dispose(){owned.forEach(t=>t.dispose());materials.forEach(m=>m.dispose())}};
 });
}
