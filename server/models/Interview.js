const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Interview must belong to a user'],
      index: true,
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      default: null,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Internship role is required'],
      trim: true,
    },
    interviewDate: {
      type: Date,
      required: [true, 'Interview date is required'],
      index: true,
    },
    interviewTime: {
      type: String,
      required: [true, 'Interview time is required (e.g. 14:00)'],
      trim: true,
    },
    interviewMode: {
      type: String,
      enum: ['Google Meet', 'Zoom', 'MS Teams', 'In-Person', 'Phone'],
      default: 'Google Meet',
    },
    interviewRound: {
      type: String,
      enum: [
        'Screening',
        'Technical Round 1',
        'Technical Round 2',
        'System Design',
        'Managerial',
        'HR / Final',
      ],
      default: 'Technical Round 1',
    },
    meetingLink: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    preparationNotes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
      default: 'Scheduled',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

interviewSchema.index({ user: 1, interviewDate: 1 });

module.exports = mongoose.model('Interview', interviewSchema);
