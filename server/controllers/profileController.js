const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// @desc    Get current user profile
// @route   GET /api/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const {
      name,
      college,
      degree,
      branch,
      graduationYear,
      skills,
      bio,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
    } = req.body;

    if (name) user.name = name.trim();
    if (college) user.college = college.trim();
    if (degree) user.degree = degree.trim();
    if (branch) user.branch = branch.trim();
    if (graduationYear) user.graduationYear = Number(graduationYear);
    if (bio !== undefined) user.bio = bio;
    if (githubUrl !== undefined) user.githubUrl = githubUrl.trim();
    if (linkedinUrl !== undefined) user.linkedinUrl = linkedinUrl.trim();
    if (portfolioUrl !== undefined) user.portfolioUrl = portfolioUrl.trim();

    if (skills !== undefined) {
      if (Array.isArray(skills)) {
        user.skills = skills.map((s) => s.trim()).filter(Boolean);
      } else if (typeof skills === 'string') {
        user.skills = skills.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload student resume
// @route   POST /api/profile/resume
// @access  Private
exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please choose a resume file to upload (PDF, DOC, DOCX)',
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Remove old resume if exists
    if (user.resume && user.resume.filename) {
      const oldFilePath = path.resolve(__dirname, '../uploads/resumes', user.resume.filename);
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
        } catch (e) {
          console.warn('[ResumeUpload] Could not remove old file:', e.message);
        }
      }
    }

    user.resume = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: `/uploads/resumes/${req.file.filename}`,
      size: req.file.size,
      uploadedAt: new Date(),
    };

    await user.save();

    res.status(200).json({
      success: true,
      data: user.resume,
      message: 'Resume uploaded successfully!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student resume
// @route   DELETE /api/profile/resume
// @access  Private
exports.deleteResume = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.resume && user.resume.filename) {
      const filePath = path.resolve(__dirname, '../uploads/resumes', user.resume.filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn('[ResumeDelete] Could not delete physical file:', e.message);
        }
      }
    }

    user.resume = {
      filename: '',
      originalName: '',
      path: '',
      size: 0,
      uploadedAt: null,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Resume removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/profile/password
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password',
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password provided is incorrect',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password successfully updated!',
    });
  } catch (error) {
    next(error);
  }
};

