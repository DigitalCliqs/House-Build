export const TOUR_SCENES = [
  {
    id:'entrance', label:'Entrance', eyeHeight:1.65,
    cube:{
      px:'./assets/tour-v14/entrance/px.jpg', nx:'./assets/tour-v14/entrance/nx.jpg',
      py:'./assets/tour-v14/entrance/py.jpg', ny:'./assets/tour-v14/entrance/ny.jpg',
      pz:'./assets/tour-v14/entrance/pz.jpg', nz:'./assets/tour-v14/entrance/nz.jpg'
    },
    links:[
      {to:'hallway',label:'Hallway',yaw:0,pitch:-0.16},
      {to:'living',label:'Living room',yaw:-0.42,pitch:-0.12},
      {to:'exterior-front',label:'Exterior · Front',yaw:3.05,pitch:-0.14}
    ]
  },
  {id:'hallway',label:'Hallway',eyeHeight:1.65,cubePath:'./assets/tour-v14/hallway',links:[{to:'entrance',label:'Entrance',yaw:3.14,pitch:-0.12},{to:'living',label:'Living room',yaw:0,pitch:-0.12},{to:'office',label:'Office',yaw:1.05,pitch:-0.12},{to:'accessible-bedroom',label:'Accessible bedroom',yaw:-1.0,pitch:-0.12},{to:'master-bedroom',label:'Master bedroom',yaw:2.1,pitch:-0.12}]},
  {id:'living',label:'Living room',eyeHeight:1.65,cubePath:'./assets/tour-v14/living',links:[{to:'hallway',label:'Hallway',yaw:2.9,pitch:-0.12},{to:'dining',label:'Dining area',yaw:.72,pitch:-0.12},{to:'terrace',label:'Terrace',yaw:-.35,pitch:-0.1}]},
  {id:'dining',label:'Dining area',eyeHeight:1.65,cubePath:'./assets/tour-v14/dining',links:[{to:'living',label:'Living room',yaw:-2.45,pitch:-0.12},{to:'kitchen',label:'Kitchen',yaw:.75,pitch:-0.12},{to:'terrace',label:'Terrace',yaw:-.25,pitch:-0.1}]},
  {id:'kitchen',label:'Kitchen',eyeHeight:1.65,cubePath:'./assets/tour-v14/kitchen',links:[{to:'dining',label:'Dining area',yaw:-2.25,pitch:-0.12},{to:'hallway',label:'Hallway',yaw:2.85,pitch:-0.12}]},
  {id:'office',label:'Office',eyeHeight:1.65,cubePath:'./assets/tour-v14/office',links:[{to:'hallway',label:'Hallway',yaw:3.1,pitch:-0.12}]},
  {id:'accessible-bedroom',label:'Accessible bedroom',eyeHeight:1.20,cubePath:'./assets/tour-v14/accessible-bedroom',links:[{to:'accessible-bathroom',label:'Accessible bathroom',yaw:.95,pitch:-0.12},{to:'hallway',label:'Hallway',yaw:3.1,pitch:-0.12}]},
  {id:'accessible-bathroom',label:'Accessible bathroom',eyeHeight:1.20,cubePath:'./assets/tour-v14/accessible-bathroom',links:[{to:'accessible-bedroom',label:'Accessible bedroom',yaw:3.1,pitch:-0.12},{to:'hallway',label:'Hallway',yaw:-2.5,pitch:-0.12}]},
  {id:'master-bedroom',label:'Master bedroom',eyeHeight:1.65,cubePath:'./assets/tour-v14/master-bedroom',links:[{to:'ensuite',label:'Ensuite',yaw:.9,pitch:-0.12},{to:'hallway',label:'Hallway',yaw:3.1,pitch:-0.12}]},
  {id:'ensuite',label:'Ensuite',eyeHeight:1.65,cubePath:'./assets/tour-v14/ensuite',links:[{to:'master-bedroom',label:'Master bedroom',yaw:3.1,pitch:-0.12}]},
  {id:'guest-bedroom',label:'Guest bedroom',eyeHeight:1.65,cubePath:'./assets/tour-v14/guest-bedroom',links:[{to:'hallway',label:'Hallway',yaw:3.1,pitch:-0.12}]},
  {id:'terrace',label:'Terrace',eyeHeight:1.65,cubePath:'./assets/tour-v14/terrace',links:[{to:'living',label:'Living room',yaw:2.8,pitch:-0.12},{to:'dining',label:'Dining area',yaw:2.25,pitch:-0.12},{to:'pool',label:'Pool',yaw:0,pitch:-0.16},{to:'garden-rear',label:'Rear garden',yaw:-.8,pitch:-0.1}]},
  {id:'pool',label:'Pool',eyeHeight:1.65,cubePath:'./assets/tour-v14/pool',links:[{to:'terrace',label:'Terrace',yaw:3.1,pitch:-0.1},{to:'garden-rear',label:'Rear garden',yaw:.8,pitch:-0.1}]},
  {id:'exterior-front',label:'Exterior · Front',eyeHeight:1.65,cubePath:'./assets/tour-v14/exterior-front',links:[{to:'entrance',label:'Entrance',yaw:0,pitch:-0.12},{to:'garden-front',label:'Front garden',yaw:-.8,pitch:-0.1}]},
  {id:'garden-front',label:'Front garden',eyeHeight:1.65,cubePath:'./assets/tour-v14/garden-front',links:[{to:'exterior-front',label:'Exterior · Front',yaw:.6,pitch:-0.1},{to:'entrance',label:'Entrance',yaw:0,pitch:-0.1}]},
  {id:'garden-rear',label:'Rear garden',eyeHeight:1.65,cubePath:'./assets/tour-v14/garden-rear',links:[{to:'terrace',label:'Terrace',yaw:0,pitch:-0.1},{to:'pool',label:'Pool',yaw:.45,pitch:-0.1}]}
];

const faces=['px','nx','py','ny','pz','nz'];
for(const s of TOUR_SCENES){
  if(!s.cube && s.cubePath) s.cube=Object.fromEntries(faces.map(f=>[f,`${s.cubePath}/${f}.jpg`]));
}

export const TOUR_META={
  title:'Anamarija EuroMax',
  subtitle:'~200 m² · premium · accessible · low-energy home',
  floorplan:'./assets/tour-v12/floorplan.webp',
  first:'entrance',
  cubeFaceMinimum:2048,
  masterEquivalent:'8192×4096 equirectangular or six 2048×2048 cube faces',
  walkingEyeHeight:1.65,
  wheelchairEyeHeight:1.20
};
