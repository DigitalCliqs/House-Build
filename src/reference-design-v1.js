// Visual/UI design brief distilled from the approved Anamarija reference boards.
// This is a design target, not a claim that reference imagery is already reproduced by the 3D renderer.
export const REFERENCE_DESIGN={
  version:'1.0.0',
  visual:{
    palette:{ivory:'#eee7dc',warmOak:'#9a704f',darkOak:'#3b2d24',bronze:'#6c5543',stone:'#d9d2c7'},
    materials:['high-gloss Calacatta-look porcelain','warm oak herringbone','warm ivory plaster','dark oak joinery','champagne-bronze accents','large-format exterior stone'],
    lighting:['warm concealed ceiling coves','small recessed downlights','ring pendants','soft architectural wall lighting','natural daylight through large garden glazing'],
    architecture:['tall internal doors','wide uncluttered hallway','4.10 m living/day-zone ceiling','large dark-framed garden glazing','flush terrace threshold','articulated dark hipped roof'],
    furniture:['low warm-ivory modular sectional','round oak/stone coffee table','soft upholstered dining chairs','minimal warm-oak dining table','large indoor planting']
  },
  navigation:{
    rooms:['Entrance','Hallway','Living Room','Kitchen','Dining Area','Master Bedroom','Ensuite','Child Bedroom','Guest Bedroom','Main Bathroom','Office','Utility','Terrace & Pool','Garden'],
    controls:['day/evening','wheelchair/walking','fullscreen','room navigation','minimap','first-person movement'],
    ui:'translucent charcoal panels with warm selected state; keep the centre view visually clean'
  },
  accessibility:{hallwayTargetM:1.5,stepFree:true,wideDoorStrategy:true,wheelchairView:true},
  priorities:['photoreal material response','coherent warm premium palette','strong indoor/outdoor sightline','production furniture/vegetation assets','clean first-person UI']
};
