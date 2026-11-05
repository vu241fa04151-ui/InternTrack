import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { applicationsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { TableSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import {
  Briefcase,
  Search,
  Filter,
  Plus,
  LayoutGrid,
  List,
  Edit2,
  Trash2,
  History,
  ExternalLink,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  Building2,
  MapPin,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

const KANBAN_STAGES = [
  'Interested',
  'Applied',
  'Assessment',
  'Shortlisted',
  'Interview',
  'Selected',
  'Rejected',
  'Withdrawn',
];

const Applications = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'table'
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sort, setSort] = useState('dateDesc');

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    applicationDate: new Date().toISOString().split('T')[0],
    applicationLink: '',
    location: 'Remote',
    stipend: 'Not Disclosed',
    deadline: '',
    status: 'Applied',
    notes: '',
    nextFollowUpDate: '',
  });

  const toast = useToast();

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = {
        search,
        status: statusFilter,
        sort,
      };
      const res = await applicationsAPI.getAll(params);
      if (res.data.success) {
        setApplications(res.data.data);
      }
    } catch (err) {
      console.error('[Applications] Error:', err);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [search, statusFilter, sort]);

  // Handle URL action trigger (e.g. ?action=new)
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      handleOpenCreate();
      setSearchParams({});
    }
  }, [searchParams]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      title: '',
      company: '',
      applicationDate: new Date().toISOString().split('T')[0],
      applicationLink: '',
      location: 'Remote',
      stipend: 'Not Disclosed',
      deadline: '',
      status: 'Applied',
      notes: '',
      nextFollowUpDate: '',
    });
    setFormModalOpen(true);
  };

  const handleOpenEdit = (app) => {
    setIsEditing(true);
    setEditingId(app._id);
    setFormData({
      title: app.title,
      company: app.company,
      applicationDate: app.applicationDate ? app.applicationDate.split('T')[0] : '',
      applicationLink: app.applicationLink || '',
      location: app.location || 'Remote',
      stipend: app.stipend || 'Not Disclosed',
      deadline: app.deadline ? app.deadline.split('T')[0] : '',
      status: app.status || 'Applied',
      notes: app.notes || '',
      nextFollowUpDate: app.nextFollowUpDate ? app.nextFollowUpDate.split('T')[0] : '',
    });
    setFormModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.company) {
      toast.error('Title and company name are required');
      return;
    }

    try {
      setFormSubmitting(true);
      if (isEditing) {
        await applicationsAPI.update(editingId, formData);
        toast.success('Application updated successfully');
      } else {
        await applicationsAPI.create(formData);
        toast.success('Application added to tracker');
      }
      setFormModalOpen(false);
      fetchApplications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save application');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Quick move status via Kanban or Dropdown
  const handleMoveStatus = async (appId, newStatus) => {
    try {
      // Optimistic update
      setApplications((prev) =>
        prev.map((app) => (app._id === appId ? { ...app, status: newStatus } : app))
      );
      await applicationsAPI.updateStatus(appId, { status: newStatus });
      toast.success(`Application stage changed to ${newStatus}`);
      fetchApplications();
    } catch (err) {
      toast.error('Failed to change status');
      fetchApplications();
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await applicationsAPI.delete(deleteTargetId);
      setApplications((prev) => prev.filter((a) => a._id !== deleteTargetId));
      toast.success('Application record removed');
      setConfirmDeleteOpen(false);
    } catch (err) {
      toast.error('Failed to delete application');
    }
  };

  const handleOpenHistory = (app) => {
    setSelectedApp(app);
    setHistoryModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Application Tracker
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your opportunities with Kanban and Table views, timeline history, and stage progression.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={handleOpenCreate}
          >
            Add Application
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by role, company, or city..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {viewMode === 'table' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Stages</option>
              {KANBAN_STAGES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="dateDesc">Newest Applied</option>
            <option value="dateAsc">Oldest Applied</option>
            <option value="deadlineAsc">Approaching Deadline</option>
            <option value="companyAsc">Company (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Main Content: Kanban or Table */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No applications found"
          description="You haven't logged any applications yet. Add one manually or explore verified internships to apply."
          actionText="+ Add Your First Application"
          onAction={handleOpenCreate}
        />
      ) : viewMode === 'kanban' ? (
        /* ================= KANBAN BOARD VIEW ================= */
        <div className="flex gap-4 overflow-x-auto pb-6 pt-1">
          {KANBAN_STAGES.map((stage) => {
            const stageApps = applications.filter((app) => app.status === stage);

            return (
              <div
                key={stage}
                className="w-80 flex-shrink-0 bg-slate-100/70 rounded-2xl p-3 border border-slate-200/70 flex flex-col max-h-[calc(100vh-16rem)]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 px-1 border-b border-slate-200/60 mb-3">
                  <div className="flex items-center gap-2">
                    <Badge status={stage} size="xs" />
                    <span className="text-xs font-bold text-slate-500">
                      {stageApps.length}
                    </span>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                  {stageApps.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                      Drop or move here
                    </div>
                  ) : (
                    stageApps.map((app) => {
                      const deadlineDate = app.deadline ? new Date(app.deadline) : null;
                      const daysLeft = deadlineDate
                        ? Math.ceil((deadlineDate - new Date()) / (1000 * 60 * 60 * 24))
                        : null;

                      return (
                        <div
                          key={app._id}
                          className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 hover:shadow-md transition-all group relative"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                {app.company}
                              </h4>
                              <h3 className="text-sm font-bold text-slate-900 mt-0.5 line-clamp-1">
                                {app.title}
                              </h3>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleOpenEdit(app)}
                                className="p-1 rounded text-slate-400 hover:text-slate-700"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteTargetId(app._id);
                                  setConfirmDeleteOpen(true);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-rose-600"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Details Row */}
                          <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1 text-[11px]">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {app.location || 'Remote'}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[11px] font-medium text-slate-600">
                              {app.stipend || 'Competitive'}
                            </span>
                          </div>

                          {/* Deadline countdown if available */}
                          {deadlineDate && (
                            <div className="mt-2.5 flex items-center justify-between text-[11px]">
                              <span className="text-slate-400">Deadline:</span>
                              <span
                                className={`font-semibold ${
                                  daysLeft <= 3
                                    ? 'text-rose-600 font-bold'
                                    : daysLeft <= 7
                                    ? 'text-amber-600'
                                    : 'text-slate-600'
                                }`}
                              >
                                {deadlineDate.toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                          )}

                          {/* Action Footer: Stage Mover & History */}
                          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <button
                              onClick={() => handleOpenHistory(app)}
                              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                            >
                              <History className="w-3 h-3" />
                              <span>Timeline</span>
                            </button>

                            {/* Stage Selector Dropdown */}
                            <select
                              value={app.status}
                              onChange={(e) => handleMoveStatus(app._id, e.target.value)}
                              className="text-[11px] font-semibold bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2 py-1 focus:outline-none"
                            >
                              {KANBAN_STAGES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= TABLE VIEW ================= */
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs font-bold text-slate-700 uppercase border-b border-slate-200/80">
                <tr>
                  <th className="px-6 py-4">Company & Role</th>
                  <th className="px-6 py-4">Stage</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Stipend</th>
                  <th className="px-6 py-4">Applied Date</th>
                  <th className="px-6 py-4">Deadline</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-900">{app.title}</p>
                        <p className="text-xs text-slate-500 font-medium">{app.company}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={app.status}
                        onChange={(e) => handleMoveStatus(app._id, e.target.value)}
                        className="text-xs font-semibold bg-transparent border-none cursor-pointer focus:outline-none"
                      >
                        {KANBAN_STAGES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600">
                      {app.location || 'Remote'}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-700">
                      {app.stipend || 'Competitive'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(app.applicationDate).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {app.deadline ? (
                        <span className="font-semibold text-slate-700">
                          {new Date(app.deadline).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenHistory(app)}
                          title="View Timeline"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(app)}
                          title="Edit"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteTargetId(app._id);
                            setConfirmDeleteOpen(true);
                          }}
                          title="Delete"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Application Modal */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={isEditing ? 'Edit Application Details' : 'Add New Application'}
        subtitle="Keep track of your internship applications and interview stages"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Internship Role / Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Frontend Engineer Intern"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g. Stripe, Google, Spotify"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Stage
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {KANBAN_STAGES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Applied Date
              </label>
              <input
                type="date"
                value={formData.applicationDate}
                onChange={(e) => setFormData({ ...formData, applicationDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Deadline (Optional)
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Location / Work Mode
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Remote or San Francisco, CA"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Stipend / Compensation
              </label>
              <input
                type="text"
                value={formData.stipend}
                onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                placeholder="e.g. $8,000/mo or ₹40,000/mo"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Application URL / Portal Link
              </label>
              <input
                type="url"
                value={formData.applicationLink}
                onChange={(e) => setFormData({ ...formData, applicationLink: e.target.value })}
                placeholder="https://company.com/jobs/..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Next Follow-Up Date
              </label>
              <input
                type="date"
                value={formData.nextFollowUpDate}
                onChange={(e) => setFormData({ ...formData, nextFollowUpDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notes & Preparation Details
            </label>
            <textarea
              rows="3"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Recruiter email contact, submitted portfolio, referral source"
              className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setFormModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={formSubmitting}>
              {isEditing ? 'Save Changes' : 'Add Application'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Timeline History Modal */}
      {selectedApp && (
        <Modal
          isOpen={historyModalOpen}
          onClose={() => setHistoryModalOpen(false)}
          title={`Application Timeline: ${selectedApp.company}`}
          subtitle={`${selectedApp.title}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4">
            <div className="relative pl-6 border-l-2 border-indigo-200 space-y-6 my-2">
              {selectedApp.statusHistory && selectedApp.statusHistory.length > 0 ? (
                selectedApp.statusHistory.map((hist, idx) => (
                  <div key={idx} className="relative">
                    {/* Circle marker */}
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center" />
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge status={hist.status} size="xs" />
                        <span className="text-[11px] text-slate-400">
                          {new Date(hist.changedAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 font-medium">
                        {hist.note || `Stage updated to ${hist.status}`}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No status transitions recorded yet</p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button variant="secondary" onClick={() => setHistoryModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Dialog for Delete */}
      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Application"
        message="Are you sure you want to remove this application record from your tracker? All history and linked reminders will also be deleted."
        confirmText="Yes, Delete"
      />
    </div>
  );
};

export default Applications;

