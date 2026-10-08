/**
 * Job modeli — ish e'lonlari (vakansiyalar).
 */

const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    // E'lon egasi
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: [true, 'Sarlavha kerak'],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: [true, 'Tavsif kerak'],
      trim: true,
      maxlength: 10000,
    },
    requirements: [
      {
        type: String,
        trim: true,
        maxlength: 500,
      },
    ],
    responsibilities: [
      {
        type: String,
        trim: true,
        maxlength: 500,
      },
    ],

    // Kategoriya va ko'nikmalar
    category: {
      type: String,
      trim: true,
      default: 'other',
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    // Ish turi
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'],
      default: 'full-time',
    },
    experienceLevel: {
      type: String,
      enum: ['intern', 'junior', 'middle', 'senior', 'lead'],
      default: 'middle',
    },

    // Maosh
    salary: {
      min: { type: Number, min: 0, default: null },
      max: { type: Number, min: 0, default: null },
      currency: { type: String, default: 'UZS' },
      isNegotiable: { type: Boolean, default: false },
    },

    // Joylashuv
    location: {
      city: { type: String, trim: true, default: null },
      country: { type: String, trim: true, default: 'UZ' },
      isRemote: { type: Boolean, default: false },
    },

    // Kompaniya
    company: {
      name: { type: String, trim: true },
      logo: { type: String, default: null },
      website: { type: String, default: null },
    },

    // Muddat va status
    deadline: { type: Date, default: null },
    status: {
      type: String,
      enum: ['draft', 'active', 'closed', 'archived'],
      default: 'active',
      index: true,
    },

    // Statistika
    viewsCount: { type: Number, default: 0 },
    applicationsCount: { type: Number, default: 0 },

    // AI embedding (matching uchun)
    embedding: {
      type: [Number],
      default: [],
      select: false,
    },

    // Telegram kanalga yuborilganmi?
    publishedToTelegram: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============ INDEKSLAR ============
jobSchema.index({ title: 'text', description: 'text', skills: 'text' });
jobSchema.index({ employer: 1, status: 1, createdAt: -1 });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ 'location.city': 1, status: 1 });
jobSchema.index({ category: 1, status: 1 });
jobSchema.index({ createdAt: -1 });

// ============ VIRTUAL ============
jobSchema.virtual('isExpired').get(function () {
  return this.deadline && this.deadline < new Date();
});

jobSchema.virtual('salaryFormatted').get(function () {
  if (!this.salary.min && !this.salary.max) return 'Kelishiladi';
  if (this.salary.isNegotiable) return 'Kelishiladi';
  const cur = this.salary.currency;
  const min = this.salary.min ? `${this.salary.min.toLocaleString()}` : '';
  const max = this.salary.max ? `${this.salary.max.toLocaleString()}` : '';
  if (min && max) return `${min} - ${max} ${cur}`;
  if (min) return `${min}+ ${cur}`;
  return `${max} ${cur}`;
});

// ============ toJSON ============
jobSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.embedding;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Job', jobSchema);
