/**
 * User modeli — tizim foydalanuvchilari.
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Ism kiritilishi shart'],
      trim: true,
      minlength: [2, 'Ism kamida 2 belgi'],
      maxlength: [50, 'Ism 50 belgidan oshmasin'],
    },
    lastName: {
      type: String,
      required: [true, 'Familiya kiritilishi shart'],
      trim: true,
      minlength: [2, 'Familiya kamida 2 belgi'],
      maxlength: [50, 'Familiya 50 belgidan oshmasin'],
    },
    email: {
      type: String,
      required: [true, 'Email kiritilishi shart'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email formati notogri'],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?\d{9,15}$/, 'Telefon raqam formati notogri'],
      default: null,
    },
    password: {
      type: String,
      required: [true, 'Parol kiritilishi shart'],
      minlength: [8, 'Parol kamida 8 belgi'],
      // select: false OLIB TASHLANDI
    },
    role: {
      type: String,
      enum: {
        values: ['seeker', 'employer', 'admin'],
        message: 'Rol faqat: seeker, employer, admin',
      },
      default: 'seeker',
    },
    company: {
      name: { type: String, trim: true, default: null },
      website: { type: String, trim: true, default: null },
      logo: { type: String, trim: true, default: null },
    },
    telegramId: {
      type: String,
      default: null,
      sparse: true,
    },
    refreshTokens: [
      {
        token: String,
        createdAt: { type: Date, default: Date.now },
        expiresAt: Date,
      },
    ],
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============ VIRTUAL ============
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// ============ toJSON — parolni yashirish ============
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.refreshTokens;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
