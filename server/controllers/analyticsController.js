const Application = require('../models/Application');
const Interview = require('../models/Interview');
const mongoose = require('mongoose');

// @desc    Get dashboard summary statistics & analytics
// @route   GET /api/analytics/dashboard
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const now = new Date();

    // Fetch all user applications
    const applications = await Application.find({ user: userId }).sort({ applicationDate: -1 });

    const totalApplied = applications.length;
    let inProgressCount = 0;
    let shortlistedCount = 0;
    let interviewStatusCount = 0;
    let selectedCount = 0;
    let rejectedCount = 0;
    let interestedCount = 0;
    let assessmentCount = 0;
    let withdrawnCount = 0;

    applications.forEach((app) => {
      switch (app.status) {
        case 'Interested':
          interestedCount++;
          break;
        case 'Applied':
          inProgressCount++;
          break;
        case 'Assessment':
          assessmentCount++;
          inProgressCount++;
          break;
        case 'Shortlisted':
          shortlistedCount++;
          inProgressCount++;
          break;
        case 'Interview':
          interviewStatusCount++;
          inProgressCount++;
          break;
        case 'Selected':
          selectedCount++;
          break;
        case 'Rejected':
          rejectedCount++;
          break;
        case 'Withdrawn':
          withdrawnCount++;
          break;
        default:
          break;
      }
    });

    // Count upcoming scheduled interviews
    const upcomingInterviewsCount = await Interview.countDocuments({
      user: userId,
      interviewDate: { $gte: now },
      status: 'Scheduled',
    });

    // Upcoming deadlines within next 14 days
    const upcomingDeadlines = await Application.find({
      user: userId,
      deadline: { $gte: now },
      status: { $nin: ['Selected', 'Rejected', 'Withdrawn'] },
    })
      .sort({ deadline: 1 })
      .limit(5)
      .select('title company deadline status');

    // Status distribution for pie/donut chart
    const statusCounts = [
      { name: 'Interested', value: interestedCount, color: '#94A3B8' },
      { name: 'Applied', value: applications.filter((a) => a.status === 'Applied').length, color: '#3B82F6' },
      { name: 'Assessment', value: assessmentCount, color: '#8B5CF6' },
      { name: 'Shortlisted', value: shortlistedCount, color: '#EC4899' },
      { name: 'Interview', value: interviewStatusCount, color: '#F59E0B' },
      { name: 'Selected (Offer)', value: selectedCount, color: '#10B981' },
      { name: 'Rejected', value: rejectedCount, color: '#EF4444' },
      { name: 'Withdrawn', value: withdrawnCount, color: '#64748B' },
    ].filter((item) => item.value > 0);

    // Monthly trends (last 6 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap = {};

    // Initialize past 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      monthlyMap[key] = { month: key, applications: 0, offers: 0 };
    }

    applications.forEach((app) => {
      const d = new Date(app.applicationDate);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      if (monthlyMap[key]) {
        monthlyMap[key].applications++;
        if (app.status === 'Selected') {
          monthlyMap[key].offers++;
        }
      }
    });

    const monthlyTrends = Object.values(monthlyMap);

    // Recent activities (extracted from statusHistory of applications)
    let recentActivities = [];
    applications.forEach((app) => {
      if (app.statusHistory && app.statusHistory.length > 0) {
        app.statusHistory.forEach((h) => {
          recentActivities.push({
            id: `${app._id}-${h.changedAt.getTime()}`,
            applicationId: app._id,
            company: app.company,
            title: app.title,
            status: h.status,
            date: h.changedAt,
            note: h.note || `Status changed to ${h.status}`,
          });
        });
      }
    });

    recentActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
    recentActivities = recentActivities.slice(0, 6);

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalApplied,
          inProgress: inProgressCount,
          shortlisted: shortlistedCount,
          interviewsScheduled: upcomingInterviewsCount || interviewStatusCount,
          offersReceived: selectedCount,
          rejected: rejectedCount,
          upcomingDeadlinesCount: upcomingDeadlines.length,
        },
        upcomingDeadlines,
        statusDistribution: statusCounts,
        monthlyTrends,
        recentActivities,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed analytics and reports
// @route   GET /api/analytics/reports
// @access  Private
exports.getDetailedReports = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { timeRange = 'all' } = req.query;

    const query = { user: userId };

    if (timeRange === '30days') {
      const past30 = new Date();
      past30.setDate(past30.getDate() - 30);
      query.applicationDate = { $gte: past30 };
    } else if (timeRange === '90days') {
      const past90 = new Date();
      past90.setDate(past90.getDate() - 90);
      query.applicationDate = { $gte: past90 };
    } else if (timeRange === 'year') {
      const startOfYear = new Date(new Date().getFullYear(), 0, 1);
      query.applicationDate = { $gte: startOfYear };
    }

    const applications = await Application.find(query);
    const total = applications.length;

    const selected = applications.filter((a) => a.status === 'Selected').length;
    const rejected = applications.filter((a) => a.status === 'Rejected').length;
    const interviewCount = applications.filter(
      (a) => a.status === 'Interview' || a.status === 'Selected'
    ).length;
    const pending = total - (selected + rejected);

    const selectionRate = total > 0 ? Number(((selected / total) * 100).toFixed(1)) : 0;
    const interviewRate = total > 0 ? Number(((interviewCount / total) * 100).toFixed(1)) : 0;
    const rejectionRate = total > 0 ? Number(((rejected / total) * 100).toFixed(1)) : 0;

    // Company-wise distribution (Top 6)
    const companyMap = {};
    applications.forEach((a) => {
      companyMap[a.company] = (companyMap[a.company] || 0) + 1;
    });

    const companyDistribution = Object.entries(companyMap)
      .map(([company, count]) => ({ company, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);

    // Location/Mode distribution
    const modeMap = { Remote: 0, Hybrid: 0, 'On-site': 0, Other: 0 };
    applications.forEach((a) => {
      const loc = (a.location || '').toLowerCase();
      if (loc.includes('remote')) modeMap['Remote']++;
      else if (loc.includes('hybrid')) modeMap['Hybrid']++;
      else if (loc.trim() !== '') modeMap['On-site']++;
      else modeMap['Other']++;
    });

    const workModeDistribution = Object.entries(modeMap)
      .map(([mode, count]) => ({ mode, count }))
      .filter((m) => m.count > 0);

    // Status breakdown
    const statusMap = {};
    applications.forEach((a) => {
      statusMap[a.status] = (statusMap[a.status] || 0) + 1;
    });

    const statusDistribution = Object.entries(statusMap).map(([status, count]) => ({
      status,
      count,
    }));

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalApplications: total,
          selectedApplications: selected,
          rejectedApplications: rejected,
          pendingApplications: pending,
          interviewConversionRate: interviewRate,
          selectionRate: selectionRate,
          rejectionRate: rejectionRate,
        },
        statusDistribution,
        companyDistribution,
        workModeDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
};
