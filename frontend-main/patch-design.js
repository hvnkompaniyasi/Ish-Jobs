const fs = require('fs');

// ═══════════════════════════════════════════════════════
// 1) MapView.tsx — Popup tugmalar dizayni
// ═══════════════════════════════════════════════════════
const mvP = 'src/components/map/MapView.tsx';
let mv = fs.readFileSync(mvP, 'utf8');

// Yashil "Batafsil" tugma class
const oldGreen = `"flex-1 block rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 py-2 text-center text-[12.5px] font-bold text-slate-950 transition-all hover:from-emerald-400 hover:to-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.45)]"`;
const newGreen = `"flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2 text-[12.5px] font-semibold text-white transition hover:bg-emerald-400"`;

// Ko'k "Telegram" tugma class
const oldBlue = `"flex-1 block rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 py-2 text-center text-[12.5px] font-bold text-white transition-all hover:from-sky-400 hover:to-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.45)]"`;
const newBlue = `"flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-sky-500 py-2 text-[12.5px] font-semibold text-white transition hover:bg-sky-400"`;

let mvChanges = 0;
if (mv.includes(oldGreen)) { mv = mv.replace(oldGreen, newGreen); mvChanges++; }
if (mv.includes(oldBlue))  { mv = mv.replace(oldBlue, newBlue);  mvChanges++; }

// "Batafsil ↗" → "Batafsil" + arrow SVG
const oldTxt = `Batafsil ↗`;
const newTxt = `Batafsil
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>`;
if (mv.includes(oldTxt)) { mv = mv.replace(oldTxt, newTxt); mvChanges++; }

fs.writeFileSync(mvP, mv);
console.log('MapView.tsx: ' + mvChanges + ' ta o\'zgarish');

// ═══════════════════════════════════════════════════════
// 2) page.tsx — Carousel tozalash (dumaloq tugma + ✈️)
// ═══════════════════════════════════════════════════════
const pgP = 'src/app/jobs/map/page.tsx';
let pg = fs.readFileSync(pgP, 'utf8');

const oldBlock = `                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center justify-between gap-2"><span className="text-[13px] font-bold text-emerald-400">{salaryStr}</span>{(job.company as any)?.telegramContact&&(<a href={\`https://t.me/\${((job.company as any).telegramContact as string).replace(/^@/,"")}\`} target="_blank" rel="noopener noreferrer" onClick={(e:any)=>e.stopPropagation()} className="rounded-full bg-sky-500/20 border border-sky-500/40 p-1.5 text-sky-300 hover:bg-sky-500/30 transition" aria-label="Telegram"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0z"/></svg></a>)}</div>
                    {(job.company as { telegramContact?: string | null } | undefined)?.telegramContact && (
                      <a
                        href={\`https://t.me/\${((job.company as { telegramContact: string }).telegramContact).replace(/^@/, "")}?text=\${encodeURIComponent(
                          \`Assalomu alaykum! IshJobs orqali"\${job.title}" vakansiyasini ko'rdim.\`,
                        )}\`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-full bg-sky-500/20 border border-sky-500/40 px-2 py-0.5 text-[11px] font-semibold text-sky-300 hover:bg-sky-500/30 transition"
                      >
                        ✈️
                      </a>
                    )}
                  </div>`;

const newBlock = `                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-[13px] font-bold text-emerald-400">{salaryStr}</span>
                    {(job.company as { telegramContact?: string | null } | undefined)?.telegramContact && (
                      <a
                        href={\`https://t.me/\${((job.company as { telegramContact: string }).telegramContact).replace(/^@/, "")}?text=\${encodeURIComponent(
                          \`Assalomu alaykum! IshJobs orqali "\${job.title}" vakansiyasini ko'rdim.\`,
                        )}\`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="shrink-0 rounded-full bg-sky-500/20 border border-sky-500/40 p-1.5 text-sky-300 hover:bg-sky-500/30 transition"
                        aria-label="Telegram"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                        </svg>
                      </a>
                    )}
                  </div>`;

if (pg.includes(oldBlock)) {
  pg = pg.replace(oldBlock, newBlock);
  fs.writeFileSync(pgP, pg);
  console.log('page.tsx: carousel tozalandi');
} else {
  console.error('page.tsx: blok topilmadi');
}
