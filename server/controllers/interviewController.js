const Interview = require('../models/Interview');
const Application = require('../models/Application');
const Notification = require('../models/Notification');

// @desc    Get all interviews for student
// @route   GET /api/interviews
// @access  Private
exports.getInterviews = async (req, res, next) => {
  try {
    const { status, sort = 'upcoming' } = req.query;

    const query = { user: req.user.id };
    if (status && status !== 'All') {
      query.status = status;
    }

    let sortOptions = { interviewDate: 1 };
    if (sort === 'past') {
      query.interviewDate = { $lt: new Date() };
      sortOptions = { interviewDate: -1 };
    } else if (sort === 'upcoming') {
      // Show all or upcoming
      sortOptions = { interviewDate: 1 };
    }

    const interviews = await Interview.find(query)
      .populate('application', 'title company status')
      .sort(sortOptions);

    res.status(200).json({
      success: true,
      count: interviews.length,
      data: interviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Schedule interview
// @route   POST /api/interviews
// @access  Private
exports.createInterview = async (req, res, next) => {
  try {
    const {
      company,
      role,
      interviewDate,
      interviewTime,
      interviewMode,
      interviewRound,
      meetingLink,
      location,
      preparationNotes,
      applicationId,
    } = req.body;

    if (!company || !role || !interviewDate || !interviewTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide company, role, interview date, and time',
      });
    }

    const interview = await Interview.create({
      user: req.user.id,
      application: applicationId || null,
      company: company.trim(),
      role: role.trim(),
      interviewDate: new Date(interviewDate),
      interviewTime: interviewTime.trim(),
      interviewMode: interviewMode || 'Google Meet',
      interviewRound: interviewRound || 'Technical Round 1',
      meetingLink: meetingLink || '',
      location: location || '',
      preparationNotes: preparationNotes || '',
      status: 'Scheduled',
    });

    // If linked to an application, automatically update application status to 'Interview' if appropriate
    if (applicationId) {
      const app = await Application.findOne({
        _id: applicationId,
        user: req.user.id,
      });
      if (app && app.status !== 'Interview' && app.status !== 'Selected') {
        app.status = 'Interview';
        app.statusHistory.unshift({
          status: 'Interview',
          changedAt: new Date(),
          note: `Interview scheduled for ${new Date(interviewDate).toLocaleDateString()} at ${interviewTime}`,
        });
        await app.save();
      }
    }

    // Create Notification
    await Notification.create({
      user: req.user.id,
      title: `Interview Scheduled: ${company}`,
      message: `${interviewRound} scheduled on ${new Date(interviewDate).toLocaleDateString()} at ${interviewTime} via ${interviewMode}.`,
      type: 'interview',
      relatedId: interview._id,
      relatedModel: 'Interview',
    });

    res.status(201).json({
      success: true,
      data: interview,
      message: 'Interview scheduled successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update interview details or status
// @route   PUT /api/interviews/:id
// @access  Private
exports.updateInterview = async (req, res, next) => {
  try {
    let interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview record not found or access denied',
      });
    }

    const fields = [
      'company',
      'role',
      'interviewDate',
      'interviewTime',
      'interviewMode',
      'interviewRound',
      'meetingLink',
      'location',
      'preparationNotes',
      'status',
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        interview[field] = req.body[field];
      }
    });

    await interview.save();

    res.status(200).json({
      success: true,
      data: interview,
      message: 'Interview updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete/Cancel interview
// @route   DELETE /api/interviews/:id
// @access  Private
exports.deleteInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview record not found',
      });
    }

    // Delete linked notifications
    await Notification.deleteMany({
      user: req.user.id,
      relatedId: req.params.id,
    });

    res.status(200).json({
      success: true,
      message: 'Interview deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
