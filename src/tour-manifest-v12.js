export const TOUR_SCENES = [
  {id:'exterior-front',label:'Exterior · Front',image:'./assets/tour-v12/exterior-front.webp',next:['entrance','garden-front']},
  {id:'entrance',label:'Entrance',image:'./assets/tour-v12/entrance.webp',next:['hallway','exterior-front']},
  {id:'hallway',label:'Hallway',image:'./assets/tour-v12/hallway.webp',next:['living','office','accessible-bedroom','master-bedroom','entrance']},
  {id:'living',label:'Living room',image:'./assets/tour-v12/living.webp',next:['dining','terrace','hallway']},
  {id:'dining',label:'Dining area',image:'./assets/tour-v12/dining.webp',next:['kitchen','living','terrace']},
  {id:'kitchen',label:'Kitchen',image:'./assets/tour-v12/kitchen.webp',next:['dining','hallway']},
  {id:'office',label:'Office',image:'./assets/tour-v12/office.webp',next:['hallway']},
  {id:'accessible-bedroom',label:'Accessible bedroom',image:'./assets/tour-v12/accessible-bedroom.webp',next:['accessible-bathroom','hallway']},
  {id:'accessible-bathroom',label:'Accessible bathroom',image:'./assets/tour-v12/accessible-bathroom.webp',next:['accessible-bedroom','hallway']},
  {id:'master-bedroom',label:'Master bedroom',image:'./assets/tour-v12/master-bedroom.webp',next:['ensuite','hallway']},
  {id:'ensuite',label:'Ensuite',image:'./assets/tour-v12/ensuite.webp',next:['master-bedroom']},
  {id:'guest-bedroom',label:'Guest bedroom',image:'./assets/tour-v12/guest-bedroom.webp',next:['hallway']},
  {id:'terrace',label:'Terrace',image:'./assets/tour-v12/terrace.webp',next:['pool','living','dining','garden-rear']},
  {id:'pool',label:'Pool',image:'./assets/tour-v12/pool.webp',next:['terrace','garden-rear']},
  {id:'garden-front',label:'Front garden',image:'./assets/tour-v12/garden-front.webp',next:['exterior-front','entrance']},
  {id:'garden-rear',label:'Rear garden',image:'./assets/tour-v12/garden-rear.webp',next:['terrace','pool']},
];

export const TOUR_META = {
  title:'Anamarija EuroMax',
  subtitle:'~200 m² · premium · accessible · low-energy home',
  floorplan:'./assets/tour-v12/floorplan.webp',
  first:'exterior-front',
};
