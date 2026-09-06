import fs from 'node:fs';
import path from 'node:path';

const repo=process.cwd();
const manifestPath=path.join(repo,'src','tour-manifest-v14.js');
const text=fs.readFileSync(manifestPath,'utf8');
const sceneIds=[...text.matchAll(/id:'([^']+)'/g)].map(m=>m[1]);
const unique=[...new Set(sceneIds)];
const faces=['px','nx','py','ny','pz','nz'];
const route=['exterior-front','entrance','hallway','living','dining','kitchen','terrace','pool'];
const report=[];
let missingRequired=0;

for(const id of unique){
  const dir=path.join(repo,'assets','tour-v14',id);
  const existing=faces.filter(f=>fs.existsSync(path.join(dir,`${f}.jpg`)));
  const missing=faces.filter(f=>!existing.includes(f));
  const required=route.includes(id);
  if(required && missing.length) missingRequired+=missing.length;
  report.push({id,required,existing,missing,complete:missing.length===0});
}

fs.mkdirSync(path.join(repo,'artifacts'),{recursive:true});
fs.writeFileSync(path.join(repo,'artifacts','cubemap-status.json'),JSON.stringify({generatedAt:new Date().toISOString(),route,scenes:report},null,2));

console.log('\nCubemap status');
for(const r of report){
  console.log(`${r.complete?'✓':'·'} ${r.id}${r.required?' [primary route]':''}: ${r.existing.length}/6 faces`);
}

if(process.env.STRICT_TOUR_ASSETS==='1' && missingRequired){
  console.error(`\nPrimary route is missing ${missingRequired} cube faces.`);
  process.exit(1);
}
