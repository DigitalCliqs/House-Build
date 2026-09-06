// Touch/mobile controls for the Anamarija walkthrough.
// Left thumb: movement. Right side drag: look. Buttons expose useful actions.
if (window.__HOUSE_IS_MOBILE__) {
  const style = document.createElement('style');
  style.textContent = `
    body.mobile-house { touch-action:none; overscroll-behavior:none; }
    .mobile-house .panel { width:min(310px,calc(100vw - 20px)); right:10px; top:10px; max-height:48vh; }
    .mobile-house #badge { display:none; }
    #mobileControls { position:fixed; inset:0; z-index:20; pointer-events:none; font-family:Inter,system-ui,sans-serif; }
    .joy { position:absolute; left:18px; bottom:24px; width:132px; height:132px; border-radius:50%; background:rgba(16,19,24,.34); border:1px solid rgba(255,255,255,.18); backdrop-filter:blur(8px); pointer-events:auto; touch-action:none; }
    .joyKnob { position:absolute; left:43px; top:43px; width:46px; height:46px; border-radius:50%; background:rgba(255,255,255,.82); box-shadow:0 5px 20px rgba(0,0,0,.25); transform:translate(0,0); }
    .lookZone { position:absolute; right:0; top:0; width:58vw; height:100vh; pointer-events:auto; touch-action:none; }
    .mobileButtons { position:absolute; right:14px; bottom:22px; display:grid; gap:8px; pointer-events:auto; }
    .mobileButtons button { width:auto; min-width:84px; padding:10px 12px; border-radius:12px; border:1px solid rgba(255,255,255,.18); background:rgba(16,19,24,.62); color:#fff; font-weight:750; backdrop-filter:blur(8px); }
    .mobileHint { position:absolute; left:50%; bottom:16px; transform:translateX(-50%); font-size:11px; color:#fff; background:rgba(16,19,24,.48); padding:7px 10px; border-radius:9px; pointer-events:none; white-space:nowrap; }
    @media (orientation:landscape) { .mobile-house .panel { max-height:70vh; } .joy { width:116px;height:116px; } .joyKnob { left:36px;top:36px;width:44px;height:44px; } }
  `;
  document.head.appendChild(style);
  document.body.classList.add('mobile-house');

  const root = document.createElement('div');
  root.id = 'mobileControls';
  root.innerHTML = `
    <div class="joy" aria-label="Movement joystick"><div class="joyKnob"></div></div>
    <div class="lookZone" aria-label="Touch and drag to look around"></div>
    <div class="mobileButtons">
      <button id="mEnter">Explore</button>
      <button id="mPanel">Menu</button>
      <button id="mWheel">Wheelchair</button>
    </div>
    <div class="mobileHint">Left thumb move · right side drag to look</div>
  `;
  document.body.appendChild(root);

  const held = new Set();
  function key(code, down) {
    if (down && !held.has(code)) {
      held.add(code); dispatchEvent(new KeyboardEvent('keydown',{code,key:code,bubbles:true}));
    } else if (!down && held.has(code)) {
      held.delete(code); dispatchEvent(new KeyboardEvent('keyup',{code,key:code,bubbles:true}));
    }
  }
  function releaseAll(){ [...held].forEach(c=>key(c,false)); }

  const joy = root.querySelector('.joy');
  const knob = root.querySelector('.joyKnob');
  let joyPointer = null;
  function setJoy(clientX, clientY){
    const r=joy.getBoundingClientRect();
    let dx=clientX-(r.left+r.width/2), dy=clientY-(r.top+r.height/2);
    const max=r.width*.34, len=Math.hypot(dx,dy)||1;
    if(len>max){dx*=max/len;dy*=max/len;}
    knob.style.transform=`translate(${dx}px,${dy}px)`;
    const nx=dx/max, ny=dy/max, dead=.24;
    key('KeyW',ny<-dead); key('KeyS',ny>dead); key('KeyA',nx<-dead); key('KeyD',nx>dead);
  }
  joy.addEventListener('pointerdown',e=>{joyPointer=e.pointerId;joy.setPointerCapture(e.pointerId);setJoy(e.clientX,e.clientY);e.preventDefault();});
  joy.addEventListener('pointermove',e=>{if(e.pointerId===joyPointer)setJoy(e.clientX,e.clientY);});
  function endJoy(e){if(e.pointerId!==joyPointer)return;joyPointer=null;knob.style.transform='translate(0,0)';releaseAll();}
  joy.addEventListener('pointerup',endJoy); joy.addEventListener('pointercancel',endJoy);

  const look=root.querySelector('.lookZone');
  let lookPointer=null,lastX=0,lastY=0;
  look.addEventListener('pointerdown',e=>{lookPointer=e.pointerId;lastX=e.clientX;lastY=e.clientY;look.setPointerCapture(e.pointerId); const c=window.__HOUSE_POINTER_CONTROLS__; if(c&&!c.isLocked)c.lock(); e.preventDefault();});
  look.addEventListener('pointermove',e=>{
    if(e.pointerId!==lookPointer)return;
    const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;
    const ev=new MouseEvent('mousemove',{bubbles:true});
    Object.defineProperty(ev,'movementX',{value:dx*1.15});
    Object.defineProperty(ev,'movementY',{value:dy*1.15});
    document.dispatchEvent(ev);
  });
  const endLook=e=>{if(e.pointerId===lookPointer)lookPointer=null;};
  look.addEventListener('pointerup',endLook);look.addEventListener('pointercancel',endLook);

  document.getElementById('mEnter').onclick=()=>document.getElementById('enter')?.click();
  document.getElementById('mPanel').onclick=()=>{
    const p=document.querySelector('.panel'); if(!p)return;
    const hidden=p.dataset.mobileHidden==='1'; p.dataset.mobileHidden=hidden?'0':'1'; p.style.display=hidden?'block':'none';
  };
  document.getElementById('mWheel').onclick=()=>{
    const s=document.getElementById('profile'); if(!s)return;
    s.value=s.value==='wheelchair'?'walk':'wheelchair'; s.dispatchEvent(new Event('change'));
    document.getElementById('mWheel').textContent=s.value==='wheelchair'?'Walking':'Wheelchair';
  };

  addEventListener('blur',releaseAll);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseAll();});
}
