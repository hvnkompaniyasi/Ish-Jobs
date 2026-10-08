/**
 * Form-data JSON parse middleware.
 * Multipart'dagi string maydonlarni (salary, location, company, ...) JSON.parse qiladi.
 * Multer'dan keyin, validate'dan oldin ishlatiladi.
 */

const JSON_FIELDS = [
  'salary',
  'location',
  'company',
  'skills',
  'requirements',
  'responsibilities',
];

const parseFormData = (req, res, next) => {
  if (!req.body) return next();

  JSON_FIELDS.forEach((field) => {
    if (typeof req.body[field] === 'string') {
      try {
        req.body[field] = JSON.parse(req.body[field]);
      } catch {
        // String sifatida qoldiriladi — Joi o'zi xato qaytaradi
      }
    }
  });

  next();
};

module.exports = parseFormData;
