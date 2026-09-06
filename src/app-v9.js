// v9 application bootstrap with mobile controls loaded as an early, cache-busted dependency.
await import('./mobile-preload-v7.js?v=13');
await import('./viewer-bootstrap-v6.js?v=13');
await import('./mobile-controls-v7.js?v=13');

// Non-essential presentation/audit layers load after the core viewer + mobile controls.
try { await import('./presentation-v3.js?v=13'); } catch (e) { console.warn('presentation layer skipped', e); }
try { await import('./accessibility-v8.js?v=13'); } catch (e) { console.warn('accessibility v8 skipped', e); }
try { await import('./accessibility-v9.js?v=13'); } catch (e) { console.warn('accessibility v9 skipped', e); }

const label=document.getElementById('sceneLabel');
if(label) label.textContent='Finished concept v9 · desktop + mobile · wheelchair swept-path + transfer-zone audit · EuroMax villa';
