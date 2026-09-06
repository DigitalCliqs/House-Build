// Reference-led architectural lighting for entrance -> hallway -> living / kitchen / dining.
export function createPremiumLighting({THREE,scene,renderer}={}){
 if(!THREE||!scene)throw new Error('THREE and scene are required');const root=new THREE.Group();root.name='anamarija-premium-lighting';scene.add(root);
 if(renderer){renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;}
 // Neutral daylight keeps Calacatta and warm-white plaster from turning yellow.
 const sky=new THREE.HemisphereLight(0xf2f6ff,0x806a56,1.05);root.add(sky);
 const sun=new THREE.DirectionalLight(0xfff3df,2.15);sun.position.set(-8,12,8);sun.target.position.set(4,0,-1);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-16;sun.shadow.camera.right=16;sun.shadow.camera.top=16;sun.shadow.camera.bottom=-16;sun.shadow.bias=-.00025;root.add(sun,sun.target);
 const warm=0xffd7ad;
 const spots=[[-.15,2.86,6.15,18,1.0],[.95,2.86,4.75,16,.95],[4.0,3.72,2.35,22,1.15],[6.15,3.72,2.35,22,1.15],[4.0,3.72,.05,20,1.1],[6.15,3.72,.05,20,1.1],[4.0,3.72,-2.0,18,1.05],[6.15,3.72,-2.0,18,1.05]];
 for(const [x,y,z,intensity,distance]of spots){const l=new THREE.SpotLight(warm,intensity,distance,Math.PI/3,.65,1.4);l.position.set(x,y,z);l.target.position.set(x,0,z);root.add(l,l.target);}
 // Soft architectural washes through the principal reference view.
 const hallWash=new THREE.RectAreaLight(0xffe2bf,3.4,2.3,3.8);hallWash.position.set(.35,2.65,4.65);hallWash.rotation.x=-Math.PI/2;root.add(hallWash);
 const dayWash=new THREE.RectAreaLight(0xffe4c4,4.4,7.2,3.8);dayWash.position.set(5.2,3.45,-.15);dayWash.rotation.x=-Math.PI/2;root.add(dayWash);
 const terrace=new THREE.RectAreaLight(0xffd4a8,4.0,7.5,2.4);terrace.position.set(5,2.55,-4.05);terrace.rotation.x=-Math.PI/2;root.add(terrace);
 return{root,dispose(){scene.remove(root)}};
}
