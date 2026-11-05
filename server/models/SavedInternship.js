const mongoose = require('mongoose');

const savedInternshipSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Saved record must belong to a user'],
      index: true,
    },
    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship',
      required: [true, 'Internship reference is required'],
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index prevents duplicate saves per student
savedInternshipSchema.index({ user: 1, internship: 1 }, { unique: true });

module.exports = mongoose.model('SavedInternship', savedInternshipSchema);
