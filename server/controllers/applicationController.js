const Application = require('../models/Application');
const Notification = require('../models/Notification');

// @desc    Get all applications for logged in student
// @route   GET /api/applications
// @access  Private
exports.getApplications = async (req, res, next) => {
  try {
    const { status, search, sort = 'dateDesc' } = req.query;

    const query = { user: req.user.id };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: regex }, { company: regex }, { location: regex }];
    }

    let sortOptions = { applicationDate: -1 };
    if (sort === 'dateAsc') {
      sortOptions = { applicationDate: 1 };
    } else if (sort === 'deadlineAsc') {
      sortOptions = { deadline: 1 };
    } else if (sort === 'deadlineDesc') {
      sortOptions = { deadline: -1 };
    } else if (sort === 'companyAsc') {
      sortOptions = { company: 1 };
    }

    const applications = await Application.find(query).sort(sortOptions);

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single application details
// @route   GET /api/applications/:id
// @access  Private
exports.getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate('internship');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application record not found or access denied',
      });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new application
// @route   POST /api/applications
// @access  Private
exports.createApplication = async (req, res, next) => {
  try {
    const {
      title,
      company,
      applicationDate,
      applicationLink,
      location,
      stipend,
      deadline,
      status = 'Applied',
      notes,
      nextFollowUpDate,
      internshipId,
    } = req.body;

    if (!title || !company) {
      return res.status(400).json({
        success: false,
        message: 'Please provide internship title and company name',
      });
    }

    const initialHistory = [
      {
        status: status || 'Applied',
        changedAt: new Date(),
        note: notes ? `Initial entry: ${notes}` : 'Application logged in tracker',
      },
    ];

    const application = await Application.create({
      user: req.user.id,
      internship: internshipId || null,
      title: title.trim(),
      company: company.trim(),
      applicationDate: applicationDate ? new Date(applicationDate) : new Date(),
      applicationLink: applicationLink || '',
      location: location || 'Remote',
      stipend: stipend || 'Not Disclosed',
      deadline: deadline ? new Date(deadline) : null,
      status: status || 'Applied',
      notes: notes || '',
      nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : null,
      statusHistory: initialHistory,
    });

    // Check if deadline is approaching (within 7 days) and schedule reminder
    if (deadline) {
      const deadlineDate = new Date(deadline);
      const diffDays = Math.ceil((deadlineDate - new Date()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 7) {
        await Notification.create({
          user: req.user.id,
          title: `Upcoming Deadline: ${company}`,
          message: `Application deadline for ${title} at ${company} is in ${diffDays} day(s).`,
          type: 'deadline',
          relatedId: application._id,
          relatedModel: 'Application',
        });
      }
    }

    res.status(201).json({
      success: true,
      data: application,
      message: 'Application added successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application
// @route   PUT /api/applications/:id
// @access  Private
exports.updateApplication = async (req, res, next) => {
  try {
    let application = await Application.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or unauthorized',
      });
    }

    const oldStatus = application.status;
    const newStatus = req.body.status;

    // Detect status update to append to history
    if (newStatus && newStatus !== oldStatus) {
      application.statusHistory.unshift({
        status: newStatus,
        changedAt: new Date(),
        note: req.body.statusNote || `Status changed from ${oldStatus} to ${newStatus}`,
      });

      // Send status change notification for milestones
      if (['Interview', 'Selected', 'Assessment', 'Shortlisted'].includes(newStatus)) {
        await Notification.create({
          user: req.user.id,
          title: `Application Update: ${application.company}`,
          message: `Your application for ${application.title} has moved to "${newStatus}"!`,
          type: 'status_update',
          relatedId: application._id,
          relatedModel: 'Application',
        });
      }
    }

    // Update fields
    const fieldsToUpdate = [
      'title',
      'company',
      'applicationDate',
      'applicationLink',
      'location',
      'stipend',
      'deadline',
      'status',
      'notes',
      'nextFollowUpDate',
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        application[field] = req.body[field];
      }
    });

    await application.save();

    res.status(200).json({
      success: true,
      data: application,
      message: 'Application updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Quick update status (useful for Kanban Drag and Drop)
// @route   PATCH /api/applications/:id/status
// @access  Private
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the new application status',
      });
    }

    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application record not found',
      });
    }

    const prevStatus = application.status;
    application.status = status;
    application.statusHistory.unshift({
      status,
      changedAt: new Date(),
      note: note || `Moved from ${prevStatus} to ${status} via Kanban board`,
    });

    if (['Interview', 'Selected'].includes(status)) {
      await Notification.create({
        user: req.user.id,
        title: `Stage Updated: ${application.company}`,
        message: `Your application for ${application.title} is now in stage "${status}".`,
        type: 'status_update',
        relatedId: application._id,
        relatedModel: 'Application',
      });
    }

    await application.save();

    res.status(200).json({
      success: true,
      data: application,
      message: `Status moved to ${status}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Private
exports.deleteApplication = async (req, res, next) => {
  try {
    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application record not found or unauthorized',
      });
    }

    // Clean up notifications linked to this application
    await Notification.deleteMany({
      user: req.user.id,
      relatedId: req.params.id,
    });

    res.status(200).json({
      success: true,
      message: 'Application record removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
