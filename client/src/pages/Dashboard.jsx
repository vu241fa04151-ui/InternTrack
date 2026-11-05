import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI } from '../services/api';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { CardSkeleton } from '../components/common/Skeleton';
import {
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Building2,
  Compass,
  UserCheck,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await analyticsAPI.getDashboard();
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('[Dashboard] Error fetching analytics:', err);
        setError('Could not load dashboard statistics. Please try refreshing.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-slate-200 animate-pulse rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalApplied: 0,
    inProgress: 0,
    shortlisted: 0,
    interviewsScheduled: 0,
    offersReceived: 0,
    rejected: 0,
    upcomingDeadlinesCount: 0,
  };

  const statCards = [
    {
      label: 'Total Applied',
      value: metrics.totalApplied,
      icon: Briefcase,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 border-indigo-100',
    },
    {
      label: 'In Progress',
      value: metrics.inProgress,
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-50 border-blue-100',
    },
    {
      label: 'Shortlisted',
      value: metrics.shortlisted,
      icon: Sparkles,
      color: 'text-pink-600',
      bg: 'bg-pink-50 border-pink-100',
    },
    {
      label: 'Interviews',
      value: metrics.interviewsScheduled,
      icon: Calendar,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-100',
    },
    {
      label: 'Offers',
      value: metrics.offersReceived,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-100',
    },
    {
      label: 'Rejected',
      value: metrics.rejected,
      icon: XCircle,
      color: 'text-rose-600',
      bg: 'bg-rose-50 border-rose-100',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Personalized Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold mb-3 border border-indigo-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Class of {user?.graduationYear || 2026} • {user?.degree} in {user?.branch}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Student'}! 👋
          </h1>
          <p className="mt-2 text-sm text-indigo-100/90 leading-relaxed">
            You currently have <span className="font-bold text-white">{metrics.inProgress} active application(s)</span> moving through the pipeline at {user?.college || 'your university'}.
          </p>

          {/* Quick Action Bar */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => navigate('/applications?action=new')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-900 text-xs font-bold hover:bg-indigo-50 transition-all shadow-md active:scale-95"
            >
              <span>+ Add Application</span>
            </button>
            <button
              onClick={() => navigate('/internships')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-700/60 hover:bg-indigo-700 text-white text-xs font-semibold border border-indigo-500/40 transition-all active:scale-95"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Internships</span>
            </button>
            <button
              onClick={() => navigate('/calendar')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-700/60 hover:bg-indigo-700 text-white text-xs font-semibold border border-indigo-500/40 transition-all active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              <span>View Calendar</span>
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-700/60 hover:bg-indigo-700 text-white text-xs font-semibold border border-indigo-500/40 transition-all active:scale-95"
            >
              <UserCheck className="w-4 h-4" />
              <span>Update Profile</span>
            </button>
          </div>
        </div>

        {/* Decorative backdrop shapes */}
        <div className="absolute -right-12 -bottom-12 w-72 h-72 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all duration-200 card-hover bg-white ${stat.bg}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{stat.label}</span>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Application Trends (Bar Chart) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Application Velocity</h3>
              <p className="text-xs text-slate-500">Monthly submissions and offer milestones</p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              Past 6 Months
            </span>
          </div>

          <div className="h-64 w-full">
            {data?.monthlyTrends && data.monthlyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <RechartsTooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  />
                  <Bar dataKey="applications" name="Applications" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="offers" name="Offers" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No monthly data available yet
              </div>
            )}
          </div>
        </div>

        {/* Application Status Distribution (Donut Chart) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Pipeline Status</h3>
            <p className="text-xs text-slate-500">Current status distribution across opportunities</p>
          </div>

          <div className="h-56 w-full relative my-2">
            {data?.statusDistribution && data.statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.statusDistribution}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {data.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No applications logged yet
              </div>
            )}
          </div>

          {/* Custom Status Legend */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-slate-100">
            {data?.statusDistribution?.slice(0, 5).map((item, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}: {item.value}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Row: Upcoming Deadlines & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upcoming Deadlines Widget */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-500" />
              <h3 className="text-base font-bold text-slate-900">Upcoming Deadlines</h3>
            </div>
            <button
              onClick={() => navigate('/calendar')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Full Calendar <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {data?.upcomingDeadlines && data.upcomingDeadlines.length > 0 ? (
              data.upcomingDeadlines.map((item) => {
                const deadlineDate = new Date(item.deadline);
                const daysLeft = Math.ceil((deadlineDate - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <div
                    key={item._id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-slate-500 font-medium">{item.company}</span>
                        <span className="text-[10px] text-slate-300">•</span>
                        <span className="text-[11px] text-slate-500">
                          Due {deadlineDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ml-3 ${
                        daysLeft <= 3
                          ? 'bg-rose-100 text-rose-700'
                          : daysLeft <= 7
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {daysLeft <= 0 ? 'Due Today' : `${daysLeft} days left`}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                No approaching deadlines within the next 14 days
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Timeline Feed */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
            </div>
            <button
              onClick={() => navigate('/applications')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              All Applications <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {data?.recentActivities && data.recentActivities.length > 0 ? (
              data.recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5 text-indigo-600 font-bold text-xs">
                    {act.company ? act.company.substring(0, 2).toUpperCase() : 'APP'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {act.company} – {act.title}
                      </p>
                      <span className="text-[10px] text-slate-400 ml-2 flex-shrink-0">
                        {new Date(act.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge status={act.status} size="xs" />
                      <p className="text-[11px] text-slate-500 truncate">{act.note}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                No recent activity recorded yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
