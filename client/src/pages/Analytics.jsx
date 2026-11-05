import React, { useState, useEffect } from 'react';
import { analyticsAPI, applicationsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import { CardSkeleton } from '../components/common/Skeleton';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  Award,
  Building2,
  PieChart as PieIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#3B82F6', '#EF4444', '#64748B'];

const Analytics = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all'); // 'all', '30days', '90days', 'year'
  const [exporting, setExporting] = useState(false);

  const toast = useToast();

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await analyticsAPI.getReports({ timeRange });
      if (res.data.success) {
        setReportData(res.data.data);
      }
    } catch (err) {
      console.error('[Analytics] Error fetching reports:', err);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [timeRange]);

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const res = await applicationsAPI.getAll({});
      if (!res.data.success || !res.data.data.length) {
        toast.info('No application records to export');
        return;
      }

      const apps = res.data.data;
      const headers = [
        'Internship Title',
        'Company',
        'Status',
        'Application Date',
        'Deadline',
        'Location',
        'Stipend',
        'Application Link',
        'Notes',
      ];

      const rows = apps.map((a) => [
        `"${(a.title || '').replace(/"/g, '""')}"`,
        `"${(a.company || '').replace(/"/g, '""')}"`,
        `"${a.status || ''}"`,
        `"${a.applicationDate ? a.applicationDate.split('T')[0] : ''}"`,
        `"${a.deadline ? a.deadline.split('T')[0] : ''}"`,
        `"${(a.location || '').replace(/"/g, '""')}"`,
        `"${(a.stipend || '').replace(/"/g, '""')}"`,
        `"${(a.applicationLink || '').replace(/"/g, '""')}"`,
        `"${(a.notes || '').replace(/"/g, '""')}"`,
      ]);

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute(
        'download',
        `InternTrack_Applications_${new Date().toISOString().split('T')[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Application records exported to CSV successfully!');
    } catch (err) {
      toast.error('Failed to generate CSV export');
    } finally {
      setExporting(false);
    }
  };

  const summary = reportData?.summary || {
    totalApplications: 0,
    selectedApplications: 0,
    rejectedApplications: 0,
    pendingApplications: 0,
    interviewConversionRate: 0,
    selectionRate: 0,
    rejectionRate: 0,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Career Analytics & Reports
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Data-driven insights into your job hunt velocity, interview conversions, and application outcomes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time range selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
          >
            <option value="all">All Time</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="year">This Year</option>
          </select>

          {/* CSV Export Button */}
          <Button
            variant="outline"
            size="md"
            icon={Download}
            onClick={handleExportCSV}
            loading={exporting}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Performance Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Total Tracked</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{summary.totalApplications}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Pending Review</span>
          <p className="text-2xl font-black text-blue-600 mt-1">{summary.pendingApplications}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Offers Extended</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{summary.selectedApplications}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Interview Rate</span>
          <p className="text-2xl font-black text-purple-600 mt-1">{summary.interviewConversionRate}%</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Offer Rate</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{summary.selectionRate}%</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Rejection Rate</span>
          <p className="text-2xl font-black text-rose-600 mt-1">{summary.rejectionRate}%</p>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Companies Chart (Horizontal Bar) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Applications by Company</h3>
              <p className="text-xs text-slate-500">Target organizations with highest submission volume</p>
            </div>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-64 w-full">
            {reportData?.companyDistribution && reportData.companyDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={reportData.companyDistribution}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="company" tick={{ fontSize: 11, fill: '#334155' }} axisLine={false} tickLine={false} width={80} />
                  <RechartsTooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  />
                  <Bar dataKey="count" name="Applications" fill="#6366f1" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No company data available
              </div>
            )}
          </div>
        </div>

        {/* Work Mode Breakdown (Donut Chart) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Work Mode Distribution</h3>
            <p className="text-xs text-slate-500">Remote vs Hybrid vs On-site breakdown</p>
          </div>

          <div className="h-56 w-full relative my-2">
            {reportData?.workModeDistribution && reportData.workModeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportData.workModeDistribution}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="mode"
                  >
                    {reportData.workModeDistribution.map((entry, index) => (
                      <Cell key={`mode-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No work mode data available
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-slate-100">
            {reportData?.workModeDistribution?.map((item, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                {item.mode}: {item.count}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
