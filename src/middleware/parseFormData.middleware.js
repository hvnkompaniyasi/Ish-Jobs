/**
 * Form-data JSON parse middleware.
 * Multipart'dagi string maydonlarni (salary, location, locationPoint, ...) JSON.parse qiladi.
 */

const JSON_FIELDS = [
  'salary',
  'location',
  'locationPoint',
  'company',
  'skills',
  'requirements',
  'responsibilities',
];

const parseFormData = (req, res, next) => {
  if (!req.body) return next();

  JSON_FIELDS.forEach((field) => {
    const value = req.body[field];
    if (typeof value === 'string') {
      try {
        req.body[field] = JSON.parse(value);
      } catch (err) {
        // String sifatida qoldiriladi
      }
    }
  });

  next();
};

module.exports = parseFormData;
