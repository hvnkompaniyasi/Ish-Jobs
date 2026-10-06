/**
 * Application modeli — arizalar va AI matching natijalari.
 */

const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    // Arizachi
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Qaysi rezyume bilan
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    // Qaysi ishga
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },

    // Cover letter
    coverLetter: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: null,
    },

    // Status
    status: {
      type: String,
      enum: [
        'pending',      // Yuborilgan
        'reviewing',    // Ko'rilmoqda
        'shortlisted',  // Tanlangan
        'interview',    // Suhbat
        'accepted',     // Qabul
        'rejected',     // Rad etilgan
        'withdrawn',    // Ariza olib tashlangan
      ],
      default: 'pending',
      index: true,
    },

    // AI Matching natijalari
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null, // 0-100 ball
    },
    matchDetails: {
      skillsMatch: { type: Number, min: 0, max: 100, default: null },
      experienceMatch: { type: Number, min: 0, max: 100, default: null },
      locationMatch: { type: Number, min: 0, max: 100, default: null },
      salaryMatch: { type: Number, min: 0, max: 100, default: null },
    },
    aiAnalysis: {
      type: String,
      default: null, // DeepSeek R1 ning izohi
    },
    aiModel: {
      type: String,
      default: null, // 'deepseek-chat' yoki 'deepseek-reasoner'
    },

    // Employer javobi
    employerNote: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null,
    },

    // Sanalar
    viewedAt: { type: Date, default: null },
    respondedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============ INDEKSLAR ============
// Bir foydalanuvchi bir ishga bir marta ariza bera oladi
applicationSchema.index({ applicant: 1, job: 1 }, { unique: true });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ matchScore: -1 });

// ============ VIRTUAL ============
applicationSchema.virtual('isHighMatch').get(function () {
  return this.matchScore && this.matchScore >= 70;
});

// ============ toJSON ============
applicationSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Application', applicationSchema);
