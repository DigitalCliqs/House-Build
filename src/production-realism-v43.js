// V43 local production-realism pass: deterministic detail maps, soft furnishings and material tuning.
// Keeps the walkthrough self-contained when remote PBR maps are unavailable.
export function createProductionRealismV43({THREE,scene}={}){
 if(!THREE||!scene)throw new Error('THREE and scene are required');
 const root=new THREE.Group();root.name='production-realism-v43';scene.add(root);const textures=[],materials=[];
 function canvasTexture(draw,w=1024,h=1024){const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');draw(ctx,w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;textures.push(t);return t}
 const marbleMap=canvasTexture((c,w,h)=>{c.fillStyle='#eeeae2';c.fillRect(0,0,w,h);let seed=17;const rnd=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);for(let j=0;j<13;j++){const y=h*(.05+rnd()*.9),amp=22+rnd()*62,freq=.003+rnd()*.006;c.beginPath();for(let x=-20;x<w+20;x+=8){const yy=y+Math.sin(x*freq+j)*amp+Math.sin(x*.018+j*1.7)*10;if(x<0)c.moveTo(x,yy);else c.lineTo(x,yy)}c.strokeStyle=j%4===0?'rgba(168,128,86,.34)':'rgba(112,111,108,.28)';c.lineWidth=j%3===0?4:2;c.stroke()}for(let j=0;j<7;j++){c.beginPath();const x=w*rnd();c.moveTo(x,-20);c.bezierCurveTo(x+180*rnd()-90,h*.35,x-160*rnd()+80,h*.7,x+120*rnd()-60,h+20);c.strokeStyle='rgba(125,122,117,.18)';c.lineWidth=1.5;c.stroke()}},1024,1024);
 marbleMap.repeat.set(1.55,.72);
 const fabricMap=canvasTexture((c,w,h)=>{c.fillStyle='#ded5c9';c.fillRect(0,0,w,h);for(let y=0;y<h;y+=4){c.fillStyle=y%8===0?'rgba(255,255,255,.08)':'rgba(85,70,58,.045)';c.fillRect(0,y,w,1)}for(let x=0;x<w;x+=5){c.fillStyle='rgba(90,78,68,.035)';c.fillRect(x,0,1,h)}},512,512);fabricMap.repeat.set(5,5);
 const marble=new THREE.MeshPhysicalMaterial({map:marbleMap,color:0xffffff,roughness:.2,clearcoat:.38,clearcoatRoughness:.15,envMapIntensity:1.4});
 const fabric=new THREE.MeshPhysicalMaterial({map:fabricMap,color:0xf1ece5,roughness:.9,sheen:1,sheenColor:new THREE.Color(0xf8eee2)});
 const sheer=new THREE.MeshPhysicalMaterial({color:0xf6f0e8,roughness:.92,transparent:true,opacity:.64,transmission:.18,side:THREE.DoubleSide});
 const rug=new THREE.MeshPhysicalMaterial({color:0xd8cec1,roughness:.96,sheen:.7,sheenColor:new THREE.Color(0xf5eadc)});
 materials.push(marble,fabric,sheer,rug);
 for(const name of ['v42:island-body','v42:island-top','v42:island-waterfall-L','v42:island-waterfall-R']){const o=scene.getObjectByName(name);if(o)o.material=marble}
 for(const name of ['v42:sofa-seat-0','v42:sofa-seat-1','v42:sofa-seat-2','v42:sofa-back-0','v42:sofa-back-1','v42:sofa-back-2','v42:sofa-chaise-seat','v42:sofa-chaise-back','v42:sofa-arm-left','v42:sofa-arm-right']){const o=scene.getObjectByName(name);if(o)o.material=fabric}
 const rugMesh=new THREE.Mesh(new THREE.BoxGeometry(4.65,.025,2.75),rug);rugMesh.name='v43:living-rug';rugMesh.position.set(4.25,.105,-1.72);rugMesh.receiveShadow=true;root.add(rugMesh);
 // Layered loose cushions soften the procedural sectional silhouette.
 const cushionGeo=new THREE.SphereGeometry(.5,24,16);for(const [i,x,z,sx,sy,sz] of [[0,3.1,-2.58,.72,.52,.18],[1,4.05,-2.58,.78,.55,.18],[2,5.05,-2.58,.72,.52,.18],[3,5.85,-2.1,.65,.48,.16]]){const m=new THREE.Mesh(cushionGeo,fabric);m.name=`v43:cushion-${i}`;m.position.set(x,.86,z);m.scale.set(sx,sy,sz);m.rotation.z=(i%2?-.06:.05);m.castShadow=true;root.add(m)}
 // Full-height sheer curtain folds at the panoramic rear opening, parked clear of the slider centre.
 const foldGeo=new THREE.CylinderGeometry(.075,.075,3.0,16);for(const side of [-1,1]){for(let i=0;i<11;i++){const x=side<0?1.72+i*.105:8.58-i*.105;const m=new THREE.Mesh(foldGeo,sheer);m.name=`v43:curtain-${side}-${i}`;m.position.set(x,1.56,-3.78);m.scale.z=.62;m.castShadow=false;root.add(m)}}
 // Warm-neutral dining rug helps visually zone dining without creating a raised threshold.
 const diningRug=new THREE.Mesh(new THREE.BoxGeometry(3.25,.012,2.15),rug);diningRug.name='v43:dining-rug';diningRug.position.set(6.85,.1,.55);diningRug.receiveShadow=true;root.add(diningRug);
 scene.traverse(o=>{if(!o.isMesh||!o.material)return;const list=Array.isArray(o.material)?o.material:[o.material];for(const m of list){if('envMapIntensity'in m&&/v42:|premium:|production:/.test(o.name||''))m.envMapIntensity=Math.max(m.envMapIntensity||0,1.12)}});
 root.userData.pass='v43-production-realism';return{root,dispose(){root.traverse(n=>n.geometry?.dispose?.());textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());scene.remove(root)}};
}
