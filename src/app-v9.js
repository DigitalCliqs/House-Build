// v9 application bootstrap: keep the mobile-first high-fidelity walkthrough,
// retain the v8 overview, then layer the more detailed wheelchair sweep audit.
await import('./mobile-preload-v7.js');
await import('./viewer-bootstrap-v6.js');
await import('./presentation-v3.js');
await import('./mobile-controls-v7.js');
await import('./accessibility-v8.js');
await import('./accessibility-v9.js');

const label=document.getElementById('sceneLabel');
if(label) label.textContent='Finished concept v9 · desktop + mobile · wheelchair swept-path + transfer-zone audit · EuroMax villa';
