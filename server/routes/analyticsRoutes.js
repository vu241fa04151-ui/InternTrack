const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getDetailedReports,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/reports', getDetailedReports);

module.exports = router;
