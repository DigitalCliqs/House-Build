// Registry-driven production asset layer. Loads only assets explicitly marked available.
// Missing/planned assets never replace the controlled hero placeholders.
export function createProductionAssetLayer({THREE,scene,GLTFLoader,registry,onStatus=()=>{}}={}){
 if(!THREE||!scene||!GLTFLoader)throw new Error('THREE, scene and GLTFLoader are required');
 const group=new THREE.Group();group.name='production-assets';scene.add(group);const loader=new GLTFLoader();
 const placements={
  'modern-armchair':[{p:[2.48,0,-2.12],r:[0,.62,0],h:1.0}],
  'potted-plant':[{p:[8.18,0,-4.48],r:[0,-.36,0],h:1.45},{p:[1.52,0,-4.88],r:[0,.46,0],h:1.2},{p:[1.15,0,5.45],r:[0,-.15,0],h:1.05},{p:[8.8,0,-6.15],r:[0,.2,0],h:1.25}],
  'round-oak-stone-table':[{p:[3.72,0,-1.28],r:[0,.15,0],h:.42}],
  'modern-coffee-table':[{p:[2.15,0,-1.02],r:[0,-.22,0],h:.36}],
  'modern-wooden-cabinet':[{p:[-.08,0,5.65],r:[0,Math.PI,0],h:.92}],
  'crystalline-iceplant':[
    {p:[-4.8,.07,-7.1],r:[0,.15,0],h:.38},{p:[-3.9,.07,-7.35],r:[0,-.5,0],h:.34},
    {p:[10.7,.07,-7.4],r:[0,.75,0],h:.36},{p:[11.3,.07,-8.1],r:[0,-.3,0],h:.32},
    {p:[-4.6,.07,-13.2],r:[0,.4,0],h:.35},{p:[10.9,.07,-13.0],r:[0,-.7,0],h:.34}
  ]
 };
 const ready=e=>e&&e.status==='available'&&e.path;
 const fallbackNames={
  'round-oak-stone-table':['living-coffee-table','living-coffee-table-base'],
  'modern-wooden-cabinet':['premium:entry-console','premium:entry-console-top']
 };
 function hideFallback(id){for(const name of fallbackNames[id]||[]){const o=scene.getObjectByName(name);if(o)o.visible=false}}
 function fitToHeight(o,targetHeight){
  if(!targetHeight)return;
  o.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(o),size=new THREE.Vector3();box.getSize(size);
  if(size.y>1e-4){const s=targetHeight/size.y;o.scale.multiplyScalar(s);o.updateMatrixWorld(true);const fitted=new THREE.Box3().setFromObject(o);o.position.y-=fitted.min.y;}
 }
 function load(id,entry,placement){return new Promise(resolve=>loader.load(entry.path,g=>{
  const o=g.scene||g.scenes?.[0];if(!o)return resolve();
  o.name=`production:${id}`;o.rotation.set(...placement.r);fitToHeight(o,placement.h);o.position.x=placement.p[0];o.position.y+=placement.p[1]||0;o.position.z=placement.p[2];
  o.traverse(n=>{if(n.isMesh){n.castShadow=true;n.receiveShadow=true;if(n.material){const ms=Array.isArray(n.material)?n.material:[n.material];for(const m of ms){if('envMapIntensity'in m)m.envMapIntensity=Math.max(m.envMapIntensity||0,1.12);if('roughness'in m)m.roughness=Math.min(1,Math.max(.18,m.roughness??.5));m.needsUpdate=true}}}});
  group.add(o);hideFallback(id);onStatus({id,state:'loaded'});resolve(o)
 },undefined,error=>{console.warn('Production asset failed',id,error);onStatus({id,state:'error'});resolve()}))}
 const jobs=[];for(const[id,list]of Object.entries(placements)){const entry=registry?.models?.[id];if(!ready(entry)){onStatus({id,state:'skipped',reason:entry?.status||'unregistered'});continue}for(const p of list)jobs.push(load(id,entry,p))}
 return{group,ready:Promise.all(jobs),dispose(){group.traverse(n=>{n.geometry?.dispose?.();if(n.material){const ms=Array.isArray(n.material)?n.material:[n.material];ms.forEach(m=>m.dispose?.())}});scene.remove(group)}};
}
