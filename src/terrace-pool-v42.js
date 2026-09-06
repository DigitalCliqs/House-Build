// V42 terrace/pool visual refinement, preserving the step-free accessible route.
export function createTerracePoolV42({THREE,scene}={}){
 if(!THREE||!scene)throw new Error('THREE and scene are required');
 const root=new THREE.Group();root.name='terrace-pool-v42';scene.add(root);
 const stone=new THREE.MeshPhysicalMaterial({color:0xded8ce,roughness:.42,clearcoat:.12});
 const fabric=new THREE.MeshPhysicalMaterial({color:0xece5db,roughness:.88,sheen:1,sheenColor:new THREE.Color(0xf3e8d9)});
 const oak=new THREE.MeshStandardMaterial({color:0x96704f,roughness:.50});
 const bronze=new THREE.MeshStandardMaterial({color:0x5c5148,roughness:.31,metalness:.66});
 const green1=new THREE.MeshStandardMaterial({color:0x435c3f,roughness:.95});
 const green2=new THREE.MeshStandardMaterial({color:0x6c805a,roughness:.95});
 const poolGlow=new THREE.MeshStandardMaterial({color:0x9cd7dd,emissive:0x4bb5c0,emissiveIntensity:.55,transparent:true,opacity:.24});
 const mats=[stone,fabric,oak,bronze,green1,green2,poolGlow];
 function box(n,p,s,m,cast=true){const q=new THREE.Mesh(new THREE.BoxGeometry(...s),m);q.name=n;q.position.set(...p);q.castShadow=cast;q.receiveShadow=true;root.add(q);return q}
 function cyl(n,p,r,h,m,seg=32){const q=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg),m);q.name=n;q.position.set(...p);q.castShadow=true;q.receiveShadow=true;root.add(q);return q}
 for(let i=0;i<7;i++)box(`v42:terrace-joint-x-${i}`,[-.1+i*1.8,.084,-5.9],[.012,.004,3.55],bronze,false);
 for(let i=0;i<4;i++)box(`v42:terrace-joint-z-${i}`,[4.7,.084,-4.25-i*1.05],[11.2,.004,.012],bronze,false);
 box('v42:outdoor-sofa-base',[1.2,.23,-6.25],[2.15,.22,.88],bronze);
 for(let i=0;i<2;i++)box(`v42:outdoor-sofa-seat-${i}`,[.70+i*1.0,.42,-6.25],[.92,.22,.78],fabric);
 for(let i=0;i<2;i++)box(`v42:outdoor-sofa-back-${i}`,[.70+i*1.0,.78,-6.58],[.92,.64,.12],fabric);
 cyl('v42:outdoor-table',[2.65,.23,-6.10],.48,.09,stone,48);cyl('v42:outdoor-table-base',[2.65,.12,-6.10],.20,.23,oak,40);
 box('v42:pool-coping-n',[4.8,.092,-8.13],[8.25,.08,.22],stone);
 box('v42:pool-coping-s',[4.8,.092,-12.27],[8.25,.08,.22],stone);
 box('v42:pool-coping-w',[.68,.092,-10.20],[.22,.08,4.05],stone);
 box('v42:pool-coping-e',[8.92,.092,-10.20],[.22,.08,4.05],stone);
 box('v42:pool-water-glow',[4.8,.041,-10.20],[7.88,.018,3.82],poolGlow,false);
 const olives=[[-5.8,-9.0,1.0],[-7.6,-12.1,.88],[11.1,-8.5,.95],[11.2,-13.2,.85],[3.0,-16.5,.92],[7.7,-16.2,.86]];
 for(const [i,[x,z,s]] of olives.entries()){
  cyl(`v42:olive-trunk-${i}`,[x,.75*s,z],.09*s,1.5*s,oak,14);
  for(const [j,[dx,dy,dz]] of [[0,0,0],[.36,.1,.12],[-.32,.06,-.08],[.08,.24,-.28]].entries()){
   const crown=new THREE.Mesh(new THREE.SphereGeometry(.58*s,14,10),j%2?green2:green1);crown.name=`v42:olive-crown-${i}-${j}`;crown.position.set(x+dx*s,1.58*s+dy*s,z+dz*s);crown.scale.set(1.15,.72,1);crown.castShadow=true;root.add(crown);
  }
 }
 const grass=[[-4,-7.9],[-2.8,-7.9],[10.8,-6.8],[12,-7.5],[10.8,-15],[12,-14.3],[-1,-16.7],[1,-16.8]];
 for(const [i,[x,z]] of grass.entries())for(let j=0;j<7;j++){const h=.45+(j%3)*.09;box(`v42:grass-${i}-${j}`,[x+(j-3)*.055,h/2,z+(j%2)*.07],[.025,h,.025],j%2?green2:green1,false)}
 const l1=new THREE.RectAreaLight(0xffd4a7,2.4,5.8,1.4);l1.position.set(5.2,2.55,-6.2);l1.rotation.x=-Math.PI/2;root.add(l1);
 root.userData.accessibleCentreRoutePreserved=true;
 return{root,dispose(){root.traverse(n=>n.geometry?.dispose?.());mats.forEach(m=>m.dispose());scene.remove(root)}};
}
