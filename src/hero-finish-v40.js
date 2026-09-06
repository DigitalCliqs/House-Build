// V40 hero-route finish layer: reference-led details for Entrance -> Hall -> Living/Dining.
// Geometry stays lightweight and dimensionally controlled; it supplements rather than replaces the architectural shell.
export function createHeroFinishV40({THREE,scene}={}){
 if(!THREE||!scene)throw new Error('THREE and scene are required');
 const root=new THREE.Group();root.name='v40-hero-finish';scene.add(root);
 const oak=new THREE.MeshPhysicalMaterial({color:0x9b6d46,roughness:.44,metalness:0,clearcoat:.06,clearcoatRoughness:.6});
 const ivory=new THREE.MeshPhysicalMaterial({color:0xf0ece4,roughness:.66,metalness:0});
 const stone=new THREE.MeshPhysicalMaterial({color:0xeee8df,roughness:.18,metalness:0,clearcoat:.22,clearcoatRoughness:.18});
 const bronze=new THREE.MeshPhysicalMaterial({color:0x5e4939,roughness:.26,metalness:.72});
 const dark=new THREE.MeshStandardMaterial({color:0x242322,roughness:.34,metalness:.18});
 const glow=new THREE.MeshBasicMaterial({color:0xffd9ad,toneMapped:false});
 const art=new THREE.MeshPhysicalMaterial({color:0xd7cfc2,roughness:.72});
 const box=(name,size,pos,mat)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(...size),mat);o.name=name;o.position.set(...pos);o.castShadow=true;o.receiveShadow=true;root.add(o);return o};
 // Entrance / hall: warm oak slatted feature wall and floating console seen in the approved hero view.
 for(let i=0;i<15;i++)box(`entry-slat-${i}`,[.045,2.65,.11],[-.92+i*.105,1.34,6.72],oak);
 box('entry-console-body',[2.22,.32,.42],[-.22,.64,6.36],oak);
 box('entry-console-stone',[2.28,.035,.46],[-.22,.82,6.36],stone);
 box('entry-art-panel',[1.05,1.65,.045],[-2.25,1.68,5.12],art);
 box('entry-art-frame',[1.13,1.73,.03],[-2.25,1.68,5.09],dark);
 // Living media wall: vertical oak fins, slim dark reveal and floating ivory/stone media ledge.
 for(let i=0;i<19;i++)box(`living-slat-${i}`,[.045,3.15,.13],[8.58+i*.075,1.60,-1.32],oak);
 box('living-media-shadow',[2.18,1.52,.08],[9.28,1.64,-1.49],dark);
 box('living-media-ledger',[2.45,.16,.45],[9.18,.46,-1.20],stone);
 // Layered circular pendants over the hero open-plan zone.
 function ring(name,radius,y,x,z){const g=new THREE.TorusGeometry(radius,.018,12,72);const m=new THREE.Mesh(g,bronze);m.name=name;m.position.set(x,y,z);m.rotation.x=Math.PI/2;m.castShadow=true;root.add(m);const inner=new THREE.Mesh(new THREE.TorusGeometry(radius-.035,.010,8,72),glow);inner.position.copy(m.position);inner.rotation.copy(m.rotation);root.add(inner)}
 ring('living-ring-large',.72,3.35,5.55,-.55);ring('living-ring-mid',.52,3.12,5.55,-.55);ring('living-ring-small',.34,2.91,5.55,-.55);
 // Dining pendants: restrained warm cylinders rather than generic point lights.
 for(const x of [5.75,6.45,7.15]){box('dining-pendant-stem',[.018,.92,.018],[x,3.13,.56],bronze);const shade=new THREE.Mesh(new THREE.CylinderGeometry(.12,.18,.23,32),ivory);shade.position.set(x,2.62,.56);shade.castShadow=true;root.add(shade);const lamp=new THREE.PointLight(0xffd6a6,7.5,2.7,2);lamp.position.set(x,2.48,.56);root.add(lamp)}
 // Concealed cove-light geometry strengthens the layered ceiling read at normal walkthrough distance.
 const strips=[{p:[5.25,3.93,-.46],s:[8.7,.018,.028]},{p:[5.25,3.93,-3.72],s:[8.7,.018,.028]},{p:[.55,3.02,4.85],s:[2.5,.018,.028]}];
 for(const [i,e] of strips.entries()){const s=box(`cove-strip-${i}`,e.s,e.p,glow);s.castShadow=false;const l=new THREE.RectAreaLight(0xffd7ad,1.8,e.s[0],.25);l.position.set(e.p[0],e.p[1]-.03,e.p[2]);l.rotation.x=-Math.PI/2;root.add(l)}
 return{root,dispose(){root.traverse(o=>{o.geometry?.dispose?.();if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose?.())}});scene.remove(root)}};
}
