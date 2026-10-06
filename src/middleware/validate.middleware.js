/**
 * Validatsiya middleware.
 * Berilgan Joi sxema bo'yicha req.body ni tekshiradi.
 * Xato bo'lsa — 400 status bilan chiqaradi.
 */

const ApiError = require('../utils/ApiError');

const validate = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false, // Barcha xatolarni yig'ish
    stripUnknown: true, // Noma'lum maydonlarni olib tashlash
    convert: true,
  });

  if (error) {
    const errors = error.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message,
    }));
    return next(new ApiError(400, 'Validatsiya xatosi', errors));
  }

  req[source] = value;
  next();
};

module.exports = validate;
