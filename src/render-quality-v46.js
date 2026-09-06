// V46 cinematic render-quality pass: post-processing, soft bloom and contact-focused shadow tuning.
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export function createRenderQualityV46({THREE,renderer,scene,camera,sun}={}){
  if(!THREE||!renderer||!scene||!camera)throw new Error('THREE, renderer, scene and camera are required');

  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.VSMShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.03;

  if(sun?.shadow){
    sun.shadow.radius=5;
    sun.shadow.blurSamples=12;
    sun.shadow.bias=-0.00012;
    sun.shadow.normalBias=.022;
    sun.shadow.camera.near=.5;
    sun.shadow.camera.far=70;
  }

  const composer=new EffectComposer(renderer);
  composer.setPixelRatio(Math.min(devicePixelRatio,1.65));
  composer.setSize(innerWidth,innerHeight);
  composer.addPass(new RenderPass(scene,camera));

  const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.13,.62,.88);
  bloom.threshold=.91;
  bloom.strength=.12;
  bloom.radius=.58;
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  function tuneMaterials(){
    scene.traverse(o=>{
      if(!o.isMesh||!o.material)return;
      const list=Array.isArray(o.material)?o.material:[o.material];
      for(const m of list){
        if('envMapIntensity' in m && /glass|glazing|slider|island|stone|bronze|oven|pool|water|v45:|v42:/i.test(o.name||'')){
          m.envMapIntensity=Math.max(m.envMapIntensity||0,1.25);
        }
        if('roughness' in m && /glass|glazing|slider/i.test(o.name||''))m.roughness=Math.min(m.roughness,.055);
        m.needsUpdate=true;
      }
    });
  }
  tuneMaterials();

  const modes={
    day:{bloom:.10,threshold:.92,exposure:1.05},
    evening:{bloom:.18,threshold:.86,exposure:.98},
    night:{bloom:.28,threshold:.78,exposure:.88},
  };
  function setMode(mode){
    const p=modes[mode]||modes.day;
    bloom.strength=p.bloom;
    bloom.threshold=p.threshold;
    renderer.toneMappingExposure=p.exposure;
  }
  function resize(w,h){composer.setSize(w,h);bloom.setSize(w,h)}
  function render(delta){composer.render(delta)}
  function dispose(){composer.dispose?.();bloom.dispose?.()}
  return{composer,bloom,setMode,resize,render,dispose};
}
