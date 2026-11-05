const express = require('express');
const router = express.Router();
const {
  getSavedInternships,
  saveInternship,
  removeSavedInternship,
  convertToApplication,
} = require('../controllers/savedController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getSavedInternships).post(saveInternship);
router.route('/:id').delete(removeSavedInternship);
router.route('/:id/convert').post(convertToApplication);

module.exports = router;

