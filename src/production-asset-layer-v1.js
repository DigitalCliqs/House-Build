// Registry-driven production asset layer. Loads only assets explicitly marked available.
// Missing/planned assets never replace the controlled hero placeholders.
export function createProductionAssetLayer({THREE,scene,GLTFLoader,registry,onStatus=()=>{}}={}){
 if(!THREE||!scene||!GLTFLoader)throw new Error('THREE, scene and GLTFLoader are required');
 const group=new THREE.Group();group.name='production-assets';scene.add(group);const loader=new GLTFLoader();
 const placements={
  'modern-armchair':[{p:[2.55,0,-2.05],r:[0,.55,0],s:.92}],
  'potted-plant':[{p:[8.15,0,-4.55],r:[0,-.4,0],s:.72},{p:[1.55,0,-4.9],r:[0,.5,0],s:.58}],
  'crystalline-iceplant':[{p:[-7.6,0,-4.7],r:[0,0,0],s:.72}],
  'round-oak-stone-table':[]
 };
 const ready=e=>e&&e.status==='available'&&e.path;
 function load(id,entry,placement){return new Promise(resolve=>loader.load(entry.path,g=>{const o=g.scene||g.scenes?.[0];if(!o)return resolve();o.name=`production:${id}`;o.position.set(...placement.p);o.rotation.set(...placement.r);o.scale.setScalar(placement.s||1);o.traverse(n=>{if(n.isMesh){n.castShadow=true;n.receiveShadow=true}});group.add(o);onStatus({id,state:'loaded'});resolve(o)},undefined,error=>{console.warn('Production asset failed',id,error);onStatus({id,state:'error'});resolve()}))}
 const jobs=[];for(const[id,list]of Object.entries(placements)){const entry=registry?.models?.[id];if(!ready(entry)){onStatus({id,state:'skipped',reason:entry?.status||'unregistered'});continue}for(const p of list)jobs.push(load(id,entry,p))}
 return{group,ready:Promise.all(jobs),dispose(){group.traverse(n=>{n.geometry?.dispose?.();if(n.material){const ms=Array.isArray(n.material)?n.material:[n.material];ms.forEach(m=>m.dispose?.())}});scene.remove(group)}};
}
