const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Internship title is required'],
      trim: true,
      index: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      index: true,
    },
    companyLogo: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    requiredSkills: {
      type: [String],
      default: [],
      index: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      index: true,
    },
    workMode: {
      type: String,
      enum: ['Remote', 'Hybrid', 'On-site'],
      default: 'Remote',
      required: true,
      index: true,
    },
    duration: {
      type: String,
      required: [true, 'Duration is required (e.g. 3 Months, 6 Months)'],
      trim: true,
    },
    stipend: {
      type: String,
      required: [true, 'Stipend information is required'],
      trim: true,
    },
    stipendAmount: {
      type: Number,
      default: 0,
      index: true,
    },
    eligibility: {
      type: String,
      required: [true, 'Eligibility criteria is required'],
    },
    deadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
      index: true,
    },
    applyUrl: {
      type: String,
      required: [true, 'Application URL is required'],
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    isSample: {
      type: Boolean,
      default: false,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

internshipSchema.index({
  title: 'text',
  company: 'text',
  description: 'text',
  location: 'text',
});

module.exports = mongoose.model('Internship', internshipSchema);
