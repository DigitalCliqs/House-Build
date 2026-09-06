// Premium architectural detailing for the entrance -> hallway -> living/kitchen/dining -> terrace sequence.
// Lightweight/mobile-safe detailing; production furniture remains registry-driven.
import { ARCHITECTURE_SPEC } from './architecture-spec-v1.js';
export function createPremiumOpenPlanZone({ THREE, scene } = {}) {
 if(!THREE||!scene)throw new Error('THREE and scene are required');
 const root=new THREE.Group();root.name='premium-open-plan-zone';scene.add(root);
 const warmWhite=new THREE.MeshStandardMaterial({color:0xf5f0e8,roughness:.66}),oak=new THREE.MeshStandardMaterial({color:0xa87950,roughness:.46}),darkOak=new THREE.MeshStandardMaterial({color:0x5a4334,roughness:.48}),bronze=new THREE.MeshStandardMaterial({color:0x8f765c,roughness:.28,metalness:.78}),stone=new THREE.MeshPhysicalMaterial({color:0xf2eee8,roughness:.24,clearcoat:.2,clearcoatRoughness:.18}),softBlack=new THREE.MeshStandardMaterial({color:0x1f2224,roughness:.32,metalness:.28}),emissive=new THREE.MeshStandardMaterial({color:0xffe2b7,emissive:0xffc982,emissiveIntensity:2,roughness:.4});
 const ownedMaterials=[warmWhite,oak,darkOak,bronze,stone,softBlack,emissive];
 function box(name,x,y,z,w,h,d,material,cast=true){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.name=name;m.position.set(x,y,z);m.castShadow=cast;m.receiveShadow=true;root.add(m);return m}
 // Entrance portal + feature console.
 box('premium:entrance-portal-left',-.28,1.35,7.80,.13,2.70,.20,bronze);box('premium:entrance-portal-right',1.23,1.35,7.80,.13,2.70,.20,bronze);box('premium:entrance-portal-head',.475,2.68,7.80,1.64,.14,.20,bronze);box('premium:entry-console',.15,.47,5.75,1.70,.82,.42,darkOak);box('premium:entry-console-top',.15,.90,5.75,1.78,.05,.46,stone);
 // Lower hallway ceiling remains intimate before the day zone opens upward.
 box('premium:hall-ceiling',.35,2.91,4.55,2.55,.14,4.30,warmWhite,false);box('premium:hall-cove-left',-.90,2.82,4.55,.035,.035,4.05,emissive,false);box('premium:hall-cove-right',1.60,2.82,4.55,.035,.035,4.05,emissive,false);
 // 4.10 m day-zone composition: a shallow floating raft sits below the raised sealed ceiling,
 // preserving the vertical volume rather than recreating the former ~3 m false ceiling.
 const dayCeiling=4.10,raftY=3.86,coveY=3.77;
 box('premium:living-ceiling-raft',5.15,raftY,-.05,7.65,.10,4.65,warmWhite,false);
 box('premium:cove-north',5.15,coveY,2.25,7.25,.025,.035,emissive,false);box('premium:cove-south',5.15,coveY,-2.35,7.25,.025,.035,emissive,false);box('premium:cove-west',1.53,coveY,-.05,.035,.025,4.55,emissive,false);box('premium:cove-east',8.77,coveY,-.05,.035,.025,4.55,emissive,false);
 // Slim transition reveal emphasizes the step from the 3.45 m transition ceiling into the 4.10 m volume.
 box('premium:day-zone-transition-reveal',2.62,3.43,1.18,.045,.16,2.35,bronze,false);
 // Living media wall is extended to suit the taller room.
 box('premium:media-wall',9.95,1.72,-1.45,.22,3.35,3.10,darkOak);for(let i=0;i<14;i++)box(`premium:media-slat-${i}`,9.80,1.72,-2.80+i*.205,.08,3.30,.055,oak);box('premium:media-screen',9.65,1.75,-1.25,.035,1.55,2.42,softBlack,false);box('premium:media-low-unit',9.58,.36,-1.25,.42,.55,2.55,warmWhite);
 // Full-height kitchen joinery.
 box('premium:kitchen-tall-units',8.75,1.60,4.95,3.10,3.10,.62,oak);for(let i=1;i<5;i++)box(`premium:kitchen-tall-joint-${i}`,7.20+i*.62,1.60,4.62,.018,2.95,.02,bronze,false);box('premium:kitchen-appliance-bank',9.34,1.55,4.60,.78,1.82,.05,softBlack,false);
 // Fixed joinery island shell; production asset can replace this later.
 box('premium:island-base',5,.47,3.25,3.25,.90,1.15,warmWhite);box('premium:island-top',5,.94,3.25,3.36,.06,1.27,stone);box('premium:island-waterfall-left',3.35,.48,3.25,.06,.92,1.27,stone);box('premium:island-waterfall-right',6.65,.48,3.25,.06,.92,1.27,stone);
 // Pendants now hang from the raised ceiling, making the extra height legible at eye level.
 [0,.26].forEach((offset,index)=>{const torus=new THREE.Mesh(new THREE.TorusGeometry(index?.46:.62,.018,10,48),bronze);torus.name=`premium:dining-ring-${index}`;torus.rotation.x=Math.PI/2;torus.position.set(6.85,3.05-offset,.55);torus.castShadow=true;root.add(torus);box(`premium:dining-drop-${index}`,6.85,3.52-offset/2,.55,.018,.90+offset,.018,bronze,false)});
 const t=ARCHITECTURE_SPEC.terrace;box('premium:terrace-soffit',t.x,2.75,t.z,t.width,.11,t.depth,warmWhite,false);box('premium:terrace-linear-light',t.x,2.68,t.z+t.depth/2-.25,t.width-.8,.025,.025,emissive,false);
 const warm=0xffd4a1,lightPositions=[[.45,2.55,5.20,16],[5,3.62,3.20,20],[6.85,3.35,.55,22],[5.10,3.45,-1.85,18],[4.70,2.55,-5.80,14]];const lights=lightPositions.map(([x,y,z,intensity])=>{const l=new THREE.PointLight(warm,intensity,5.4,2);l.position.set(x,y,z);l.castShadow=false;root.add(l);return l});
 root.userData.dayZoneCeilingHeight=dayCeiling;root.updateMatrixWorld(true);return{root,lights,dispose(){root.traverse(n=>n.geometry?.dispose?.());ownedMaterials.forEach(m=>m.dispose());scene.remove(root)}};
}
