import { HOUSE, ROOMS, TELEPORTS } from './house-config.js';

// v9 design-development accessibility engine.
// Adds an oriented wheelchair swept envelope, door approach zones and functional
// bathroom/kitchen transfer zones. Values are parameterised concept geometry and
// must be replaced by signed-off architect / OT dimensions for compliance use.

const RULES={
  chairWidth:.72,
  chairLength:1.15,
  chairMargin:.06,
  internalDoor:.90,
  entranceDoor:1.10,
  corridor:1.50,
  route:.90,
  kitchenAisle:1.20,
  turnDiameter:1.50,
  wcFront:.90,
  wcSide:.90,
  showerApproach:.90,
};

const BASE=window.__HOUSE_ACCESSIBILITY_V8__;
const FURNITURE=BASE?.obstacles || [];

const STATIC=[
  ...FURNITURE,
  {id:'wc',x:-4.10,z:4.65,w:.72,d:.78,label:'Accessible WC'},
  {id:'shower-bench',x:-2.00,z:5.85,w:.70,d:.42,label:'Shower bench'},
  {id:'kitchen-tall',x:6.55,z:5.05,w:.70,d:2.25,label:'Tall kitchen bank'},
];

function room(id){return ROOMS.find(r=>r.id===id);}
function pointInRect(px,pz,r,pad=0){return Math.abs(px-r.x)<=r.w/2+pad&&Math.abs(pz-r.z)<=r.d/2+pad;}
function rectCorners(cx,cz,w,l,a){
  const c=Math.cos(a),s=Math.sin(a),hw=w/2,hl=l/2;
  return [[-hw,-hl],[hw,-hl],[hw,hl],[-hw,hl]].map(([x,z])=>[cx+x*c-z*s,cz+x*s+z*c]);
}
function axes(poly){const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],ex=b[0]-a[0],ez=b[1]-a[1],len=Math.hypot(ex,ez)||1;out.push([-ez/len,ex/len]);}return out;}
function project(poly,ax){let mn=Infinity,mx=-Infinity;for(const p of poly){const v=p[0]*ax[0]+p[1]*ax[1];mn=Math.min(mn,v);mx=Math.max(mx,v);}return [mn,mx];}
function polygonsOverlap(a,b){for(const ax of [...axes(a),...axes(b)]){const A=project(a,ax),B=project(b,ax);if(A[1]<B[0]||B[1]<A[0])return false;}return true;}
function obstaclePoly(o,pad=0){return rectCorners(o.x,o.z,o.w+2*pad,o.d+2*pad,0);}

function angleDelta(a,b){let d=b-a;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return d;}
function samplePolyline(points,step=.10){
  const out=[];
  for(let k=0;k<points.length-1;k++){
    const a=points[k],b=points[k+1],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),heading=Math.atan2(dx,dz),n=Math.max(1,Math.ceil(len/step));
    const prevHeading=k?Math.atan2(a[0]-points[k-1][0],a[1]-points[k-1][1]):heading;
    for(let i=0;i<n;i++){
      const t=i/n,blend=Math.min(1,t*3),h=prevHeading+angleDelta(prevHeading,heading)*blend;
      out.push({x:a[0]+dx*t,z:a[1]+dz*t,a:h});
    }
  }
  const p=points.at(-1),q=points.at(-2);out.push({x:p[0],z:p[1],a:Math.atan2(p[0]-q[0],p[1]-q[1])});
  return out;
}
function evaluateSweep(name,points,required=RULES.route){
  const samples=samplePolyline(points),collisions=new Set();let minRoomEdge=Infinity;
  for(const s of samples){
    const chair=rectCorners(s.x,s.z,RULES.chairWidth+2*RULES.chairMargin,RULES.chairLength+2*RULES.chairMargin,s.a);
    for(const o of STATIC)if(polygonsOverlap(chair,obstaclePoly(o)))collisions.add(o.label);
    const r=ROOMS.find(rr=>pointInRect(s.x,s.z,{x:rr.x,z:rr.z+HOUSE.z,w:rr.w,d:rr.d}));
    if(r){const edge=Math.min(r.w/2-Math.abs(s.x-r.x),r.d/2-Math.abs(s.z-(r.z+HOUSE.z)));minRoomEdge=Math.min(minRoomEdge,edge);}
  }
  const estimatedClear=Number.isFinite(minRoomEdge)?Math.max(0,2*minRoomEdge-RULES.chairWidth):0;
  return {name,points,samples,collisions:[...collisions],estimatedClear,required,pass:collisions.size===0&&estimatedClear>=Math.min(required,.90)};
}

const P=TELEPORTS;
const sweeps=[
  evaluateSweep('Entrance → living',[[P.Entrance[0],P.Entrance[2]],[.5,3.2],[2.1,1.2],[P.Living[0],P.Living[2]]],RULES.corridor),
  evaluateSweep('Entrance → accessible bedroom',[[P.Entrance[0],P.Entrance[2]],[-1.0,5.8],[-4.8,5.8],[P['Accessible bedroom'][0],P['Accessible bedroom'][2]]],RULES.route),
  evaluateSweep('Accessible bedroom → bathroom',[[P['Accessible bedroom'][0],P['Accessible bedroom'][2]],[-5.3,4.5],[-4.7,4.5],[P['Accessible bathroom'][0],P['Accessible bathroom'][2]]],RULES.route),
  evaluateSweep('Living → kitchen',[[P.Living[0],P.Living[2]],[3.1,.2],[3.3,2.4],[P.Kitchen[0],P.Kitchen[2]]],RULES.kitchenAisle),
  evaluateSweep('Living → terrace',[[P.Living[0],P.Living[2]],[4.4,-3.7],[P.Terrace[0],P.Terrace[2]]],RULES.route),
  evaluateSweep('Terrace → pool',[[P.Terrace[0],P.Terrace[2]],[4.8,-7.0],[P.Pool[0],P.Pool[2]]],RULES.route),
];

const DOORS=[
  {name:'Main entrance',clear:HOUSE.entranceDoor,required:RULES.entranceDoor,x:.5,z:7.0,axis:'x',approachDepth:1.50,approachWidth:1.50},
  {name:'Accessible bedroom door',clear:HOUSE.accessibleDoor,required:RULES.internalDoor,x:-5.0,z:4.55,axis:'x',approachDepth:1.20,approachWidth:1.50},
  {name:'Accessible bathroom door',clear:HOUSE.accessibleDoor,required:RULES.internalDoor,x:-4.75,z:4.4,axis:'x',approachDepth:1.20,approachWidth:1.50},
  {name:'Terrace opening',clear:1.50,required:RULES.internalDoor,x:4.8,z:-4.3,axis:'x',approachDepth:1.20,approachWidth:1.50},
].map(d=>({...d,pass:d.clear>=d.required}));

const bath=room('bath'),kitchen=room('kitchen');
const ZOFF=HOUSE.z;
const ZONES=[
  {id:'wc-front',name:'WC frontal approach',x:-4.10,z:3.65,w:.90,d:.90,required:RULES.wcFront},
  {id:'wc-side',name:'WC side transfer',x:-3.20,z:4.65,w:.90,d:1.20,required:RULES.wcSide},
  {id:'shower',name:'Roll-in shower approach',x:-2.50,z:4.05,w:1.10,d:.95,required:RULES.showerApproach},
  {id:'bath-turn',name:'Bathroom 1.50 m turn',x:bath?.x??-3.2,z:(bath?.z??4.55)+ZOFF,w:1.50,d:1.50,required:RULES.turnDiameter},
  {id:'kitchen-turn',name:'Kitchen 1.50 m turn',x:kitchen?.x??5,z:(kitchen?.z??4.25)+ZOFF-.55,w:1.50,d:1.50,required:RULES.turnDiameter},
  {id:'kitchen-aisle',name:'Kitchen working aisle',x:4.9,z:4.15,w:3.0,d:1.20,required:RULES.kitchenAisle},
];
function zoneBlocked(z){return STATIC.filter(o=>o.id!=='wetroom-shower'&&o.id!=='wc'&&polygonsOverlap(obstaclePoly(z),obstaclePoly(o))).map(o=>o.label);}
const zoneResults=ZONES.map(z=>{const blocked=zoneBlocked(z);return {...z,blocked,pass:blocked.length===0};});

function css(){const s=document.createElement('style');s.textContent=`
.a9-score{font-size:18px;font-weight:850}.a9-grid{display:grid;gap:5px}.a9-row{display:grid;grid-template-columns:18px 1fr auto;gap:6px;align-items:center;padding:7px 8px;border-radius:8px;background:rgba(255,255,255,.045);font-size:10px}.a9-row .ok{color:#8ee7ae}.a9-row .bad{color:#ffb19d}.a9-row small{opacity:.62;text-align:right;max-width:120px}.a9-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin:8px 0}.a9-tabs button{padding:7px 5px;font-size:10px}#a9Map{width:100%;aspect-ratio:1.55;border-radius:10px;background:#15191f;border:1px solid rgba(255,255,255,.08);touch-action:none}.a9-note{font-size:10px;line-height:1.45;opacity:.58;margin-top:7px}`;document.head.appendChild(s);}
function item(name,pass,detail){return `<div class="a9-row"><span class="${pass?'ok':'bad'}">${pass?'✓':'!'}</span><b>${name}</b><small>${detail}</small></div>`;}
function render(mode,host){
  if(mode==='sweeps')host.innerHTML=sweeps.map(x=>item(x.name,x.pass,x.collisions.length?`conflict: ${x.collisions[0]}`:`swept path clear`)).join('');
  else if(mode==='doors')host.innerHTML=DOORS.map(x=>item(x.name,x.pass,`${x.clear.toFixed(2)} / ≥ ${x.required.toFixed(2)} m`)).join('');
  else host.innerHTML=zoneResults.map(x=>item(x.name,x.pass,x.blocked.length?`conflict: ${x.blocked[0]}`:'zone clear')).join('');
}
function drawMap(c){
  const ctx=c.getContext('2d'),dpr=Math.min(devicePixelRatio||1,2),w=c.clientWidth,h=c.clientHeight;c.width=w*dpr;c.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
  const sx=w/30,sz=h/24,ox=w/2,oz=h/2+10,X=x=>ox+x*sx,Z=z=>oz-z*sz;
  ctx.fillStyle='#15191f';ctx.fillRect(0,0,w,h);
  ctx.strokeStyle='rgba(255,255,255,.22)';ctx.strokeRect(X(-HOUSE.width/2),Z(HOUSE.z+HOUSE.depth/2),HOUSE.width*sx,HOUSE.depth*sz);
  for(const r of ROOMS){ctx.strokeStyle='rgba(255,255,255,.10)';ctx.strokeRect(X(r.x-r.w/2),Z(r.z+HOUSE.z+r.d/2),r.w*sx,r.d*sz);}
  ctx.fillStyle='rgba(255,110,92,.28)';for(const o of STATIC)ctx.fillRect(X(o.x-o.w/2),Z(o.z+o.d/2),o.w*sx,o.d*sz);
  for(const z of zoneResults){ctx.fillStyle=z.pass?'rgba(74,210,126,.20)':'rgba(255,105,90,.24)';ctx.strokeStyle=z.pass?'rgba(74,210,126,.8)':'rgba(255,105,90,.9)';ctx.fillRect(X(z.x-z.w/2),Z(z.z+z.d/2),z.w*sx,z.d*sz);ctx.strokeRect(X(z.x-z.w/2),Z(z.z+z.d/2),z.w*sx,z.d*sz);}
  for(const sw of sweeps){ctx.strokeStyle=sw.pass?'rgba(79,224,142,.9)':'rgba(255,119,97,.95)';ctx.lineWidth=3;ctx.beginPath();sw.points.forEach((p,i)=>i?ctx.lineTo(X(p[0]),Z(p[1])):ctx.moveTo(X(p[0]),Z(p[1])));ctx.stroke();
    for(let i=0;i<sw.samples.length;i+=Math.max(1,Math.floor(sw.samples.length/16))){const s=sw.samples[i];const poly=rectCorners(s.x,s.z,RULES.chairWidth,RULES.chairLength,s.a);ctx.strokeStyle='rgba(73,188,230,.35)';ctx.lineWidth=1;ctx.beginPath();poly.forEach((p,j)=>j?ctx.lineTo(X(p[0]),Z(p[1])):ctx.moveTo(X(p[0]),Z(p[1])));ctx.closePath();ctx.stroke();}}
}

const panel=document.querySelector('.panel');
if(panel){css();const section=document.createElement('div');section.className='section';const score=[...sweeps,...DOORS,...zoneResults].filter(x=>x.pass).length,total=sweeps.length+DOORS.length+zoneResults.length;section.innerHTML=`
<div class="section-title">Accessibility engineering v9</div><div class="a11y-v8-summary"><span><b>Wheelchair geometry score</b><br><small>oriented sweep + transfer zones</small></span><span class="a9-score">${score}/${total}</span></div>
<div class="a9-tabs"><button data-a9="sweeps">Swept paths</button><button data-a9="doors">Door approach</button><button data-a9="zones">Transfer zones</button></div><div id="a9List" class="a9-grid"></div><canvas id="a9Map"></canvas>
<div class="row"><button id="a9Audit">Run wheelchair review</button><button id="a9Full" class="secondary">Map fullscreen</button></div>
<div class="a9-note">The blue rectangles show the wheelchair body sampled along curved/segmented routes; green/red zones show concept transfer and working areas. Coordinates are current model assumptions, not certified construction dimensions.</div>`;panel.appendChild(section);const list=section.querySelector('#a9List');render('sweeps',list);section.querySelectorAll('[data-a9]').forEach(b=>b.onclick=()=>render(b.dataset.a9,list));const map=section.querySelector('#a9Map');requestAnimationFrame(()=>drawMap(map));addEventListener('resize',()=>drawMap(map));section.querySelector('#a9Full').onclick=()=>map.requestFullscreen?.();section.querySelector('#a9Audit').onclick=()=>{const p=document.getElementById('profile');if(p){p.value='wheelchair';p.dispatchEvent(new Event('change'));}const t=document.getElementById('turn');if(t){t.value='on';t.dispatchEvent(new Event('change'));}const d=document.getElementById('doors');if(d){d.value='open';d.dispatchEvent(new Event('change'));}const tele=document.getElementById('teleport');if(tele){tele.value='Accessible bathroom';tele.dispatchEvent(new Event('change'));}};}

window.__HOUSE_ACCESSIBILITY_V9__={rules:RULES,sweeps,doors:DOORS,zones:zoneResults,staticObstacles:STATIC};
