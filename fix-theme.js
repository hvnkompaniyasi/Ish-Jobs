const fs = require('fs');

const f = 'src/app/jobs/map/page.tsx';
let c = fs.readFileSync(f, 'utf8');
let n = 0;

c = c.replace('"hidden w-[400px] shrink-0 flex-col border-r border-zinc-800/60 bg-zinc-950 md:flex"','"hidden w-[400px] shrink-0 flex-col border-r border-zinc-200 bg-white md:flex dark:border-zinc-800/60 dark:bg-zinc-950"'); n++;
c = c.replace('<div className="border-b border-zinc-800/60 px-5 py-4">','<div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800/60">'); n++;
c = c.replace('<h1 className="text-lg font-bold text-white">Xaritada ishlar</h1>','<h1 className="text-lg font-bold text-zinc-900 dark:text-white">Xaritada ishlar</h1>'); n++;
c = c.replace('<p className="text-xs text-zinc-400">','<p className="text-xs text-zinc-500 dark:text-zinc-400">'); n++;
c = c.replace('"rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800"','"rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"'); n++;
c = c.replace('<div className="space-y-3 border-b border-zinc-800/60 px-4 py-3">','<div className="space-y-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800/60">'); n++;
c = c.replace(/border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800/g,'border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'); n++;
c = c.replace('"border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900"','"border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"'); n++;
c = c.replace('"border-emerald-500/60 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.25)]"','"border-emerald-500/60 bg-emerald-50 shadow-[0_0_20px_rgba(16,185,129,0.25)] dark:bg-emerald-500/10"'); n++;
c = c.replace('"border-emerald-500/40 bg-zinc-900"','"border-emerald-500/40 bg-zinc-50 dark:bg-zinc-900"'); n++;
c = c.replace('<h3 className="mt-1 line-clamp-2 text-[13px] font-semibold leading-snug text-white">','<h3 className="mt-1 line-clamp-2 text-[13px] font-semibold leading-snug text-zinc-900 dark:text-white">'); n++;
c = c.replace('<div className="mt-1.5 flex items-center gap-2 text-[11px] text-zinc-400">','<div className="mt-1.5 flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">'); n++;
c = c.replace('"rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center"','"rounded-xl border border-zinc-200 bg-zinc-50 p-6 text-center dark:border-zinc-800 dark:bg-zinc-900/50"'); n++;
c = c.replace('<h3 className="mt-2 text-sm font-semibold text-white">','<h3 className="mt-2 text-sm font-semibold text-zinc-900 dark:text-white">'); n++;

fs.writeFileSync(f, c);
console.log('page.tsx: ' + n + ' almashtirish');

const cf = 'src/app/globals.css';
let cs = fs.readFileSync(cf, 'utf8');
if (!cs.includes('/* MAP CONTAINER BACKGROUND */')) {
  cs += '\n\n/* MAP CONTAINER BACKGROUND — theme-aware */\n.leaflet-container { background: #f1f5f9 !important; }\nhtml.dark .leaflet-container,\n.dark .leaflet-container { background: #0b1220 !important; }\n';
  fs.writeFileSync(cf, cs);
  console.log('globals.css: OK');
} else console.log('globals.css: SKIP');
