// Editable architectural shell for the next-generation Anamarija walkthrough.
import { ARCHITECTURE_SPEC } from './architecture-spec-v1.js';
export function createAnamarijaArchitectureShell({THREE,scene}={}){
 if(!THREE||!scene) throw new Error('THREE and scene are required');
 const {house:HOUSE,pool:POOL,rooms:ROOMS,site:SITE}=ARCHITECTURE_SPEC;
 const root=new THREE.Group(); root.name='anamarija-architecture-shell'; scene.add(root);
 const wallMat=new THREE.MeshStandardMaterial({color:0xf1eee8,roughness:.78});
 const ceilingMat=new THREE.MeshStandardMaterial({color:0xf8f5ef,roughness:.86,side:THREE.DoubleSide});
 const marbleMat=new THREE.MeshPhysicalMaterial({color:0xe9e6df,roughness:.28,clearcoat:.12,clearcoatRoughness:.22});
 const oakMat=new THREE.MeshStandardMaterial({color:0xa9794f,roughness:.58});
 const terraceMat=new THREE.MeshStandardMaterial({color:0xcfc9bf,roughness:.62});
 const glassMat=new THREE.MeshPhysicalMaterial({color:0xdce8ea,transmission:.9,transparent:true,opacity:.26,roughness:.035,ior:1.48,thickness:.012});
 const frameMat=new THREE.MeshStandardMaterial({color:0x25282a,roughness:.28,metalness:.55});
 const doorMat=new THREE.MeshStandardMaterial({color:0x9b704b,roughness:.46});
 const soffitMat=new THREE.MeshStandardMaterial({color:0xe8e2d8,roughness:.72});
 const waterMat=new THREE.MeshPhysicalMaterial({color:0x64b7c9,transmission:.18,transparent:true,opacity:.78,roughness:.08,clearcoat:.9});
 const landscapeMat=new THREE.MeshStandardMaterial({color:0x6f815e,roughness:1});
 const ownedMaterials=[wallMat,ceilingMat,marbleMat,oakMat,terraceMat,glassMat,frameMat,doorMat,soffitMat,waterMat,landscapeMat];
 function box(name,x,y,z,w,h,d,material,cast=true){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.name=name;m.position.set(x,y,z);m.castShadow=cast;m.receiveShadow=true;root.add(m);return m;}
 function buildWall(w){return w.axis==='x'?box(`wall:${w.id}`,(w.a+w.b)/2,w.height/2,w.fixed,Math.abs(w.b-w.a),w.height,w.thickness,wallMat):box(`wall:${w.id}`,w.fixed,w.height/2,(w.a+w.b)/2,w.thickness,w.height,Math.abs(w.b-w.a),wallMat);}
 function buildGlazing(g){
  const width=Math.abs(g.b-g.a),c=(g.a+g.b)/2,y=g.height/2+.08,frame=.055,depth=.075;
  if(g.axis==='x'){
   box(`glazing:${g.id}:glass`,c,y,g.fixed,width,g.height,.028,glassMat,false);
   box(`glazing:${g.id}:frame-left`,g.a,y,g.fixed,frame,g.height+.05,depth,frameMat);box(`glazing:${g.id}:frame-right`,g.b,y,g.fixed,frame,g.height+.05,depth,frameMat);box(`glazing:${g.id}:frame-top`,c,g.height+.08,g.fixed,width,frame,depth,frameMat);box(`glazing:${g.id}:sill`,c,.075,g.fixed,width,.045,.11,frameMat);
   if(width>2.4) box(`glazing:${g.id}:mullion`,c,y,g.fixed,frame,g.height,depth,frameMat);
  } else {
   box(`glazing:${g.id}:glass`,g.fixed,y,c,.028,g.height,width,glassMat,false);
   box(`glazing:${g.id}:frame-a`,g.fixed,y,g.a,depth,g.height+.05,frame,frameMat);box(`glazing:${g.id}:frame-b`,g.fixed,y,g.b,depth,g.height+.05,frame,frameMat);box(`glazing:${g.id}:frame-top`,g.fixed,g.height+.08,c,depth,frame,width,frameMat);
  }
 }
 function wallHeightAt(o){const adjacent=ARCHITECTURE_SPEC.walls.filter(w=>w.axis===o.axis&&Math.abs(w.fixed-o.fixed)<.03);return adjacent.length?Math.max(...adjacent.map(w=>w.height)):3.05;}
 function buildOpening(o){
  const wallHeight=wallHeightAt(o),headH=Math.max(0,wallHeight-o.height),width=Math.abs(o.b-o.a),c=(o.a+o.b)/2,t=.20,j=.065;
  if(headH>.01){if(o.axis==='x')box(`opening:${o.id}:head`,c,o.height+headH/2,o.fixed,width,headH,t,wallMat);else box(`opening:${o.id}:head`,o.fixed,o.height+headH/2,c,t,headH,width,wallMat);}
  // All openings get a proper jamb/head frame but remain physically open unless the spec explicitly marks a closed leaf.
  if(o.axis==='x'){
   box(`opening:${o.id}:jamb-a`,o.a,o.height/2,o.fixed,j,o.height,.13,frameMat);box(`opening:${o.id}:jamb-b`,o.b,o.height/2,o.fixed,j,o.height,.13,frameMat);box(`opening:${o.id}:frame-head`,c,o.height,o.fixed,width,j,.13,frameMat);
   if(o.closed===true) box(`opening:${o.id}:leaf`,c,o.height/2,o.fixed,width-.08,o.height-.06,.045,doorMat);
  }else{
   box(`opening:${o.id}:jamb-a`,o.fixed,o.height/2,o.a,.13,o.height,j,frameMat);box(`opening:${o.id}:jamb-b`,o.fixed,o.height/2,o.b,.13,o.height,j,frameMat);box(`opening:${o.id}:frame-head`,o.fixed,o.height,c,.13,j,width,frameMat);
   if(o.closed===true) box(`opening:${o.id}:leaf`,o.fixed,o.height/2,c,.045,o.height-.06,width-.08,doorMat);
  }
 }
 box('site-ground',0,-.19,0,SITE.width,.30,SITE.depth,landscapeMat,false);box('house-slab',0,.02,HOUSE.z,HOUSE.width,.10,HOUSE.depth,marbleMat,false);
 for(const room of ROOMS) box(`floor:${room.id}`,room.x,.085,room.z+HOUSE.z,room.w,.025,room.d,room.finish==='wood'?oakMat:marbleMat,false);
 const terrace=ARCHITECTURE_SPEC.terrace;box('terrace',terrace.x,terrace.level,terrace.z,terrace.width,.075,terrace.depth,terraceMat,false);
 for(const wall of ARCHITECTURE_SPEC.walls)buildWall(wall);for(const glazing of ARCHITECTURE_SPEC.glazing)buildGlazing(glazing);for(const opening of ARCHITECTURE_SPEC.openings)buildOpening(opening);
 for(const c of ARCHITECTURE_SPEC.ceilings||[]) box(`ceiling:${c.id}`,c.x,c.height+c.thickness/2,c.z,c.width,c.thickness,c.depth,ceilingMat,false);
 // Covered terrace/entrance soffits visually close the sheltered external zones while keeping circulation openings clear.
 box('soffit:terrace',terrace.x,3.08,terrace.z,terrace.width,.12,Math.min(2.15,terrace.depth),soffitMat,false);
 const entrance=ARCHITECTURE_SPEC.openings.find(o=>o.id==='front-entrance');if(entrance)box('soffit:entrance',(entrance.a+entrance.b)/2,3.08,entrance.fixed+.72,Math.max(2.5,entrance.clearWidth+1.1),.12,1.45,soffitMat,false);
 box('pool-shell',POOL.x,-.13,POOL.z,POOL.width+.35,.25,POOL.depth+.35,terraceMat,false);box('pool-water',POOL.x,.015,POOL.z,POOL.width,.035,POOL.depth,waterMat,false);
 root.updateMatrixWorld(true);return{root,spec:ARCHITECTURE_SPEC,dispose(){root.traverse(n=>n.geometry?.dispose?.());for(const m of ownedMaterials)m.dispose();scene.remove(root);}};
}
