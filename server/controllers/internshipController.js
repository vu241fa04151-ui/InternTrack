const Internship = require('../models/Internship');
const SavedInternship = require('../models/SavedInternship');
const jwt = require('jsonwebtoken');

// Helper to check user id from optional token
const getUserIdFromHeader = (req) => {
  try {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'interntrack_super_secret_jwt_key_2026_xyz_!@#'
      );
      return decoded.id;
    }
  } catch (err) {
    return null;
  }
  return null;
};

// @desc    Get all internships with search, filters & pagination
// @route   GET /api/internships
// @access  Public
exports.getInternships = async (req, res, next) => {
  try {
    const {
      search,
      workMode,
      location,
      minStipend,
      duration,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    // Search query across title, company, skills, description
    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: regex },
        { company: regex },
        { requiredSkills: { $in: [regex] } },
        { location: regex },
        { description: regex },
      ];
    }

    // Filter by work mode
    if (workMode && workMode !== 'All') {
      query.workMode = workMode;
    }

    // Filter by location
    if (location && location.trim() !== '') {
      query.location = new RegExp(location.trim(), 'i');
    }

    // Filter by min stipend
    if (minStipend && !isNaN(Number(minStipend))) {
      query.stipendAmount = { $gte: Number(minStipend) };
    }

    // Filter by duration
    if (duration && duration !== 'All') {
      query.duration = new RegExp(duration, 'i');
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sort === 'deadline') {
      sortOptions = { deadline: 1 };
    } else if (sort === 'stipendHigh') {
      sortOptions = { stipendAmount: -1 };
    } else if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    }

    const currentPage = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 12;
    const skip = (currentPage - 1) * pageSize;

    const total = await Internship.countDocuments(query);
    const internships = await Internship.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);

    // If student is logged in, attach isSaved flag
    const userId = getUserIdFromHeader(req);
    let savedIds = new Set();
    if (userId) {
      const savedDocs = await SavedInternship.find({ user: userId }).select('internship');
      savedDocs.forEach((d) => savedIds.add(d.internship.toString()));
    }

    const enhancedInternships = internships.map((item) => {
      const obj = item.toObject();
      obj.isSaved = savedIds.has(item._id.toString());
      return obj;
    });

    res.status(200).json({
      success: true,
      count: enhancedInternships.length,
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage,
      data: enhancedInternships,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single internship details
// @route   GET /api/internships/:id
// @access  Public
exports.getInternshipById = async (req, res, next) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Internship opportunity not found',
      });
    }

    const userId = getUserIdFromHeader(req);
    let isSaved = false;
    if (userId) {
      const saved = await SavedInternship.findOne({
        user: userId,
        internship: internship._id,
      });
      isSaved = !!saved;
    }

    const result = internship.toObject();
    result.isSaved = isSaved;

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new internship (Admin or Authenticated Student/Poster)
// @route   POST /api/internships
// @access  Private
exports.createInternship = async (req, res, next) => {
  try {
    const {
      title,
      company,
      companyLogo,
      description,
      requiredSkills,
      location,
      workMode,
      duration,
      stipend,
      stipendAmount,
      eligibility,
      deadline,
      applyUrl,
      isVerified,
      isSample,
    } = req.body;

    const skillsArray = Array.isArray(requiredSkills)
      ? requiredSkills
      : typeof requiredSkills === 'string'
      ? requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const internship = await Internship.create({
      title,
      company,
      companyLogo: companyLogo || '',
      description,
      requiredSkills: skillsArray,
      location: location || 'Remote',
      workMode: workMode || 'Remote',
      duration: duration || '3 Months',
      stipend: stipend || 'Competitive',
      stipendAmount: Number(stipendAmount) || 0,
      eligibility: eligibility || 'Open to all enrolled college students',
      deadline,
      applyUrl,
      isVerified: isVerified !== undefined ? isVerified : true,
      isSample: isSample !== undefined ? isSample : false,
      postedBy: req.user ? req.user.id : null,
    });

    res.status(201).json({
      success: true,
      data: internship,
      message: 'Internship created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update internship
// @route   PUT /api/internships/:id
// @access  Private (Admin or Poster)
exports.updateInternship = async (req, res, next) => {
  try {
    let internship = await Internship.findById(req.params.id);
    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Internship opportunity not found',
      });
    }

    // Parse skills if string
    if (req.body.requiredSkills && typeof req.body.requiredSkills === 'string') {
      req.body.requiredSkills = req.body.requiredSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    internship = await Internship.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: internship,
      message: 'Internship updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete internship
// @route   DELETE /api/internships/:id
// @access  Private (Admin or Poster)
exports.deleteInternship = async (req, res, next) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Internship opportunity not found',
      });
    }

    await internship.deleteOne();
    // Also remove any saved entries for this internship
    await SavedInternship.deleteMany({ internship: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Internship removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

