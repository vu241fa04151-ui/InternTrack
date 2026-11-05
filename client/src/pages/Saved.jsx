import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { savedAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { CardSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import {
  Bookmark,
  Trash2,
  ExternalLink,
  MapPin,
  Clock,
  ArrowRight,
  Compass,
  Building2,
  Calendar,
  Sparkles,
} from 'lucide-react';

const Saved = () => {
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [selectedSaved, setSelectedSaved] = useState(null);
  const [initialStatus, setInitialStatus] = useState('Applied');
  const [removeFromSaved, setRemoveFromSaved] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const res = await savedAPI.getAll();
      if (res.data.success) {
        setSavedItems(res.data.data);
      }
    } catch (err) {
      console.error('[Saved] Error fetching:', err);
      toast.error('Failed to load bookmarked opportunities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemove = async (savedId, company) => {
    try {
      await savedAPI.remove(savedId);
      setSavedItems((prev) => prev.filter((item) => item._id !== savedId));
      toast.info(`Removed ${company} from your bookmarks`);
    } catch (err) {
      toast.error('Failed to remove bookmark');
    }
  };

  const handleOpenConvert = (item) => {
    setSelectedSaved(item);
    setInitialStatus('Applied');
    setRemoveFromSaved(true);
    setConvertModalOpen(true);
  };

  const handleConfirmConvert = async () => {
    if (!selectedSaved) return;
    try {
      setActionLoading(true);
      await savedAPI.convert(selectedSaved._id, {
        status: initialStatus,
        removeFromSaved,
      });
      toast.success(
        `Converted ${selectedSaved.internship?.company} into an active Application!`
      );
      setConvertModalOpen(false);
      if (removeFromSaved) {
        setSavedItems((prev) => prev.filter((i) => i._id !== selectedSaved._id));
      }
      navigate('/applications');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to convert opportunity');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Saved Opportunities
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Bookmarked internships waiting for your application. Convert them directly into tracked applications when ready.
          </p>
        </div>

        <Button
          variant="secondary"
          size="md"
          icon={Compass}
          onClick={() => navigate('/internships')}
        >
          Explore More Roles
        </Button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : savedItems.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No bookmarked internships"
          description="Browse open opportunities and click the bookmark icon to save roles you want to apply to later."
          actionText="Discover Internships"
          onAction={() => navigate('/internships')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedItems.map((item) => {
            const opp = item.internship;
            if (!opp) return null;

            const deadlineDate = new Date(opp.deadline);
            const daysLeft = Math.ceil((deadlineDate - new Date()) / (1000 * 60 * 60 * 24));

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between card-hover"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden p-2 flex-shrink-0">
                        {opp.companyLogo ? (
                          <img
                            src={opp.companyLogo}
                            alt={opp.company}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '';
                            }}
                          />
                        ) : (
                          <Building2 className="w-6 h-6 text-indigo-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase">
                          {opp.company}
                        </h4>
                        <h3 className="text-sm font-bold text-slate-900 line-clamp-1 mt-0.5">
                          {opp.title}
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemove(item._id, opp.company)}
                      title="Remove Bookmark"
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-4 text-xs text-slate-600">
                    <Badge status={opp.workMode} size="xs" />
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {opp.location}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {opp.duration}
                    </span>
                  </div>

                  {item.notes && (
                    <div className="mt-3 p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100/60 text-xs text-indigo-900 font-medium">
                      💡 {item.notes}
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>Stipend: <strong className="text-slate-800">{opp.stipend}</strong></span>
                    <span className={daysLeft <= 7 ? 'text-rose-600 font-bold' : ''}>
                      {daysLeft <= 0 ? 'Closed' : `${daysLeft} days left`}
                    </span>
                  </div>
                </div>

                {/* Convert to Application Action */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href={opp.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-indigo-600"
                  >
                    <span>External Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <Button
                    variant="primary"
                    size="sm"
                    icon={Sparkles}
                    onClick={() => handleOpenConvert(item)}
                  >
                    Convert to Application
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Convert to Application Modal */}
      {selectedSaved && (
        <Modal
          isOpen={convertModalOpen}
          onClose={() => setConvertModalOpen(false)}
          title="Convert to Active Application"
          subtitle={`Move ${selectedSaved.internship?.company} into your Application Tracker`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Pipeline Stage
              </label>
              <select
                value={initialStatus}
                onChange={(e) => setInitialStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Applied">Applied (Submitted Application)</option>
                <option value="Assessment">Assessment (Coding Challenge)</option>
                <option value="Interview">Interview (Screening Scheduled)</option>
                <option value="Interested">Interested (Planning to Apply)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="removeFromSavedCheck"
                checked={removeFromSaved}
                onChange={(e) => setRemoveFromSaved(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <label
                htmlFor="removeFromSavedCheck"
                className="text-xs font-medium text-slate-700 cursor-pointer"
              >
                Remove from Saved Opportunities once converted
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setConvertModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmConvert}
                loading={actionLoading}
              >
                Confirm & Add
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Saved;
