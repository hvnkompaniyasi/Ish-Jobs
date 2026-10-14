const fs=require('fs');
const f='src/app/jobs/map/page.tsx';
let c=fs.readFileSync(f,'utf8');

const old='className="shrink-0 rounded-full bg-sky-500/20 border border-sky-500/40 p-1.5 text-sky-300 hover:bg-sky-500/30 transition"';
const nw='className="shrink-0 inline-flex items-center justify-center text-sky-500 hover:text-sky-400 transition"';

if(!c.includes(old)){console.error('XATO: tugma klassi topilmadi');process.exit(1)}
c=c.replace(old,nw);
fs.writeFileSync(f,c);
console.log('OK: dumaloq fon olib tashlandi');
