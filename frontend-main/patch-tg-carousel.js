const fs = require('fs');
const path = 'src/app/jobs/map/page.tsx';
let c = fs.readFileSync(path, 'utf8');

const oldLine = '<div className="mt-2 text-[13px] font-bold text-emerald-400">{salaryStr}</div>';

if (!c.includes(oldLine)) {
  console.error('XATO: salary qatori topilmadi');
  process.exit(1);
}

const newBlock = `<div className="mt-2 flex items-center justify-between">
                    <span className="text-[13px] font-bold text-emerald-400">{salaryStr}</span>
                    {(job.company as { telegramContact?: string | null } | undefined)?.telegramContact && (
                      <a
                        href={\`https://t.me/\${((job.company as { telegramContact: string }).telegramContact).replace(/^@/, "")}?text=\${encodeURIComponent(
                          \`Assalomu alaykum! IshJobs orqali "\${job.title}" vakansiyasini ko'rdim.\`,
                        )}\`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-full bg-sky-500/20 border border-sky-500/40 p-1.5 text-sky-300 hover:bg-sky-500/30 transition"
                        aria-label="Telegram"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                        </svg>
                      </a>
                    )}
                  </div>`;

c = c.replace(oldLine, newBlock);
fs.writeFileSync(path, c);
console.log('OK: page.tsx yangilandi');
