// Premium private-room detailing for the working Anamarija EuroMax visual twin.
// Provisional visual geometry only; accessibility clearances remain subject to final architect drawings.
export function createPrivateRoomDetail({THREE,scene}={}){
 if(!THREE||!scene)throw new Error('THREE and scene are required');
 const g=new THREE.Group();g.name='private-room-detail';
 const oak=new THREE.MeshStandardMaterial({color:0x9b704d,roughness:.58});
 const ivory=new THREE.MeshPhysicalMaterial({color:0xeee9df,roughness:.68});
 const white=new THREE.MeshPhysicalMaterial({color:0xf3f1ec,roughness:.24,clearcoat:.12});
 const stone=new THREE.MeshPhysicalMaterial({color:0xe6e1d9,roughness:.25,clearcoat:.12});
 const bronze=new THREE.MeshStandardMaterial({color:0x665044,roughness:.28,metalness:.68});
 const glass=new THREE.MeshPhysicalMaterial({color:0xdce8e8,transparent:true,opacity:.22,roughness:.08,metalness:0,transmission:.55});
 const dark=new THREE.MeshStandardMaterial({color:0x292725,roughness:.42});
 const box=(n,s,p,m)=>{const x=new THREE.Mesh(new THREE.BoxGeometry(...s),m);x.name=n;x.position.set(...p);x.castShadow=true;x.receiveShadow=true;g.add(x);return x};
 const cyl=(n,r,h,p,m)=>{const x=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,40),m);x.name=n;x.position.set(...p);x.castShadow=true;x.receiveShadow=true;g.add(x);return x};
 // Accessible bedroom: low bed and shallow storage keep a generous central turning zone.
 box('accessible-bed-base',[2.05,.30,2.05],[-8.05,.18,4.72],oak);box('accessible-mattress',[1.92,.24,1.92],[-8.05,.45,4.72],ivory);box('accessible-headboard',[2.10,1.05,.12],[-8.05,.78,5.68],ivory);
 box('accessible-low-storage',[1.75,.70,.45],[-6.10,.36,5.72],oak);box('accessible-desk',[1.35,.06,.62],[-6.15,.74,3.18],oak);box('accessible-desk-leg',[.07,.72,.55],[-6.75,.37,3.18],bronze);box('accessible-desk-leg',[.07,.72,.55],[-5.55,.37,3.18],bronze);
 // Accessible bathroom: open floor centre, wall-hung WC, floating basin and level shower.
 box('accessible-basin',[.82,.12,.52],[-3.82,.82,5.72],white);box('accessible-basin-vanity',[.72,.48,.44],[-3.82,.55,5.72],oak);
 box('accessible-wc',[.43,.42,.68],[-2.25,.36,5.52],white);box('accessible-wc-back',[.46,.52,.18],[-2.25,.61,5.82],white);
 box('accessible-shower-screen',[.025,1.95,1.30],[-4.62,1.02,3.50],glass);box('accessible-shower-tray',[1.30,.025,1.35],[-4.00,.035,3.50],stone);
 box('accessible-grab-horizontal',[.72,.045,.045],[-2.82,.82,5.72],bronze);box('accessible-grab-vertical',[.045,.72,.045],[-2.48,1.02,5.72],bronze);
 // Main bedroom: restrained hotel-style composition.
 box('master-bed-base',[2.10,.30,2.15],[-6.35,.18,-4.45],oak);box('master-mattress',[1.98,.25,2.02],[-6.35,.46,-4.45],ivory);box('master-headboard',[2.55,1.30,.13],[-6.35,.86,-5.43],ivory);
 for(const x of[-7.65,-5.05]){box('master-bedside',[.55,.45,.45],[x,.24,-5.22],oak);cyl('master-lamp',.12,.04,[x,.86,-5.22],bronze)}
 box('master-wardrobe',[2.20,2.35,.58],[-3.55,1.18,-5.48],dark);
 // Office: compact executive desk and full-height storage, preserving circulation.
 box('office-desk',[1.65,.07,.72],[.35,.76,4.72],oak);box('office-desk-left',[.07,.72,.62],[-.38,.38,4.72],bronze);box('office-desk-right',[.07,.72,.62],[1.08,.38,4.72],bronze);
 box('office-storage',[.55,2.30,2.25],[2.10,1.16,4.68],dark);box('office-chair-seat',[.52,.10,.52],[.35,.50,3.82],ivory);box('office-chair-back',[.52,.72,.12],[.35,.86,4.04],ivory);
 scene.add(g);return g;
}
