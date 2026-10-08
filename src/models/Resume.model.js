/**
 * Resume modeli — foydalanuvchi rezyumelari.
 * Matn, audio (ovozli), skills, tajriba, ta'lim.
 */

const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema(
  {
    company: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null }, // null = hali ishlayapti
    current: { type: Boolean, default: false },
    description: { type: String, trim: true, maxlength: 2000 },
  },
  { _id: false }
);

const educationSchema = new mongoose.Schema(
  {
    institution: { type: String, required: true, trim: true },
    degree: { type: String, trim: true },
    field: { type: String, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
  },
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Rezyume sarlavhasi kerak'],
      trim: true,
      maxlength: 150,
    },
    about: {
      type: String,
      trim: true,
      maxlength: 3000,
    },

    // Ovozli rezyume uchun
    audioUrl: {
      type: String,
      default: null,
    },
    audioTranscript: {
      type: String,
      default: null, // Whisper/Aisha AI natijasi
    },

    // Ko'nikmalar
    skills: [
      {
        type: String,
        trim: true,
        maxlength: 50,
      },
    ],

    // Tajriba va ta'lim
    experience: [experienceSchema],
    education: [educationSchema],

    // Qo'shimcha
    languages: [String], // ['uz', 'ru', 'en']
    expectedSalary: {
      min: { type: Number, min: 0, default: null },
      max: { type: Number, min: 0, default: null },
      currency: { type: String, default: 'UZS' },
    },
    location: {
      type: String,
      trim: true,
      default: null,
    },

    // AI matching uchun vektor (keyin to'ldiramiz)
    embedding: {
      type: [Number],
      default: [],
      select: false,
    },

    // Holat
    isPublic: { type: Boolean, default: true },
    isPrimary: { type: Boolean, default: false }, // Asosiy rezyume
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============ INDEKSLAR ============
resumeSchema.index({ user: 1, isPrimary: 1 });
resumeSchema.index({ skills: 1 });
resumeSchema.index({ user: 1, isPublic: 1, createdAt: -1 });
resumeSchema.index({ 'expectedSalary.min': 1, 'expectedSalary.max': 1 });

// Text index (qidiruv uchun)
resumeSchema.index({ title: 'text', about: 'text', skills: 'text' });

// ============ VIRTUAL ============
resumeSchema.virtual('experienceYears').get(function () {
  if (!this.experience || this.experience.length === 0) return 0;

  let totalMonths = 0;
  for (const exp of this.experience) {
    const start = new Date(exp.startDate);
    const end = exp.current ? new Date() : new Date(exp.endDate || new Date());
    totalMonths += (end - start) / (1000 * 60 * 60 * 24 * 30);
  }
  return Math.round(totalMonths / 12 * 10) / 10; // 1 xona aniqlik
});

// ============ toJSON ============
resumeSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.embedding; // Katta massiv
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Resume', resumeSchema);
