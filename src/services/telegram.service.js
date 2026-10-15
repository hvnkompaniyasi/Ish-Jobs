/**
 * Telegram bot integratsiyasi.
 * Yangi vakansiya yaratilganda kanalga avtomatik post yuboradi.
 */

const axios = require('axios');
const env = require('../configs/env');
const logger = require('../configs/logger');

const API_BASE = 'https://api.telegram.org';

function isConfigured() {
  return Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHANNEL_ID);
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatSalary(salary) {
  if (!salary) return 'Kelishilgan';
  if (typeof salary === 'string') return salary;
  const { min, max, currency = 'UZS', isNegotiable } = salary;
  if (min == null && max == null) return isNegotiable ? 'Kelishilgan' : '—';
  const fmt = (n) => new Intl.NumberFormat('uz-UZ').format(n);
  if (min != null && max != null) return `${fmt(min)} – ${fmt(max)} ${currency}`;
  if (min != null) return `${fmt(min)}+ ${currency}`;
  return `${fmt(max)} ${currency}`;
}

function buildMessage(job) {
  const companyName =
    typeof job.company === 'object' && job.company
      ? job.company.name || 'Kompaniya'
      : job.company || 'Kompaniya';

  const city = job.location?.city || "O'zbekiston";
  const salary = formatSalary(job.salary);
  const url = `https://ish-jobs.vercel.app/jobs/${job._id}`;

  const lines = [
    `💼 <b>${escapeHtml(job.title)}</b>`,
    '',
    `🏢 <b>Kompaniya:</b> ${escapeHtml(companyName)}`,
    `💰 <b>Maosh:</b> ${escapeHtml(salary)}`,
    `📍 <b>Manzil:</b> ${escapeHtml(city)}`,
  ];

  if (job.employmentType) {
    const map = {
      'full-time': "To'liq stavka",
      'part-time': 'Yarim stavka',
      'contract': 'Shartnoma',
      'internship': 'Amaliyot',
      'remote': 'Masofadan',
    };
    lines.push(`⏰ <b>Bandlik:</b> ${map[job.employmentType] || job.employmentType}`);
  }

  if (job.experienceLevel) {
    const map = {
      intern: 'Amaliyotchi',
      junior: 'Junior',
      middle: 'Middle',
      senior: 'Senior',
      lead: 'Lead',
    };
    lines.push(`📊 <b>Tajriba:</b> ${map[job.employmentType] || job.experienceLevel}`);
  }

  lines.push(
    '',
    `🔗 <a href="${url}">Batafsil va ariza topshirish</a>`,
    '',
    `<i>IshJobs — O'zbekistonda ish topish oson.</i>`
  );

  return lines.join('\n');
}

/**
 * Telegram kanalga xabar yuboradi.
 * @param {Object} job — Job hujjati (lean yoki mongoose)
 * @returns {Promise<{ok: boolean, messageId?: number, error?: string}>}
 */
async function postToChannel(job) {
  if (!isConfigured()) {
    logger.info('[telegram] Sozlanmagan — post yuborilmadi');
    return { ok: false, error: 'Not configured' };
  }

  const url = `${API_BASE}/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  const text = buildMessage(job);

  try {
    const res = await axios.post(
      url,
      {
        chat_id: env.TELEGRAM_CHANNEL_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      },
      { timeout: 10000 }
    );

    if (res.data && res.data.ok) {
      logger.success(`[telegram] Xabar yuborildi (messageId=${res.data.result.message_id})`);
      return { ok: true, messageId: res.data.result.message_id };
    }

    logger.error('[telegram] Xato javob:', res.data);
    return { ok: false, error: 'Bad response' };
  } catch (e) {
    const msg = e?.response?.data?.description || e.message;
    logger.error('[telegram] Yuborishda xato:', msg);
    return { ok: false, error: msg };
  }
}

module.exports = {
  isConfigured,
  postToChannel,
  buildMessage,
};
