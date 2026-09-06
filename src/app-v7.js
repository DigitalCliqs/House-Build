// v7 application bootstrap: mobile compatibility first, then the active
// high-fidelity renderer, followed by presentation/accessibility/mobile UI.
await import('./mobile-preload-v7.js');
await import('./viewer-bootstrap-v6.js');
await import('./presentation-v3.js');
await import('./accessibility-v7.js');
await import('./mobile-controls-v7.js');

const label=document.getElementById('sceneLabel');
if(label) label.textContent='Finished concept v7 · desktop + mobile · accessibility review · EuroMax villa + landscaped yard';
