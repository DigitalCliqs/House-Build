// v8 application bootstrap: mobile-first high-fidelity walkthrough plus
// deeper concept accessibility analysis.
await import('./mobile-preload-v7.js');
await import('./viewer-bootstrap-v6.js');
await import('./presentation-v3.js');
await import('./mobile-controls-v7.js');
await import('./accessibility-v8.js');

const label=document.getElementById('sceneLabel');
if(label) label.textContent='Finished concept v8 · desktop + mobile · wheelchair route audit · EuroMax villa + landscaped yard';
