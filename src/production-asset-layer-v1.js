// Registry-driven production asset layer. Loads only assets explicitly marked available.
// Missing/planned assets never replace the controlled hero placeholders.
export function createProductionAssetLayer({THREE,scene,GLTFLoader,registry,onStatus=()=>{}}={}){
 if(!THREE||!scene||!GLTFLoader)throw new Error('THREE, scene and GLTFLoader are required');
 const group=new THREE.Group();group.name='production-assets';scene.add(group);const loader=new GLTFLoader();
 const placements={
  'modern-armchair':[{p:[2.48,0,-2.12],r:[0,.62,0],s:.92}],
  'potted-plant':[{p:[8.18,0,-4.48],r:[0,-.36,0],s:.72},{p:[1.52,0,-4.88],r:[0,.46,0],s:.58},{p:[1.15,0,5.45],r:[0,-.15,0],s:.46}],
  'round-oak-stone-table':[{p:[3.72,0,-1.28],r:[0,.15,0],s:.92}],
  'modern-coffee-table':[{p:[2.15,0,-1.02],r:[0,-.22,0],s:.56}]
 };
 const ready=e=>e&&e.status==='available'&&e.path;
 const fallbackNames={
  'round-oak-stone-table':['living-coffee-table','living-coffee-table-base']
 };
 function hideFallback(id){for(const name of fallbackNames[id]||[]){const o=scene.getObjectByName(name);if(o)o.visible=false}}
 function load(id,entry,placement){return new Promise(resolve=>loader.load(entry.path,g=>{
  const o=g.scene||g.scenes?.[0];if(!o)return resolve();
  o.name=`production:${id}`;o.position.set(...placement.p);o.rotation.set(...placement.r);o.scale.setScalar(placement.s||1);
  o.traverse(n=>{if(n.isMesh){n.castShadow=true;n.receiveShadow=true;if(n.material){const ms=Array.isArray(n.material)?n.material:[n.material];for(const m of ms){if('envMapIntensity'in m)m.envMapIntensity=Math.max(m.envMapIntensity||0,1.05);m.needsUpdate=true}}}});
  group.add(o);hideFallback(id);onStatus({id,state:'loaded'});resolve(o)
 },undefined,error=>{console.warn('Production asset failed',id,error);onStatus({id,state:'error'});resolve()}))}
 const jobs=[];for(const[id,list]of Object.entries(placements)){const entry=registry?.models?.[id];if(!ready(entry)){onStatus({id,state:'skipped',reason:entry?.status||'unregistered'});continue}for(const p of list)jobs.push(load(id,entry,p))}
 return{group,ready:Promise.all(jobs),dispose(){group.traverse(n=>{n.geometry?.dispose?.();if(n.material){const ms=Array.isArray(n.material)?n.material:[n.material];ms.forEach(m=>m.dispose?.())}});scene.remove(group)}};
}
