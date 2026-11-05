const express = require('express');
const router = express.Router();
const {
  getInterviews,
  createInterview,
  updateInterview,
  deleteInterview,
} = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getInterviews).post(createInterview);
router.route('/:id').put(updateInterview).delete(deleteInterview);

module.exports = router;
