import { HOUSE, ROOMS } from './house-config.js';

// Design-development accessibility validator.
// Uses the current configurable geometry; final compliance must be rerun with
// the architect's dimensioned plan and verified on constructed clear widths.
const REQUIREMENTS = {
  corridor: 1.50,
  roomDoor: 0.90,
  entranceDoor: 1.10,
  turnDiameter: 1.50,
  furnitureRoute: 0.90,
  kitchenWorkingRoute: 1.20,
};

const results = [];
function check(name, actual, required, unit='m') {
  const pass = actual >= required;
  results.push({name,actual,required,pass,unit});
  return pass;
}

check('Concept standard door', HOUSE.standardDoor, REQUIREMENTS.roomDoor);
check('Concept accessible door', HOUSE.accessibleDoor, REQUIREMENTS.roomDoor);
check('Concept entrance door', HOUSE.entranceDoor, REQUIREMENTS.entranceDoor);

for (const room of ROOMS) {
  const minSide = Math.min(room.w, room.d);
  if (['accessible','bath','kitchen','living','dining','storage'].includes(room.id)) {
    check(`${room.name} turning envelope`, minSide, REQUIREMENTS.turnDiameter);
  }
}

const panel = document.querySelector('.panel');
if (panel) {
  const wrap = document.createElement('div');
  wrap.className = 'section';
  const passed = results.filter(r=>r.pass).length;
  wrap.innerHTML = `
    <div class="section-title">Accessibility validator</div>
    <div class="a11y-summary"><b>${passed}/${results.length}</b> current concept checks pass</div>
    <div class="row"><label>Overlay</label><select id="a11yOverlay"><option value="off">Off</option><option value="turn">1.50 m turn</option><option value="wheelchair">Wheelchair profile</option></select></div>
    <div class="a11y-grid">${results.map(r=>`
      <div class="a11y-row ${r.pass?'pass':'fail'}">
        <span>${r.pass?'✓':'!'}</span><b>${r.name}</b><small>${r.actual.toFixed(2)} ${r.unit} / ≥ ${r.required.toFixed(2)} ${r.unit}</small>
      </div>`).join('')}</div>
    <div class="a11y-note">Concept-level check only. Exact clear openings, transfer spaces, furniture encroachment, gradients and swept paths must be recalculated from the final dimensioned architect plan.</div>
  `;
  panel.appendChild(wrap);

  const style=document.createElement('style');
  style.textContent=`
    .a11y-summary{font-size:12px;padding:8px 10px;border-radius:9px;background:rgba(255,255,255,.06);margin-bottom:8px}.a11y-grid{display:grid;gap:5px}.a11y-row{display:grid;grid-template-columns:18px 1fr auto;gap:6px;align-items:center;padding:6px 7px;border-radius:8px;background:rgba(255,255,255,.045);font-size:10px}.a11y-row.pass span{color:#8ee7ae}.a11y-row.fail span{color:#ffb19d}.a11y-row small{opacity:.68;text-align:right}.a11y-note{font-size:10px;line-height:1.4;opacity:.58;margin-top:8px}
  `;document.head.appendChild(style);

  document.getElementById('a11yOverlay').onchange=e=>{
    if(e.target.value==='turn'){
      const t=document.getElementById('turn'); if(t){t.value='on';t.dispatchEvent(new Event('change'));}
    } else if(e.target.value==='wheelchair') {
      const p=document.getElementById('profile'); if(p){p.value='wheelchair';p.dispatchEvent(new Event('change'));}
      const t=document.getElementById('turn'); if(t){t.value='on';t.dispatchEvent(new Event('change'));}
    } else {
      const t=document.getElementById('turn'); if(t){t.value='off';t.dispatchEvent(new Event('change'));}
    }
  };
}

window.__HOUSE_ACCESSIBILITY_RESULTS__ = { requirements: REQUIREMENTS, results };
