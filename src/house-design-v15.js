// V15 canonical design state. Tour renders are outputs of this model, not the source of truth.
export const DESIGN_META={
  projectId:'anamarija-euromax',
  revision:'1.0.0',
  baseline:'approved-reference-board',
  updatedAt:'2026-09-06',
  renderPolicy:{cubeFacePx:2048,faces:['px','nx','py','ny','pz','nz'],walkingEyeHeight:1.65,wheelchairEyeHeight:1.20}
};

export const DESIGN_OBJECTS={
  'shell.layout':{type:'structure',room:'whole-house',label:'House layout / room geometry',value:'Anamarija ~200 m² accessible concept',propagation:'global'},
  'shell.roof':{type:'structure',room:'exterior',label:'Articulated hipped roof',value:'premium dark tile',propagation:'exterior'},
  'shell.glazing':{type:'structure',room:'whole-house',label:'Window and door openings',value:'triple-glazed dark frames',propagation:'adjacent'},
  'finish.main-floor':{type:'finish',room:'shared',label:'Main floor',value:'Calacatta-look large-format porcelain',propagation:'surface'},
  'finish.bedroom-floor':{type:'finish',room:'bedrooms',label:'Bedroom / office floor',value:'warm oak herringbone',propagation:'surface'},
  'finish.joinery':{type:'finish',room:'whole-house',label:'Joinery palette',value:'warm oak + warm white + champagne bronze',propagation:'surface'},
  'lighting.shared':{type:'lighting',room:'shared',label:'Shared-space lighting',value:'2700–3000K indirect + downlights',propagation:'lighting'},
  'living.sofa.main':{type:'furniture',room:'living',label:'Main sectional sofa',value:'large warm-ivory sectional',propagation:'local'},
  'living.coffee-table':{type:'furniture',room:'living',label:'Coffee table',value:'round oak / stone top',propagation:'local'},
  'living.media-wall':{type:'fixed-furniture',room:'living',label:'Media wall',value:'dark oak + integrated display',propagation:'local'},
  'kitchen.island':{type:'fixed-furniture',room:'kitchen',label:'Kitchen island',value:'3.25 m accessible Calacatta island',propagation:'adjacent'},
  'kitchen.cabinetry':{type:'fixed-furniture',room:'kitchen',label:'Kitchen cabinetry',value:'full-height warm oak / white lacquer',propagation:'adjacent'},
  'dining.table':{type:'furniture',room:'dining',label:'Dining table',value:'8-seat warm oak table',propagation:'adjacent'},
  'office.layout':{type:'furniture',room:'office',label:'Office furniture layout',value:'desk + storage wall + lounge chair',propagation:'local'},
  'accessible-bedroom.layout':{type:'accessibility',room:'accessible-bedroom',label:'Accessible bedroom layout',value:'1.50 m turning + transfer routes',propagation:'local'},
  'accessible-bathroom.layout':{type:'accessibility',room:'accessible-bathroom',label:'Accessible bathroom layout',value:'roll-in shower + transfer zones + 1.50 m turn',propagation:'local'},
  'master.bed':{type:'furniture',room:'master-bedroom',label:'Master bed',value:'king upholstered bed',propagation:'local'},
  'ensuite.layout':{type:'fixed-furniture',room:'ensuite',label:'Ensuite sanitary layout',value:'walk-in shower + double vanity',propagation:'local'},
  'terrace.pergola':{type:'amenity',room:'terrace',label:'Terrace pergola',value:'dark frame + timber slats',propagation:'adjacent'},
  'terrace.furniture':{type:'furniture',room:'terrace',label:'Outdoor furniture',value:'lounge + 8-seat dining',propagation:'local'},
  'pool.main':{type:'amenity',room:'pool',label:'Pool',value:'8 × 4 m automated pool',propagation:'adjacent'},
  'garden.landscape':{type:'landscape',room:'garden',label:'Landscape scheme',value:'Mediterranean planting + accessible paths',propagation:'exterior'}
};

export const VARIANTS={
  'living.sofa.main':{
    approved:'large warm-ivory sectional',
    compact:'compact 3-seat + 2 lounge chairs',
    modular:'low-profile modular sectional'
  },
  'kitchen.cabinetry':{
    approved:'full-height warm oak / white lacquer',
    light:'light oak + warm white lacquer',
    bronze:'smoked oak + champagne-bronze accents'
  },
  'office.layout':{
    approved:'desk + storage wall + lounge chair',
    dual:'two-person workstation + storage wall',
    study:'large desk + reading wall + sofa bed'
  },
  'terrace.furniture':{
    approved:'lounge + 8-seat dining',
    entertaining:'large sectional + 10-seat dining',
    minimal:'4-seat lounge + 6-seat dining'
  }
};

export const REVISION_HISTORY=[
  {revision:'1.0.0',date:'2026-09-06',status:'baseline',summary:'Reference-board design established as canonical visual specification.'}
];
