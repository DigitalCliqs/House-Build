// Reference-led production material + environment pass for the Anamarija next-gen shell.
// Remote CC0 maps enhance the base materials when reachable; failed texture loads preserve tuned procedural PBR.
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export function applyProductionMaterialPass({THREE,scene,renderer}={}){
 if(!THREE||!scene)throw new Error('THREE and scene are required');
 const loader=new THREE.TextureLoader(),owned=[];
 let pmrem=null,roomEnv=null,envRT=null,hemi=null,bounce=null;
 if(renderer){
  pmrem=new THREE.PMREMGenerator(renderer);roomEnv=new RoomEnvironment();envRT=pmrem.fromScene(roomEnv,.035);scene.environment=envRT.texture;
  hemi=new THREE.HemisphereLight(0xfff5e8,0x6f756f,.38);hemi.name='v44:architectural-hemi-fill';scene.add(hemi);
  bounce=new THREE.RectAreaLight(0xfff1dd,3.8,7.5,3.1);bounce.name='v44:rear-glazing-bounce';bounce.position.set(5,2.1,-3.45);scene.add(bounce);
 }
 const sets={
  marble:{base:'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/marble_01/marble_01_diff_2k.jpg',normal:'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/marble_01/marble_01_nor_gl_2k.jpg',rough:'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/marble_01/marble_01_rough_2k.jpg',repeat:[5.2,3.8]},
  oak:{base:'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/oak_wood_planks/oak_wood_planks_diff_2k.jpg',normal:'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/oak_wood_planks/oak_wood_planks_nor_gl_2k.jpg',rough:'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/oak_wood_planks/oak_wood_planks_rough_2k.jpg',repeat:[3.4,3.4]},
  roof:{base:'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/roof_slates_03/roof_slates_03_diff_2k.jpg',normal:'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/roof_slates_03/roof_slates_03_nor_gl_2k.jpg',rough:'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/roof_slates_03/roof_slates_03_rough_2k.jpg',repeat:[5,5]},
  stone:{base:'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/stone_tiles/stone_tiles_diff_2k.jpg',normal:'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/stone_tiles/stone_tiles_nor_gl_2k.jpg',rough:'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/stone_tiles/stone_tiles_rough_2k.jpg',repeat:[3,3]}
 };
 function tex(url,srgb=false,repeat=[1,1]){return new Promise(resolve=>loader.load(url,t=>{t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(...repeat);t.anisotropy=Math.min(12,renderer?.capabilities?.getMaxAnisotropy?.()||4);if(srgb)t.colorSpace=THREE.SRGBColorSpace;owned.push(t);resolve(t)},undefined,()=>resolve(null)))}
 async function physical(set,opts){const [map,normalMap,roughnessMap]=await Promise.all([tex(set.base,true,set.repeat),tex(set.normal,false,set.repeat),tex(set.rough,false,set.repeat)]);const loaded=!!map;return new THREE.MeshPhysicalMaterial({color:opts.color,map:map||null,normalMap:normalMap||null,roughnessMap:roughnessMap||null,normalScale:new THREE.Vector2(opts.normalScale??.32,opts.normalScale??.32),roughness:opts.roughness,metalness:0,clearcoat:opts.clearcoat||0,clearcoatRoughness:opts.clearcoatRoughness??.3,envMapIntensity:opts.envMapIntensity??1,side:opts.side??THREE.FrontSide,userData:{textureSetLoaded:loaded}})}
 return Promise.all([
  physical(sets.marble,{color:0xf4f0e9,roughness:.19,normalScale:.18,clearcoat:.38,clearcoatRoughness:.16,envMapIntensity:1.55}),
  physical(sets.oak,{color:0xc18e61,roughness:.43,normalScale:.28,clearcoat:.06,clearcoatRoughness:.38,envMapIntensity:1.0}),
  physical(sets.roof,{color:0x3b3d40,roughness:.68,normalScale:.42,envMapIntensity:.75,side:THREE.DoubleSide}),
  physical(sets.stone,{color:0xd7d0c5,roughness:.58,normalScale:.28,envMapIntensity:.9})
 ]).then(([marble,oak,roof,stone])=>{
  const materials=[marble,oak,roof,stone];
  scene.traverse(o=>{if(!o.isMesh)return;const n=o.name||'';
   if(n==='house-slab'||(n.startsWith('floor:')&&!/bed|office|master|child/i.test(n)))o.material=marble;
   if(n.startsWith('floor:')&&/bed|office|master|child/i.test(n))o.material=oak;
   if(n.startsWith('roof:'))o.material=roof;
   if(n.startsWith('facade:')||n==='terrace'||n==='pool-shell'||n.startsWith('landscape:pool-deck')||n.startsWith('landscape:route:')||n.startsWith('landscape:turning:'))o.material=stone;
   const ms=Array.isArray(o.material)?o.material:[o.material];for(const m of ms){if(m&&'envMapIntensity'in m&&/v42:|v43:|premium:|production:|glazing:|slider:|pool|terrace/i.test(n))m.envMapIntensity=Math.max(m.envMapIntensity||0,1.35)}
  });
  const loaded=materials.filter(m=>m.userData.textureSetLoaded).length;
  return{materials,loadedTextureSets:loaded,totalTextureSets:materials.length,environment:true,dispose(){owned.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());if(hemi)scene.remove(hemi);if(bounce)scene.remove(bounce);if(envRT&&scene.environment===envRT.texture)scene.environment=null;envRT?.dispose?.();roomEnv?.dispose?.();pmrem?.dispose?.()}};
 });
}
