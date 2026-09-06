// V44 local image-based-lighting substitute using Three.js RoomEnvironment + PMREM.
// Gives all physical materials stable reflection/ambient response without external HDR dependency.
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export function createEnvironmentRealismV44({THREE,scene,renderer}={}){
  if(!THREE||!scene||!renderer)throw new Error('THREE, scene and renderer are required');
  const pmrem=new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader?.();
  const room=new RoomEnvironment();
  const envRT=pmrem.fromScene(room,.035);
  scene.environment=envRT.texture;

  // Low-intensity hemispheric fill preserves material detail in deep hallway/ceiling recesses.
  const hemi=new THREE.HemisphereLight(0xfff5e8,0x6f756f,.48);
  hemi.name='v44:architectural-hemi-fill';
  scene.add(hemi);

  // Soft bounced daylight near panoramic glazing; deliberately shadowless and low-cost.
  const bounce=new THREE.RectAreaLight(0xfff1dd,4.5,7.5,3.1);
  bounce.name='v44:rear-glazing-bounce';
  bounce.position.set(5,2.1,-3.4);
  bounce.rotation.set(0,0,0);
  scene.add(bounce);

  scene.traverse(o=>{
    if(!o.isMesh||!o.material)return;
    const mats=Array.isArray(o.material)?o.material:[o.material];
    for(const m of mats){
      if('envMapIntensity' in m){
        const n=o.name||'';
        const hero=/v42:|v43:|premium:|production:|glazing:|slider:|terrace:|pool-/i.test(n);
        m.envMapIntensity=Math.max(m.envMapIntensity||0,hero?1.45:1.05);
      }
      if('clearcoat' in m && /stone|glass|island|pool|glazing|slider/i.test(o.name||''))m.clearcoat=Math.max(m.clearcoat||0,.28);
      m.needsUpdate=true;
    }
  });

  return{
    hemi,bounce,texture:envRT.texture,
    setMode(mode){
      if(mode==='night'){hemi.intensity=.14;bounce.intensity=.7;}
      else if(mode==='evening'){hemi.intensity=.30;bounce.intensity=2.2;}
      else{hemi.intensity=.48;bounce.intensity=4.5;}
    },
    dispose(){
      scene.remove(hemi,bounce);
      if(scene.environment===envRT.texture)scene.environment=null;
      envRT.dispose();room.dispose?.();pmrem.dispose();
    }
  };
}
