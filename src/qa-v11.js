import * as THREE from 'three';

// V11 is a non-destructive visual-quality layer over the V10 architectural QA scene.
// Capture the V10 scene as it is constructed, then replace flat placeholder materials
// with photographic PBR maps and add the small-scale geometry needed for believable scale.
let capturedScene=null;
const originalAdd=THREE.Scene.prototype.add;
THREE.Scene.prototype.add=function(...objects){capturedScene=this;return originalAdd.apply(this,objects)};
await import('./qa-v10.js?v=11-base');
THREE.Scene.prototype.add=originalAdd;
const scene=capturedScene;
if(!scene) throw new Error('V11 could not capture V10 scene');

const loader=new THREE.TextureLoader();
loader.setCrossOrigin('anonymous');
const tex=(url,repeat=[1,1])=>{const t=loader.load(url);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(...repeat);t.anisotropy=8;return t};
const data=(url,repeat=[1,1])=>{const t=loader.load(url);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(...repeat);t.anisotropy=8;return t};
const PH='https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k';

// CC0 photographic PBR sources. 1K is deliberate for phone GPU memory; desktop can later move to 2K.
const marble={
 map:tex(`${PH}/marble_01/marble_01_diff_1k.jpg`,[3.2,3.2]),
 normalMap:data(`${PH}/marble_01/marble_01_nor_gl_1k.jpg`,[3.2,3.2]),
 roughnessMap:data(`${PH}/marble_01/marble_01_rough_1k.jpg`,[3.2,3.2])
};
const oak={
 map:tex(`${PH}/herringbone_parquet/herringbone_parquet_diff_1k.jpg`,[2.2,2.2]),
 normalMap:data(`${PH}/herringbone_parquet/herringbone_parquet_nor_gl_1k.jpg`,[2.2,2.2]),
 roughnessMap:data(`${PH}/herringbone_parquet/herringbone_parquet_rough_1k.jpg`,[2.2,2.2])
};
const stone={
 map:tex(`${PH}/stone_tiles/stone_tiles_diff_1k.jpg`,[1.4,1.4]),
 normalMap:data(`${PH}/stone_tiles/stone_tiles_nor_gl_1k.jpg`,[1.4,1.4]),
 roughnessMap:data(`${PH}/stone_tiles/stone_tiles_rough_1k.jpg`,[1.4,1.4])
};

function near(c,hex,tol=26){const r=(hex>>16)&255,g=(hex>>8)&255,b=hex&255;return Math.abs(c.r*255-r)<tol&&Math.abs(c.g*255-g)<tol&&Math.abs(c.b*255-b)<tol}
scene.traverse(o=>{if(!o.isMesh||!o.material||!o.material.color)return;const m=o.material;
  // V10 marble placeholder -> photographic marble PBR.
  if(near(m.color,0xf2efe8,34)){o.material=new THREE.MeshPhysicalMaterial({...marble,color:0xffffff,roughness:.28,metalness:0,clearcoat:.18,clearcoatRoughness:.2});}
  // Oak / dark oak placeholders -> real herringbone where horizontal, restrained oak elsewhere.
  else if(near(m.color,0x9b7048,30)||near(m.color,0x4b382c,25)){o.material=new THREE.MeshStandardMaterial({...oak,color:near(m.color,0x4b382c,25)?0x8b735e:0xffffff,roughness:.42});}
  // Grey stone feature walls -> photographic stone.
  else if(near(m.color,0x6d6a64,28)){o.material=new THREE.MeshStandardMaterial({...stone,color:0xb7b1a8,roughness:.82});}
});

const plaster=new THREE.MeshStandardMaterial({color:0xf3efe8,roughness:.72});
const graphite=new THREE.MeshStandardMaterial({color:0x1e2327,roughness:.28,metalness:.55});
const bronze=new THREE.MeshStandardMaterial({color:0xb18a61,roughness:.22,metalness:.78});
const warm=new THREE.MeshStandardMaterial({color:0xffe0ae,roughness:.7,emissive:0xffb96b,emissiveIntensity:.8});
const leaf=new THREE.MeshStandardMaterial({color:0x355b35,roughness:.9});
const pot=new THREE.MeshStandardMaterial({color:0x3c3a37,roughness:.5});
const fabric=new THREE.MeshStandardMaterial({color:0xd8d0c5,roughness:.92});
const glass=new THREE.MeshPhysicalMaterial({color:0xe9f5f8,roughness:.02,transmission:.92,transparent:true,opacity:.34,ior:1.48,thickness:.04,metalness:0});
function box(x,y,z,w,h,d,mat=plaster){const q=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);q.position.set(x,y,z);q.castShadow=q.receiveShadow=true;scene.add(q);return q}
function cyl(x,y,z,r,h,mat=graphite,seg=24){const q=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg),mat);q.position.set(x,y,z);q.castShadow=q.receiveShadow=true;scene.add(q);return q}

// Roof micro-detail: tile courses and ridge caps. This removes the large flat 'cardboard roof' read.
const tileMat=new THREE.MeshStandardMaterial({color:0x292f34,roughness:.72,metalness:.05});
for(const spec of [[-4.25,2.45,13.25,11.1,3.07],[5,1.25,9.9,10,3.57],[.95,6.25,4.9,3.8,3.24]]){
 const [cx,cz,w,d,e]=spec;
 for(let z=cz-d/2+.35;z<cz+d/2;z+=.42) box(cx,e+.025,z,w+.05,.035,.045,tileMat);
}

// Window reveals, mullions and sill depth for architectural realism.
for(const [x,y,z,w,h,rot] of [[5,1.45,-3.61,6.8,2.65,0],[5.2,1.4,6.09,4.8,2.5,0],[-7.15,1.35,-3.06,3.3,2.32,0],[-3.25,1.35,-3.06,2.5,2.32,0]]){
 for(let i=1;i<Math.ceil(w/1.25);i++){const xx=x-w/2+i*(w/Math.ceil(w/1.25));box(xx,y,z,.045,h,.09,graphite)}
 box(x,.13,z,w+.18,.08,.28,plaster);
}

// Warm architectural lighting: eaves, entrance, terrace and interior pools of light.
for(let x=-8.5;x<=8.5;x+=2.15){const p=new THREE.PointLight(0xffc77d,5.5,4.8,2);p.position.set(x,2.75,-3.75);scene.add(p);cyl(x,2.82,-3.72,.045,.035,warm,12)}
for(const [x,z] of [[-.2,7.65],[1.2,7.65],[2.2,-5.0],[4.4,-5.0],[6.6,-5.0],[8.4,-5.0]]){const p=new THREE.PointLight(0xffc27a,6,5,2);p.position.set(x,2.55,z);scene.add(p);cyl(x,2.6,z,.05,.035,warm,12)}

// Human-scale interior details visible from the fixed cameras.
// Kitchen: tall joinery, island waterfall sides, stools, pendants.
for(let x=3.1;x<=7.1;x+=.72) box(x,1.35,5.62,.67,2.45,.62,new THREE.MeshStandardMaterial({color:0xb69a7c,roughness:.42}));
box(4.95,.55,3.38,3.35,1.0,1.12,new THREE.MeshStandardMaterial({color:0xe6ded2,roughness:.35}));
box(4.95,1.07,3.38,3.42,.08,1.18,new THREE.MeshPhysicalMaterial({...marble,color:0xffffff,roughness:.2,clearcoat:.2}));
for(const x of [4.0,4.95,5.9]){cyl(x,.47,2.62,.18,.72,bronze);box(x,.86,2.62,.48,.12,.45,fabric);const cord=cyl(x,2.45,3.35,.012,1.1,graphite,10);const shade=new THREE.Mesh(new THREE.ConeGeometry(.18,.25,24,1,true),bronze);shade.position.set(x,1.82,3.35);scene.add(shade)}

// Dining table + upholstered chairs.
box(6.15,.76,.82,2.8,.10,1.18,new THREE.MeshPhysicalMaterial({...marble,color:0xf7f2ea,roughness:.24}));
for(const [x,z,r] of [[5.0,.15,0],[6.0,.15,0],[7.0,.15,0],[5,1.48,Math.PI],[6,1.48,Math.PI],[7,1.48,Math.PI]]){box(x,.55,z,.56,.72,.55,fabric);box(x,.93,z+.18*(r?1:-1),.56,.65,.12,fabric)}

// Living upholstery, rug, coffee table and decor.
box(4.9,.08,-1.65,4.8,.025,2.5,new THREE.MeshStandardMaterial({color:0xd8d0c4,roughness:1}));
box(4.85,.45,-1.2,3.25,.58,.92,fabric);box(6.18,.45,-.28,.92,.58,1.85,fabric);
for(const x of [3.65,4.55,5.45]) box(x,.78,-.82,.75,.55,.14,fabric);
cyl(4.7,.43,-2.0,.62,.08,new THREE.MeshPhysicalMaterial({...marble,color:0xf7f2ea,roughness:.2}),48);

// Large planters with layered foliage rather than single spheres.
for(const [x,z,s] of [[1.25,-3.05,.9],[8.2,-2.9,.85],[2.4,5.45,.72],[-.15,7.35,.72]]){
 const p=new THREE.Mesh(new THREE.CylinderGeometry(.32*s,.25*s,.72*s,28),pot);p.position.set(x,.36*s,z);scene.add(p);
 for(let i=0;i<13;i++){const a=i/13*Math.PI*2,rr=.18+.28*(i%3)/2;const l=new THREE.Mesh(new THREE.SphereGeometry(.16*s,14,9),leaf);l.scale.set(.65,2.2,.35);l.rotation.z=(i%2?.45:-.45);l.position.set(x+Math.cos(a)*rr,.85*s+(i%4)*.16,z+Math.sin(a)*rr);l.castShadow=true;scene.add(l)}
}

// Glass balanceless shower hint in the visible private wing for later interior cameras.
box(-3.0,1.15,3.8,.035,2.2,1.65,glass);box(-2.2,1.15,4.6,1.6,2.2,.035,glass);

// Add soft fill lights inside so glazing reads as an inhabited premium interior, not a dark box.
for(const [x,z,intensity] of [[5,-1,18],[5,3.4,15],[6.2,.8,12],[-5,1.8,10]]){const p=new THREE.PointLight(0xffdfb7,intensity,8,2);p.position.set(x,2.45,z);scene.add(p)}

// Quality marker for QA UI / diagnostics.
window.__QA_V11__={scene,photographicPBR:true,referenceTarget:'Domprojekt Anamarija premium render board',textureSource:'Poly Haven CC0'};
