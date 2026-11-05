import React, { useState, useEffect } from 'react';
import { interviewsAPI, applicationsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { CardSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import {
  Users,
  Calendar,
  Clock,
  Video,
  MapPin,
  ExternalLink,
  Plus,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  FileText,
  Building2,
} from 'lucide-react';

const INTERVIEW_MODES = ['Google Meet', 'Zoom', 'MS Teams', 'In-Person', 'Phone'];
const INTERVIEW_ROUNDS = [
  'Screening',
  'Technical Round 1',
  'Technical Round 2',
  'System Design',
  'Managerial',
  'HR / Final',
];

const Interviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    interviewDate: '',
    interviewTime: '14:00',
    interviewMode: 'Google Meet',
    interviewRound: 'Technical Round 1',
    meetingLink: '',
    location: '',
    preparationNotes: '',
    applicationId: '',
  });

  const toast = useToast();

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'All' ? { status: statusFilter } : {};
      const res = await interviewsAPI.getAll(params);
      if (res.data.success) {
        setInterviews(res.data.data);
      }
    } catch (err) {
      console.error('[Interviews] Error fetching:', err);
      toast.error('Failed to load interviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await applicationsAPI.getAll({});
      if (res.data.success) {
        setApplications(res.data.data);
      }
    } catch (err) {
      console.warn('Could not load applications for interview selector');
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [statusFilter]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      company: '',
      role: '',
      interviewDate: new Date().toISOString().split('T')[0],
      interviewTime: '14:00',
      interviewMode: 'Google Meet',
      interviewRound: 'Technical Round 1',
      meetingLink: '',
      location: '',
      preparationNotes: '',
      applicationId: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setIsEditing(true);
    setEditingId(item._id);
    setFormData({
      company: item.company,
      role: item.role,
      interviewDate: item.interviewDate ? item.interviewDate.split('T')[0] : '',
      interviewTime: item.interviewTime || '14:00',
      interviewMode: item.interviewMode || 'Google Meet',
      interviewRound: item.interviewRound || 'Technical Round 1',
      meetingLink: item.meetingLink || '',
      location: item.location || '',
      preparationNotes: item.preparationNotes || '',
      applicationId: item.application?._id || '',
    });
    setModalOpen(true);
  };

  const handleAppSelect = (e) => {
    const appId = e.target.value;
    const selected = applications.find((a) => a._id === appId);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        applicationId: appId,
        company: selected.company,
        role: selected.title,
      }));
    } else {
      setFormData((prev) => ({ ...prev, applicationId: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company || !formData.role || !formData.interviewDate || !formData.interviewTime) {
      toast.error('Please fill out all required interview fields');
      return;
    }

    try {
      setSubmitting(true);
      if (isEditing) {
        await interviewsAPI.update(editingId, formData);
        toast.success('Interview updated successfully');
      } else {
        await interviewsAPI.create(formData);
        toast.success('Interview scheduled and added to calendar');
      }
      setModalOpen(false);
      fetchInterviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save interview');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkCompleted = async (item) => {
    try {
      await interviewsAPI.update(item._id, { status: 'Completed' });
      setInterviews((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, status: 'Completed' } : i))
      );
      toast.success(`Marked interview with ${item.company} as Completed!`);
    } catch (err) {
      toast.error('Failed to update interview');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await interviewsAPI.delete(deleteTargetId);
      setInterviews((prev) => prev.filter((i) => i._id !== deleteTargetId));
      toast.success('Interview removed');
      setConfirmDeleteOpen(false);
    } catch (err) {
      toast.error('Failed to delete interview');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Interview Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize upcoming technical screens, behavioral rounds, preparation notes, and meeting links.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={handleOpenCreate}
        >
          Schedule Interview
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          {['All', 'Scheduled', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : interviews.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No interviews scheduled"
          description="Prepare for success by logging your upcoming interview rounds, links, and study notes."
          actionText="Schedule an Interview"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {interviews.map((item) => {
            const dateObj = new Date(item.interviewDate);
            const isPast = dateObj < new Date();

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between card-hover"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {item.company}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">
                        {item.role}
                      </h3>
                    </div>
                    <Badge status={item.status} size="xs" />
                  </div>

                  {/* Round & Mode Badges */}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100">
                      {item.interviewRound}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                      {item.interviewMode}
                    </span>
                  </div>

                  {/* Date & Time */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>
                        {dateObj.toLocaleDateString([], {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{item.interviewTime} (Local Time)</span>
                    </div>
                  </div>

                  {/* Notes */}
                  {item.preparationNotes && (
                    <div className="mt-3 text-xs text-slate-600 leading-relaxed bg-amber-50/50 p-3 rounded-xl border border-amber-100/70">
                      <span className="font-semibold text-amber-900 block mb-0.5">
                        Prep Notes:
                      </span>
                      {item.preparationNotes}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {item.meetingLink ? (
                      <a
                        href={item.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join</span>
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No link</span>
                    )}

                    {item.status === 'Scheduled' && (
                      <button
                        onClick={() => handleMarkCompleted(item)}
                        title="Mark Completed"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      title="Edit"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteTargetId(item._id);
                        setConfirmDeleteOpen(true);
                      }}
                      title="Delete"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Interview Schedule' : 'Schedule New Interview'}
        subtitle="Manage your upcoming interview rounds and preparation"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Optional Linked Application */}
          {!isEditing && applications.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Link to Tracked Application (Optional)
              </label>
              <select
                value={formData.applicationId}
                onChange={handleAppSelect}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Standalone Interview --</option>
                {applications.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.company} – {a.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g. Google"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Role / Position *
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. Software Engineering Intern"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Interview Round
              </label>
              <select
                value={formData.interviewRound}
                onChange={(e) => setFormData({ ...formData, interviewRound: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {INTERVIEW_ROUNDS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Interview Mode
              </label>
              <select
                value={formData.interviewMode}
                onChange={(e) => setFormData({ ...formData, interviewMode: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {INTERVIEW_MODES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={formData.interviewDate}
                onChange={(e) => setFormData({ ...formData, interviewDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Time *
              </label>
              <input
                type="time"
                value={formData.interviewTime}
                onChange={(e) => setFormData({ ...formData, interviewTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Meeting URL or Location
            </label>
            <input
              type="text"
              value={formData.meetingLink}
              onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
              placeholder="https://meet.google.com/... or Room 402"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Preparation Notes & Tips
            </label>
            <textarea
              rows="3"
              value={formData.preparationNotes}
              onChange={(e) => setFormData({ ...formData, preparationNotes: e.target.value })}
              placeholder="Review tree algorithms, prepare behavioral STAR stories..."
              className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {isEditing ? 'Save Changes' : 'Schedule Interview'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Cancel & Delete Interview"
        message="Are you sure you want to delete this scheduled interview record?"
        confirmText="Yes, Delete"
      />
    </div>
  );
};

export default Interviews;

