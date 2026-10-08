/**
 * Notification modeli — foydalanuvchi xabarnomalari.
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    // Kimga (recipient)
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Turi
    type: {
      type: String,
      enum: [
        'application_received',  // Employer'ga: yangi ariza
        'application_status',    // Seeker'ga: status o'zgardi
        'job_closed',            // Seeker'ga: vakansiya yopildi
        'system',                // Tizim xabari
      ],
      required: true,
    },

    // Sarlavha va matn
    title: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, trim: true, maxlength: 1000 },

    // Kim yubordi
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Link (qayerga o'tish)
    link: { type: String, trim: true, default: null },

    // O'qilgan/o'qilmagan
    read: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },

    // Qo'shimcha ma'lumot (job ID, application ID)
    meta: {
      jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
      applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indekslar
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

notificationSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Notification', notificationSchema);
