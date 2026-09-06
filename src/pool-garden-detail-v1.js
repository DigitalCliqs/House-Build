// Working-design pool accessibility, safety, privacy and evening-lighting layer.
// Dimensions are design targets, not a claim of Croatian regulatory certification.
export function createPoolGardenDetail({THREE,scene}={}){
 if(!THREE||!scene)throw new Error('THREE and scene are required');
 const root=new THREE.Group();root.name='pool-garden-detail';scene.add(root);
 const stone=new THREE.MeshStandardMaterial({color:0xd8d2c8,roughness:.72});
 const bronze=new THREE.MeshStandardMaterial({color:0x4b4540,roughness:.34,metalness:.62});
 const fabric=new THREE.MeshStandardMaterial({color:0xe7e0d5,roughness:.92});
 const hedge=new THREE.MeshStandardMaterial({color:0x40563c,roughness:1});
 const warm=new THREE.MeshStandardMaterial({color:0xffdfad,emissive:0xffc77d,emissiveIntensity:2.2,roughness:.45});
 const mats=[stone,bronze,fabric,hedge,warm];
 function box(n,x,y,z,w,h,d,m,cast=true){const q=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);q.name=n;q.position.set(x,y,z);q.castShadow=cast;q.receiveShadow=true;root.add(q);return q}
 // Pool lift concept on east deck. Clear transfer zone remains unobstructed behind seat.
 const lx=9.0,lz=-9.15;box('pool-access:lift-base',lx,.11,lz,.42,.16,.42,bronze);box('pool-access:lift-post',lx,.73,lz,.11,1.18,.11,bronze);box('pool-access:lift-boom',8.68,1.22,lz,.72,.09,.09,bronze);box('pool-access:lift-seat',8.35,.47,lz,.48,.07,.52,fabric);box('pool-access:lift-back',8.55,.72,lz,.08,.52,.52,fabric);box('pool-access:footrest',8.08,.31,lz,.28,.05,.38,bronze);
 // Visual boundary for the 1.55 x 1.55 m clear transfer/manoeuvring area; flush, not a kerb.
 box('pool-access:clear-zone',9.42,.077,-8.25,1.55,.008,1.55,stone,false);
 // Accessible chaise position with side transfer space, outside the 1.8 m through-route.
 box('pool-access:chaise-base',1.05,.23,-8.05,1.85,.18,.78,bronze);box('pool-access:chaise-cushion',1.05,.36,-8.05,1.72,.18,.70,fabric);box('pool-access:side-table',2.25,.31,-8.05,.48,.06,.48,stone);
 // Dense privacy planting along rear/east boundaries, kept behind paved circulation.
 box('privacy:rear-hedge',0,.88,-18.15,23.2,1.75,.65,hedge);box('privacy:east-hedge',13.05,.88,-10.15,.65,1.75,12.7,hedge);
 // Low bollards light the accessible route without placing obstacles in its clear width.
 const bollards=[[3.72,-6.8],[6.12,-6.8],[7.82,-8.0],[10.15,-8.0],[7.82,-11.3],[10.15,-11.3],[7.82,-13.1],[10.15,-13.1]];
 const lights=[];for(const [i,[x,z]] of bollards.entries()){box(`garden-light:${i}:post`,x,.32,z,.075,.62,.075,bronze);box(`garden-light:${i}:lamp`,x,.65,z,.13,.08,.13,warm,false);const l=new THREE.PointLight(0xffd39b,5.5,3.1,2);l.position.set(x,.72,z);root.add(l);lights.push(l)}
 // Discreet coping marker lights at pool corners; flush geometry avoids raised trip edges.
 for(const [i,[x,z]] of [[.9,-8.2],[8.7,-8.2],[.9,-12.2],[8.7,-12.2]].entries())box(`pool-edge-light:${i}`,x,.085,z,.16,.012,.08,warm,false);
 root.userData.poolLiftConcept={clearDeckWidth:1.55,clearDeckDepth:1.55,seatHeight:.47,status:'working-design'};
 root.userData.accessibleLounging=true;root.updateMatrixWorld(true);
 return{root,lights,dispose(){root.traverse(n=>n.geometry?.dispose?.());mats.forEach(m=>m.dispose());scene.remove(root)}};
}
