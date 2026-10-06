/**
 * Parol bilan ishlash: shifrlash va tekshirish.
 */

const bcrypt = require('bcryptjs');
const env = require('../configs/env');

async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, env.BCRYPT_SALT_ROUNDS);
}

async function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = { hashPassword, comparePassword };
