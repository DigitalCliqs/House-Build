// Editable architectural shell for the next-generation Anamarija walkthrough.
import { ARCHITECTURE_SPEC } from './architecture-spec-v1.js';
export function createAnamarijaArchitectureShell({THREE,scene}={}){
 if(!THREE||!scene) throw new Error('THREE and scene are required');
 const {house:HOUSE,pool:POOL,rooms:ROOMS,site:SITE}=ARCHITECTURE_SPEC;
 const root=new THREE.Group(); root.name='anamarija-architecture-shell'; scene.add(root);
 const wallMat=new THREE.MeshStandardMaterial({color:0xf1eee8,roughness:.78});
 const ceilingMat=new THREE.MeshStandardMaterial({color:0xf8f5ef,roughness:.86,side:THREE.DoubleSide});
 const marbleMat=new THREE.MeshPhysicalMaterial({color:0xe9e6df,roughness:.28,clearcoat:.12,clearcoatRoughness:.22});
 const oakMat=new THREE.MeshStandardMaterial({color:0xa9794f,roughness:.58}); const terraceMat=new THREE.MeshStandardMaterial({color:0xcfc9bf,roughness:.62});
 const glassMat=new THREE.MeshPhysicalMaterial({color:0xcfe1e7,transmission:.82,transparent:true,opacity:.34,roughness:.06,ior:1.45}); const frameMat=new THREE.MeshStandardMaterial({color:0x25282a,roughness:.34,metalness:.35});
 const waterMat=new THREE.MeshPhysicalMaterial({color:0x64b7c9,transmission:.18,transparent:true,opacity:.78,roughness:.08,clearcoat:.9}); const landscapeMat=new THREE.MeshStandardMaterial({color:0x6f815e,roughness:1});
 const ownedMaterials=[wallMat,ceilingMat,marbleMat,oakMat,terraceMat,glassMat,frameMat,waterMat,landscapeMat];
 function box(name,x,y,z,w,h,d,material,cast=true){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.name=name;m.position.set(x,y,z);m.castShadow=cast;m.receiveShadow=true;root.add(m);return m;}
 function buildWall(w){return w.axis==='x'?box(`wall:${w.id}`,(w.a+w.b)/2,w.height/2,w.fixed,Math.abs(w.b-w.a),w.height,w.thickness,wallMat):box(`wall:${w.id}`,w.fixed,w.height/2,(w.a+w.b)/2,w.thickness,w.height,Math.abs(w.b-w.a),wallMat);}
 function buildGlazing(g){if(g.axis!=='x')return;const width=Math.abs(g.b-g.a),cx=(g.a+g.b)/2,y=g.height/2+.08;box(`glazing:${g.id}:glass`,cx,y,g.fixed,width,g.height,.035,glassMat,false);box(`glazing:${g.id}:frame-left`,g.a,y,g.fixed,.055,g.height+.05,.075,frameMat);box(`glazing:${g.id}:frame-right`,g.b,y,g.fixed,.055,g.height+.05,.075,frameMat);box(`glazing:${g.id}:frame-top`,cx,g.height+.08,g.fixed,width,.055,.075,frameMat);}
 function buildOpeningHead(o){const adjacent=ARCHITECTURE_SPEC.walls.filter(w=>w.axis===o.axis&&Math.abs(w.fixed-o.fixed)<.03);const wallHeight=adjacent.length?Math.max(...adjacent.map(w=>w.height)):3.05;const headH=Math.max(0,wallHeight-o.height);if(headH<=.01)return;const width=Math.abs(o.b-o.a),cx=(o.a+o.b)/2;box(`opening:${o.id}:head`,cx,o.height+headH/2,o.fixed,width,headH,.20,wallMat);}
 box('site-ground',0,-.19,0,SITE.width,.30,SITE.depth,landscapeMat,false);box('house-slab',0,.02,HOUSE.z,HOUSE.width,.10,HOUSE.depth,marbleMat,false);
 for(const room of ROOMS) box(`floor:${room.id}`,room.x,.085,room.z+HOUSE.z,room.w,.025,room.d,room.finish==='wood'?oakMat:marbleMat,false);
 const terrace=ARCHITECTURE_SPEC.terrace;box('terrace',terrace.x,terrace.level,terrace.z,terrace.width,.075,terrace.depth,terraceMat,false);
 for(const wall of ARCHITECTURE_SPEC.walls)buildWall(wall);for(const glazing of ARCHITECTURE_SPEC.glazing)buildGlazing(glazing);for(const opening of ARCHITECTURE_SPEC.openings)buildOpeningHead(opening);
 for(const c of ARCHITECTURE_SPEC.ceilings||[]) box(`ceiling:${c.id}`,c.x,c.height+c.thickness/2,c.z,c.width,c.thickness,c.depth,ceilingMat,false);
 box('pool-shell',POOL.x,-.13,POOL.z,POOL.width+.35,.25,POOL.depth+.35,terraceMat,false);box('pool-water',POOL.x,.015,POOL.z,POOL.width,.035,POOL.depth,waterMat,false);
 root.updateMatrixWorld(true);return{root,spec:ARCHITECTURE_SPEC,dispose(){root.traverse(n=>n.geometry?.dispose?.());for(const m of ownedMaterials)m.dispose();scene.remove(root);}};
}
