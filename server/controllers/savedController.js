const SavedInternship = require('../models/SavedInternship');
const Internship = require('../models/Internship');
const Application = require('../models/Application');

// @desc    Get all saved internships for student
// @route   GET /api/saved
// @access  Private
exports.getSavedInternships = async (req, res, next) => {
  try {
    const saved = await SavedInternship.find({ user: req.user.id })
      .populate('internship')
      .sort({ createdAt: -1 });

    // Filter out any where internship might have been deleted
    const validSaved = saved.filter((item) => item.internship !== null);

    res.status(200).json({
      success: true,
      count: validSaved.length,
      data: validSaved,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bookmark an internship
// @route   POST /api/saved
// @access  Private
exports.saveInternship = async (req, res, next) => {
  try {
    const { internshipId, notes } = req.body;

    if (!internshipId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide internshipId to bookmark',
      });
    }

    const internship = await Internship.findById(internshipId);
    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Internship opportunity not found',
      });
    }

    // Check duplicate
    const existing = await SavedInternship.findOne({
      user: req.user.id,
      internship: internshipId,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This internship is already in your saved list',
      });
    }

    const savedRecord = await SavedInternship.create({
      user: req.user.id,
      internship: internshipId,
      notes: notes || '',
    });

    const populated = await SavedInternship.findById(savedRecord._id).populate('internship');

    res.status(201).json({
      success: true,
      data: populated,
      message: 'Internship bookmarked successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove saved internship
// @route   DELETE /api/saved/:id
// @access  Private
exports.removeSavedInternship = async (req, res, next) => {
  try {
    // Allows removing by SavedInternship ID or by underlying internshipId
    const record = await SavedInternship.findOne({
      $or: [
        { _id: req.params.id, user: req.user.id },
        { internship: req.params.id, user: req.user.id },
      ],
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Saved record not found',
      });
    }

    await record.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Internship removed from saved list',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Convert saved internship to active application
// @route   POST /api/saved/:id/convert
// @access  Private
exports.convertToApplication = async (req, res, next) => {
  try {
    const saved = await SavedInternship.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate('internship');

    if (!saved || !saved.internship) {
      return res.status(404).json({
        success: false,
        message: 'Saved internship record not found',
      });
    }

    const opp = saved.internship;

    // Check if application already logged for this internship
    const existingApp = await Application.findOne({
      user: req.user.id,
      internship: opp._id,
    });

    if (existingApp) {
      return res.status(400).json({
        success: false,
        message: 'You have already added this opportunity to your Application Tracker',
      });
    }

    const newApp = await Application.create({
      user: req.user.id,
      internship: opp._id,
      title: opp.title,
      company: opp.company,
      applicationDate: new Date(),
      applicationLink: opp.applyUrl,
      location: opp.location,
      stipend: opp.stipend,
      deadline: opp.deadline,
      status: req.body.status || 'Applied',
      notes: saved.notes || `Converted from saved bookmark on ${new Date().toLocaleDateString()}`,
      statusHistory: [
        {
          status: req.body.status || 'Applied',
          changedAt: new Date(),
          note: 'Created from bookmarked opportunity',
        },
      ],
    });

    // Optionally remove from saved list if requested
    if (req.body.removeFromSaved) {
      await saved.deleteOne();
    }

    res.status(201).json({
      success: true,
      data: newApp,
      message: 'Opportunity successfully converted to an active Application!',
    });
  } catch (error) {
    next(error);
  }
};

