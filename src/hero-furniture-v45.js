// V45 hero furniture pass: rounded sectional, premium dining set and appliance/front detailing.
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export function createHeroFurnitureV45({THREE,scene}={}){
  if(!THREE||!scene)throw new Error('THREE and scene are required');
  const root=new THREE.Group(); root.name='hero-furniture-v45'; scene.add(root);

  // Hide lower-fidelity placeholders replaced by this pass.
  scene.traverse(o=>{
    const n=o.name||'';
    if(/^v42:sofa-|^v43:cushion-|^dining-table-|^dining-leg$|^dining-chair-/.test(n))o.visible=false;
  });

  const fabric=new THREE.MeshPhysicalMaterial({color:0xeee7dd,roughness:.86,sheen:1,sheenColor:new THREE.Color(0xfff3e5),envMapIntensity:1.05});
  const fabricShadow=new THREE.MeshPhysicalMaterial({color:0xcfc5b8,roughness:.9,sheen:.6,sheenColor:new THREE.Color(0xeadfd2),envMapIntensity:.85});
  const oak=new THREE.MeshPhysicalMaterial({color:0x9a6d49,roughness:.42,clearcoat:.08,clearcoatRoughness:.35,envMapIntensity:1.15});
  const bronze=new THREE.MeshStandardMaterial({color:0x675143,roughness:.24,metalness:.82,envMapIntensity:1.4});
  const black=new THREE.MeshPhysicalMaterial({color:0x171818,roughness:.16,metalness:.25,clearcoat:.28,clearcoatRoughness:.14,envMapIntensity:1.55});
  const glass=new THREE.MeshPhysicalMaterial({color:0x1e2223,roughness:.08,metalness:.1,transmission:.12,transparent:true,opacity:.88,clearcoat:.55,clearcoatRoughness:.08,envMapIntensity:1.6});
  const materials=[fabric,fabricShadow,oak,bronze,black,glass];

  function rounded(name,size,pos,mat,r=.09,segments=5){
    const g=new RoundedBoxGeometry(size[0],size[1],size[2],segments,r);
    const m=new THREE.Mesh(g,mat);m.name=name;m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;root.add(m);return m;
  }
  function box(name,size,pos,mat){const m=new THREE.Mesh(new THREE.BoxGeometry(...size),mat);m.name=name;m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;root.add(m);return m}
  function cyl(name,r,h,pos,mat,segments=40){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,segments),mat);m.name=name;m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;root.add(m);return m}

  // Living sectional: lower, deeper and visibly upholstered, with separated modules and loose backs.
  const seatXs=[3.34,4.32,5.30];
  for(let i=0;i<seatXs.length;i++){
    rounded(`v45:sofa-seat-${i}`,[.92,.30,.92],[seatXs[i],.43,-2.47],fabric,.12,7);
    const back=rounded(`v45:sofa-back-${i}`,[.88,.60,.22],[seatXs[i],.83,-2.83],fabric,.10,7);back.rotation.x=-.08;
  }
  rounded('v45:sofa-chaise',[1.00,.30,1.68],[5.92,.43,-1.75],fabric,.12,7);
  const chaiseBack=rounded('v45:sofa-chaise-back',[.96,.60,.22],[5.92,.83,-2.48],fabric,.10,7);chaiseBack.rotation.x=-.08;
  rounded('v45:sofa-arm-left',[.20,.55,.94],[2.79,.62,-2.47],fabricShadow,.08,6);
  rounded('v45:sofa-arm-right',[.20,.55,1.70],[6.48,.62,-1.75],fabricShadow,.08,6);
  box('v45:sofa-shadow-plinth',[3.72,.10,1.02],[4.60,.18,-2.45],fabricShadow);
  // Loose cushions with slight asymmetry.
  for(const [i,x,z,rz] of [[0,3.05,-2.61,.06],[1,4.03,-2.62,-.05],[2,5.05,-2.60,.04],[3,6.05,-2.08,-.07]]){
    const c=rounded(`v45:scatter-${i}`,[.64,.54,.16],[x,.92,z],fabric,.10,7);c.rotation.z=rz;
  }

  // Dining table: eased warm-oak slab with two sculptural pedestal bases.
  rounded('v45:dining-top',[2.88,.10,1.08],[6.55,.79,.56],oak,.05,5);
  for(const x of [5.72,7.38]){
    const stem=cyl('v45:dining-pedestal-stem',.13,.62,[x,.40,.56],bronze,48);
    const foot=rounded('v45:dining-pedestal-foot',[.64,.08,.52],[x,.08,.56],bronze,.04,4);
    stem.castShadow=foot.castShadow=true;
  }

  function addChair(i,x,z,rotY){
    const g=new THREE.Group();g.name=`v45:dining-chair-${i}`;g.position.set(x,0,z);g.rotation.y=rotY;root.add(g);
    const seat=new THREE.Mesh(new RoundedBoxGeometry(.50,.12,.50,6,.07),fabric);seat.position.y=.49;seat.castShadow=true;g.add(seat);
    const back=new THREE.Mesh(new RoundedBoxGeometry(.51,.66,.13,7,.07),fabric);back.position.set(0,.84,-.20);back.rotation.x=-.10;back.castShadow=true;g.add(back);
    for(const sx of [-.18,.18])for(const sz of [-.16,.16]){
      const leg=new THREE.Mesh(new THREE.CylinderGeometry(.018,.026,.43,16),bronze);leg.position.set(sx,.24,sz);leg.rotation.z=sx*.06;leg.castShadow=true;g.add(leg);
    }
  }
  let ci=0;
  for(const x of [5.48,6.18,6.88,7.58])addChair(ci++,x,-.22,0);
  for(const x of [5.48,6.18,6.88,7.58])addChair(ci++,x,1.34,Math.PI);

  // Kitchen appliance/front refinement layered over the V42 cabinetry.
  for(let i=0;i<5;i++){
    const x=7.34+i*.68;
    box(`v45:kitchen-reveal-${i}`,[.015,2.82,.018],[x+.325,1.58,5.065],black);
  }
  for(const [name,y] of [['upper',1.93],['lower',1.20]]){
    rounded(`v45:oven-${name}`,[.58,.58,.05],[9.34,y,5.015],black,.025,5);
    rounded(`v45:oven-glass-${name}`,[.43,.35,.012],[9.34,y,4.984],glass,.018,5);
    cyl(`v45:oven-dial-${name}`, .025,.022,[9.13,y+.21,4.963],bronze,24).rotation.x=Math.PI/2;
  }
  // Integrated fridge/freezer shadow lines and long bronze pull detail.
  box('v45:fridge-mid-reveal',[.58,.018,.018],[8.66,1.53,5.045],black);
  box('v45:fridge-pull',[.022,1.18,.028],[8.38,1.62,4.99],bronze);
  // Island seating: slim sculptural stools replacing basic blocks.
  for(const x of [4.18,5.05,5.92]){
    rounded('v45:island-stool-seat',[.46,.11,.42],[x,.67,2.43],fabric,.07,5);
    const stem=cyl('v45:island-stool-stem',.035,.57,[x,.36,2.43],bronze,24);
    const base=cyl('v45:island-stool-base',.20,.035,[x,.06,2.43],bronze,36);
    stem.castShadow=base.castShadow=true;
  }

  root.userData.pass='v45-hero-furniture';
  return{root,dispose(){root.traverse(n=>n.geometry?.dispose?.());materials.forEach(m=>m.dispose());scene.remove(root)}};
}
