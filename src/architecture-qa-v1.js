// Runtime QA for the working Anamarija architecture spec.
// This does not certify compliance; it catches modelling regressions before they reach the walkthrough.

function range(a,b){return [Math.min(a,b),Math.max(a,b)];}
function overlap(a1,a2,b1,b2,t=.03){return Math.min(a2,b2)-Math.max(a1,b1)>=-t;}
function contains(a,b,x,t=.03){const [lo,hi]=range(a,b);return x>=lo-t&&x<=hi+t;}

export function auditArchitecture(spec){
  const issues=[]; const info=[];
  const walls=spec.walls||[], openings=spec.openings||[], glazing=spec.glazing||[];
  const ext=walls.filter(w=>w.zone==='external');
  const house=spec.house||{};
  const XW=-house.width/2, XE=house.width/2, ZN=house.z-house.depth/2, ZS=house.z+house.depth/2;

  // Exterior corners must be physically joined/overlapped.
  const corners=[[XW,ZN,'south-west'],[XE,ZN,'south-east'],[XW,ZS,'north-west'],[XE,ZS,'north-east']];
  for(const [x,z,name] of corners){
    const xWall=ext.some(w=>w.axis==='x'&&Math.abs(w.fixed-z)<.12&&contains(w.a,w.b,x,.12));
    const zWall=ext.some(w=>w.axis==='z'&&Math.abs(w.fixed-x)<.12&&contains(w.a,w.b,z,.12));
    if(!xWall||!zWall)issues.push({severity:'error',code:'OPEN_CORNER',message:`Exterior ${name} corner is not joined.`});
  }

  // Every exterior gap should be explained by an opening or glazing span.
  for(const z of [ZN,ZS]){
    const segments=ext.filter(w=>w.axis==='x'&&Math.abs(w.fixed-z)<.12).map(w=>range(w.a,w.b)).sort((a,b)=>a[0]-b[0]);
    for(let i=0;i<segments.length-1;i++){
      const gap=[segments[i][1],segments[i+1][0]]; if(gap[1]-gap[0]<.04)continue;
      const classified=[...openings,...glazing].some(o=>o.axis==='x'&&Math.abs(o.fixed-z)<.15&&overlap(gap[0],gap[1],...range(o.a,o.b),.08));
      if(!classified)issues.push({severity:'warning',code:'UNCLASSIFIED_ENVELOPE_GAP',message:`Unclassified exterior gap ${gap[0].toFixed(2)}–${gap[1].toFixed(2)}m at z=${z.toFixed(2)}.`});
    }
  }

  // Ceiling must cover the full working house envelope.
  const ceiling=(spec.ceilings||[]).find(c=>c.width>=house.width-.02&&c.depth>=house.depth-.02);
  if(!ceiling)issues.push({severity:'error',code:'CEILING_COVERAGE',message:'No ceiling deck covers the full working house envelope.'});

  // Roof volumes must collectively cover west/east extents and full north/south house depth.
  const rv=spec.roof?.volumes||[];
  const minX=Math.min(...rv.map(v=>v.x-v.width/2)), maxX=Math.max(...rv.map(v=>v.x+v.width/2));
  const minZ=Math.min(...rv.map(v=>v.z-v.depth/2)), maxZ=Math.max(...rv.map(v=>v.z+v.depth/2));
  if(!rv.length||minX>XW||maxX<XE||minZ>ZN||maxZ<ZS)issues.push({severity:'error',code:'ROOF_COVERAGE',message:'Roof volumes do not cover the complete working house bounding envelope.'});

  // Accessibility design targets used by this visual model.
  const a=spec.accessibility||{};
  if((a.internalDoorClearTarget||0)<.90)issues.push({severity:'error',code:'DOOR_CLEARANCE',message:'Internal door clear-width target is below 0.90m.'});
  if((a.accessibleDoorClearTarget||0)<1.0)issues.push({severity:'warning',code:'ACCESSIBLE_DOOR_CLEARANCE',message:'Accessible-room door target is below 1.00m.'});
  if((a.turningDiameterTarget||0)<1.50)issues.push({severity:'warning',code:'TURNING_DIAMETER',message:'Wheelchair turning target is below 1.50m.'});

  info.push({code:'PROVISIONAL_GEOMETRY',message:'Coordinates remain working-design geometry pending architect drawings.'});
  return {ok:!issues.some(i=>i.severity==='error'),issues,info,checkedAt:new Date().toISOString()};
}

export function reportArchitectureAudit(result, logger=console){
  const fn=result.ok?'info':'warn';
  logger[fn]?.(`[architecture QA] ${result.ok?'PASS':'FAIL'} · ${result.issues.length} issue(s)`);
  for(const i of result.issues)(i.severity==='error'?logger.error:logger.warn)?.(`[architecture QA] ${i.code}: ${i.message}`);
  return result;
}
