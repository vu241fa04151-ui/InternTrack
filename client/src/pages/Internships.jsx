import React, { useState, useEffect } from 'react';
import { internshipsAPI, savedAPI, applicationsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { CardSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import {
  Search,
  Filter,
  Bookmark,
  ExternalLink,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Building2,
  CheckCircle,
  Briefcase,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

const Internships = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [workMode, setWorkMode] = useState('All');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('All');
  const [sort, setSort] = useState('newest');
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyNotes, setApplyNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const toast = useToast();

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const params = {
        search,
        workMode,
        location,
        duration,
        sort,
      };
      const res = await internshipsAPI.getAll(params);
      if (res.data.success) {
        setInternships(res.data.data);
      }
    } catch (err) {
      console.error('[Internships] Error:', err);
      toast.error('Failed to load internships');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchInternships();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, workMode, location, duration, sort]);

  const handleToggleSave = async (item, e) => {
    e.stopPropagation();
    try {
      if (item.isSaved) {
        await savedAPI.remove(item._id);
        setInternships((prev) =>
          prev.map((i) => (i._id === item._id ? { ...i, isSaved: false } : i))
        );
        toast.info(`Removed ${item.company} from saved opportunities`);
      } else {
        await savedAPI.save({ internshipId: item._id });
        setInternships((prev) =>
          prev.map((i) => (i._id === item._id ? { ...i, isSaved: true } : i))
        );
        toast.success(`Bookmarked ${item.company} opportunity!`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update bookmark');
    }
  };

  const handleOpenDetails = (item) => {
    setSelectedInternship(item);
    setModalOpen(true);
  };

  const handleAddToTracker = async () => {
    if (!selectedInternship) return;
    try {
      setActionLoading(true);
      await applicationsAPI.create({
        internshipId: selectedInternship._id,
        title: selectedInternship.title,
        company: selectedInternship.company,
        applicationDate: new Date(),
        applicationLink: selectedInternship.applyUrl,
        location: selectedInternship.location,
        stipend: selectedInternship.stipend,
        deadline: selectedInternship.deadline,
        status: 'Applied',
        notes: applyNotes || `Applied via InternTrack link on ${new Date().toLocaleDateString()}`,
      });
      toast.success(`Added ${selectedInternship.company} to your Application Tracker!`);
      setApplyModalOpen(false);
      setModalOpen(false);
      setApplyNotes('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setWorkMode('All');
    setLocation('');
    setDuration('All');
    setSort('newest');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header and Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Internship Opportunities
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Discover verified tech internships, bookmark roles, and add to your active application pipeline.
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Keyword Search */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by role, company, or required skill..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Work Mode */}
          <div className="md:col-span-2">
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Modes</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>

          {/* Location Filter */}
          <div className="md:col-span-2">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Filter location..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="newest">Sort: Newest</option>
              <option value="deadline">Sort: Deadline</option>
              <option value="stipendHigh">Sort: Highest Stipend</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="md:col-span-1 flex items-center">
            <button
              onClick={handleResetFilters}
              title="Reset Filters"
              className="w-full p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 flex items-center justify-center transition-colors text-xs font-semibold"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Internships Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : internships.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No internships match your filters"
          description="Try broadening your search term, changing work mode, or resetting all filters."
          actionText="Reset Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {internships.map((item) => {
            const deadlineDate = new Date(item.deadline);
            const daysLeft = Math.ceil((deadlineDate - new Date()) / (1000 * 60 * 60 * 24));

            return (
              <div
                key={item._id}
                onClick={() => handleOpenDetails(item)}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer group card-hover relative"
              >
                <div>
                  {/* Top Row: Company & Bookmark */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden p-2 flex-shrink-0">
                        {item.companyLogo ? (
                          <img
                            src={item.companyLogo}
                            alt={item.company}
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
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                            {item.company}
                          </h4>
                          {item.isSample ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                              Sample Demo
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Verified
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mt-0.5">
                          {item.title}
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleToggleSave(item, e)}
                      title={item.isSaved ? 'Remove Bookmark' : 'Save Internship'}
                      className={`p-2 rounded-xl border transition-colors ${
                        item.isSaved
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                          : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <Bookmark
                        className="w-4 h-4"
                        fill={item.isSaved ? 'currentColor' : 'none'}
                      />
                    </button>
                  </div>

                  {/* Badges: Work Mode & Location */}
                  <div className="flex flex-wrap items-center gap-2 mt-4 text-xs text-slate-600">
                    <Badge status={item.workMode} size="xs" />
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {item.location}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {item.duration}
                    </span>
                  </div>

                  {/* Required Skills Chips */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {item.requiredSkills?.slice(0, 4).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {item.requiredSkills?.length > 4 && (
                      <span className="px-1.5 py-0.5 text-[11px] text-slate-400 font-medium">
                        +{item.requiredSkills.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Info & Actions */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                      Stipend
                    </span>
                    <span className="text-xs font-bold text-slate-900">{item.stipend}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                      Deadline
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        daysLeft <= 7 ? 'text-rose-600' : 'text-slate-700'
                      }`}
                    >
                      {daysLeft <= 0 ? 'Closed' : `${daysLeft}d left`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Internship Detailed Modal */}
      {selectedInternship && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={selectedInternship.title}
          subtitle={`${selectedInternship.company} • ${selectedInternship.location}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6">
            {/* Meta Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Work Mode</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{selectedInternship.workMode}</p>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Duration</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{selectedInternship.duration}</p>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Stipend</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{selectedInternship.stipend}</p>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Deadline</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5">
                  {new Date(selectedInternship.deadline).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Opportunity Overview
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {selectedInternship.description}
              </p>
            </div>

            {/* Eligibility */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Eligibility & Qualifications
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed bg-amber-50/60 p-3 rounded-xl border border-amber-100">
                {selectedInternship.eligibility}
              </p>
            </div>

            {/* Required Skills */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Required Technical Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedInternship.requiredSkills?.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={(e) => handleToggleSave(selectedInternship, e)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600"
              >
                <Bookmark
                  className="w-4 h-4"
                  fill={selectedInternship.isSaved ? 'currentColor' : 'none'}
                />
                <span>{selectedInternship.isSaved ? 'Bookmarked' : 'Save for Later'}</span>
              </button>

              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setApplyModalOpen(true)}
                >
                  + Add to Tracker
                </Button>
                <a
                  href={selectedInternship.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <span>Apply on Company Site</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add to Tracker Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title="Add to Application Tracker"
        subtitle={`Track your application progress for ${selectedInternship?.company}`}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Application Notes (Optional)
            </label>
            <textarea
              rows="3"
              value={applyNotes}
              onChange={(e) => setApplyNotes(e.target.value)}
              placeholder="e.g. Applied via university careers portal, submitted resume v2"
              className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddToTracker}
              loading={actionLoading}
            >
              Confirm & Add
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Internships;

