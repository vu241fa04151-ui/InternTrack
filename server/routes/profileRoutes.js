const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadResume,
  deleteResume,
  updatePassword,
} = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.route('/').get(getProfile).put(updateProfile);
router.post('/resume', upload.single('resume'), uploadResume);
router.delete('/resume', deleteResume);
router.put('/password', updatePassword);

module.exports = router;

