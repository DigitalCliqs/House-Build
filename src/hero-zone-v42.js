// V42 reference-led kitchen/living refinement for the enlarged Anamarija hero route.
export function createHeroZoneV42({THREE,scene}={}){
 if(!THREE||!scene)throw new Error('THREE and scene are required');
 const root=new THREE.Group();root.name='hero-zone-v42';scene.add(root);
 const ivory=new THREE.MeshPhysicalMaterial({color:0xeee8df,roughness:.82,sheen:1,sheenColor:new THREE.Color(0xf3e9dd)});
 const oak=new THREE.MeshStandardMaterial({color:0x9b6f4b,roughness:.48});
 const oakDark=new THREE.MeshStandardMaterial({color:0x6e4c35,roughness:.46});
 const stone=new THREE.MeshPhysicalMaterial({color:0xf1ede7,roughness:.18,clearcoat:.34,clearcoatRoughness:.16});
 const bronze=new THREE.MeshStandardMaterial({color:0x725d4b,roughness:.26,metalness:.76});
 const black=new THREE.MeshStandardMaterial({color:0x1c1d1e,roughness:.24,metalness:.24});
 const glass=new THREE.MeshPhysicalMaterial({color:0xdde8e9,transmission:.96,transparent:true,opacity:.18,roughness:.025,ior:1.5,thickness:.012,clearcoat:.65});
 const warm=new THREE.MeshStandardMaterial({color:0xffe6c0,emissive:0xffc77d,emissiveIntensity:2.5,roughness:.35});
 const mats=[ivory,oak,oakDark,stone,bronze,black,glass,warm];
 function box(n,p,s,m,cast=true){const q=new THREE.Mesh(new THREE.BoxGeometry(...s),m);q.name=n;q.position.set(...p);q.castShadow=cast;q.receiveShadow=true;root.add(q);return q}
 function cyl(n,p,r,h,m,seg=48){const q=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg),m);q.name=n;q.position.set(...p);q.castShadow=true;q.receiveShadow=true;root.add(q);return q}
 // Softer sectional composition: layered seat cushions, backs and chaise with gaps that read as upholstery rather than blocks.
 const sofaX=4.55,sofaZ=-2.45;
 box('v42:sofa-plinth',[sofaX,.18,sofaZ],[3.55,.16,1.04],oakDark);
 for(let i=0;i<3;i++)box(`v42:sofa-seat-${i}`,[3.45+i*1.08,.43,sofaZ-.02],[1.0,.30,.92],ivory);
 for(let i=0;i<3;i++)box(`v42:sofa-back-${i}`,[3.45+i*1.08,.88,sofaZ-.43],[1.0,.72,.20],ivory);
 box('v42:sofa-chaise-seat',[5.72,.43,-1.63],[1.05,.30,1.72],ivory);
 box('v42:sofa-chaise-back',[5.72,.88,-2.39],[1.05,.72,.20],ivory);
 box('v42:sofa-arm-left',[2.87,.65,sofaZ-.02],[.20,.66,.92],ivory);
 box('v42:sofa-arm-right',[6.28,.65,-1.63],[.20,.66,1.72],ivory);
 // Two-scale coffee table composition from the approved board language.
 cyl('v42:coffee-main',[3.72,.22,-1.26],.74,.12,oak,64);cyl('v42:coffee-main-base',[3.72,.11,-1.26],.31,.22,oakDark,48);
 cyl('v42:coffee-side',[4.72,.18,-1.08],.42,.08,stone,64);cyl('v42:coffee-side-base',[4.72,.09,-1.08],.16,.18,bronze,40);
 // Full kitchen wall: tall warm-oak fronts, integrated appliance stack, niche and under-cabinet line.
 box('v42:kitchen-wall-backing',[8.72,1.55,5.25],[3.45,3.10,.16],oakDark);
 for(let i=0;i<5;i++){const x=7.34+i*.68;box(`v42:kitchen-door-${i}`,[x,1.58,5.12],[.62,3.00,.08],oak);}
 box('v42:appliance-oven-upper',[9.34,1.93,5.05],[.62,.63,.055],black,false);
 box('v42:appliance-oven-lower',[9.34,1.20,5.05],[.62,.63,.055],black,false);
 box('v42:kitchen-niche',[7.62,1.40,5.02],[.92,.88,.06],black,false);
 box('v42:kitchen-niche-shelf',[7.62,1.02,4.98],[.92,.04,.25],stone);
 box('v42:kitchen-underlight',[7.62,1.90,4.96],[.88,.025,.03],warm,false);
 // Island: continuous Calacatta waterfall skin, recessed dark plinth and slim shadow gap.
 box('v42:island-plinth',[5.02,.10,3.25],[2.88,.16,.92],black);
 box('v42:island-body',[5.02,.50,3.25],[3.08,.78,1.05],stone);
 box('v42:island-top',[5.02,.94,3.25],[3.34,.07,1.22],stone);
 box('v42:island-waterfall-L',[3.37,.50,3.25],[.07,.88,1.22],stone);
 box('v42:island-waterfall-R',[6.67,.50,3.25],[.07,.88,1.22],stone);
 box('v42:island-shadowgap',[5.02,.17,2.70],[2.78,.035,.035],black,false);
 // Minimal integrated tap and sink read from hallway approach.
 box('v42:island-sink',[5.15,.975,3.18],[.68,.015,.38],black,false);
 box('v42:island-tap-upright',[5.55,1.18,3.35],[.035,.42,.035],bronze);
 box('v42:island-tap-spout',[5.43,1.38,3.35],[.28,.035,.035],bronze);
 // Glazing overlay gives the principal rear opening cleaner physically-based highlights.
 box('v42:rear-glass-left',[2.76,1.61,-3.915],[1.68,3.08,.012],glass,false);
 box('v42:rear-glass-right',[7.50,1.61,-3.915],[2.20,3.08,.012],glass,false);
 box('v42:slider-glass',[5.00,1.58,-3.905],[2.56,3.05,.012],glass,false);
 // Curtain pockets and soft ceiling perimeter deepen the architectural reference read.
 box('v42:curtain-pocket',[5.18,3.74,-3.72],[7.35,.10,.16],oakDark,false);
 box('v42:living-cove-strip',[5.18,3.75,2.16],[7.15,.025,.025],warm,false);
 root.userData.pass='v42-kitchen-living';
 return{root,dispose(){root.traverse(n=>n.geometry?.dispose?.());mats.forEach(m=>m.dispose());scene.remove(root)}};
}
