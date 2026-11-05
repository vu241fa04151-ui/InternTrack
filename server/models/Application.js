const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: [
        'Interested',
        'Applied',
        'Assessment',
        'Shortlisted',
        'Interview',
        'Selected',
        'Rejected',
        'Withdrawn',
      ],
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Application must belong to a user'],
      index: true,
    },
    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship',
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Internship title is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    applicationDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    applicationLink: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      type: String,
      default: 'Remote',
      trim: true,
    },
    stipend: {
      type: String,
      default: 'Not Disclosed',
      trim: true,
    },
    deadline: {
      type: Date,
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: [
        'Interested',
        'Applied',
        'Assessment',
        'Shortlisted',
        'Interview',
        'Selected',
        'Rejected',
        'Withdrawn',
      ],
      default: 'Applied',
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
    nextFollowUpDate: {
      type: Date,
      default: null,
      index: true,
    },
    statusHistory: [statusHistorySchema],
  },
  {
    timestamps: true,
  }
);

// Compound index for fast queries by user and status/date
applicationSchema.index({ user: 1, status: 1 });
applicationSchema.index({ user: 1, applicationDate: -1 });
applicationSchema.index({ user: 1, deadline: 1 });

module.exports = mongoose.model('Application', applicationSchema);
