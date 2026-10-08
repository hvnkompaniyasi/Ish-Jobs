const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: [true, 'Ism kiritilishi shart'], trim: true, minlength: [2, 'Ism kamida 2 belgi'], maxlength: [50, 'Ism 50 belgidan oshmasin'] },
    lastName: { type: String, required: [true, 'Familiya kiritilishi shart'], trim: true, minlength: [2, 'Familiya kamida 2 belgi'], maxlength: [50, 'Familiya 50 belgidan oshmasin'] },
    avatarUrl: { type: String, default: null },
    avatarPublicId: { type: String, default: null },
    phone: { type: String, required: [true, 'Telefon raqam kiritilishi shart'], trim: true, unique: true, match: [/^\+?\d{9,15}$/, 'Telefon raqam formati notogri'] },
    email: { type: String, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Email formati notogri'] },
    password: { type: String, required: [true, 'Parol kiritilishi shart'], minlength: [8, 'Parol kamida 8 belgi'] },
    roles: { type: [String], enum: { values: ['seeker', 'employer', 'admin'], message: 'Rol faqat: seeker, employer, admin' }, default: ['seeker'] },
    activeRole: { type: String, enum: { values: ['seeker', 'employer', 'admin'], message: 'Faol rol faqat: seeker, employer, admin' }, default: 'seeker', index: true },
    role: { type: String, enum: { values: ['seeker', 'employer', 'admin'], message: 'Rol faqat: seeker, employer, admin' }, default: 'seeker' },
    company: { name: { type: String, trim: true, default: null }, website: { type: String, trim: true, default: null }, logo: { type: String, trim: true, default: null } },
    telegramId: { type: String, default: null, sparse: true },
    refreshTokens: [{ token: String, createdAt: { type: Date, default: Date.now }, expiresAt: Date }],
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: 'string' } } }
);

userSchema.pre('save', async function () {
  if (this.activeRole && !this.roles.includes(this.activeRole)) this.roles.push(this.activeRole);
  if (this.activeRole) this.role = this.activeRole;
});

userSchema.virtual('fullName').get(function () { return `${this.firstName} ${this.lastName}`; });

userSchema.set('toJSON', { transform: (doc, ret) => { delete ret.password; delete ret.refreshTokens; delete ret.__v; return ret; } });

userSchema.index({ isActive: 1, activeRole: 1 });

module.exports = mongoose.model('User', userSchema);
