import React, { useState, useEffect } from 'react';
import { applicationsAPI, interviewsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Video,
  FileCheck,
  Bell,
  MapPin,
  ExternalLink,
  Plus,
} from 'lucide-react';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);
  const [selectedEventModal, setSelectedEventModal] = useState(false);
  const [selectedEventData, setSelectedEventData] = useState(null);

  const toast = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appsRes, intsRes] = await Promise.all([
        applicationsAPI.getAll({}),
        interviewsAPI.getAll({}),
      ]);
      if (appsRes.data.success) setApplications(appsRes.data.data);
      if (intsRes.data.success) setInterviews(intsRes.data.data);
    } catch (err) {
      console.error('[Calendar] Error fetching events:', err);
      toast.error('Could not load calendar events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Build events lookup by date string: YYYY-MM-DD
  const eventsByDate = {};

  const addEvent = (dateStr, eventObj) => {
    if (!eventsByDate[dateStr]) eventsByDate[dateStr] = [];
    eventsByDate[dateStr].push(eventObj);
  };

  // Deadlines & Follow-ups from Applications
  applications.forEach((app) => {
    if (app.deadline) {
      const d = app.deadline.split('T')[0];
      addEvent(d, {
        id: `deadline-${app._id}`,
        type: 'deadline',
        title: `Deadline: ${app.company}`,
        subtitle: app.title,
        status: app.status,
        date: app.deadline,
        link: app.applicationLink,
        notes: app.notes,
        color: 'bg-rose-500 text-white',
        dotColor: 'bg-rose-500',
      });
    }

    if (app.nextFollowUpDate) {
      const f = app.nextFollowUpDate.split('T')[0];
      addEvent(f, {
        id: `followup-${app._id}`,
        type: 'followup',
        title: `Follow-up: ${app.company}`,
        subtitle: app.title,
        status: app.status,
        date: app.nextFollowUpDate,
        notes: app.notes,
        color: 'bg-amber-500 text-white',
        dotColor: 'bg-amber-500',
      });
    }
  });

  // Interviews
  interviews.forEach((intr) => {
    if (intr.interviewDate) {
      const d = intr.interviewDate.split('T')[0];
      addEvent(d, {
        id: `interview-${intr._id}`,
        type: 'interview',
        title: `${intr.company} – ${intr.interviewRound}`,
        subtitle: `${intr.role} at ${intr.interviewTime}`,
        status: intr.status,
        date: intr.interviewDate,
        time: intr.interviewTime,
        mode: intr.interviewMode,
        link: intr.meetingLink,
        notes: intr.preparationNotes,
        color: 'bg-purple-600 text-white',
        dotColor: 'bg-purple-600',
      });
    }
  });

  // Upcoming items due within 7 days
  const now = new Date();
  const upcomingDeadlinesList = applications
    .filter((a) => {
      if (!a.deadline) return false;
      const d = new Date(a.deadline);
      const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
      return diff >= 0 && diff <= 7 && a.status !== 'Selected' && a.status !== 'Rejected';
    })
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  const handleDateClick = (dateStr, events) => {
    if (events && events.length > 0) {
      setSelectedDayEvents({ date: dateStr, events });
    }
  };

  const handleOpenEventDetail = (ev) => {
    setSelectedEventData(ev);
    setSelectedEventModal(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Deadline & Schedule Calendar
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track application deadlines, technical assessments, interviews, and follow-up reminders.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Application Deadline</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
            <span>Interview</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Follow-up</span>
          </span>
        </div>
      </div>

      {/* Approaching Deadlines Spotlight Banner */}
      {upcomingDeadlinesList.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-start gap-3 shadow-sm">
          <Bell className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5 animate-bounce" />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
              Approaching Deadlines This Week ({upcomingDeadlinesList.length})
            </h4>
            <div className="flex flex-wrap gap-2 mt-2">
              {upcomingDeadlinesList.map((app) => {
                const diff = Math.ceil(
                  (new Date(app.deadline) - now) / (1000 * 60 * 60 * 24)
                );
                return (
                  <span
                    key={app._id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-rose-200 text-xs font-semibold text-rose-800 shadow-xs"
                  >
                    <strong>{app.company}</strong> ({app.title}):{' '}
                    <span className="text-rose-600 font-bold">
                      {diff === 0 ? 'Due Today!' : `${diff} days left`}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Calendar Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-6">
        {/* Month Navigation Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">
              {currentDate.toLocaleDateString([], { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-px text-center mb-2">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Previous Month Pad */}
          {Array.from({ length: firstDayIndex }).map((_, i) => {
            const dayNum = prevMonthDays - firstDayIndex + i + 1;
            return (
              <div
                key={`prev-${i}`}
                className="min-h-24 p-2 rounded-xl border border-slate-100 bg-slate-50/40 text-slate-300 text-xs select-none"
              >
                {dayNum}
              </div>
            );
          })}

          {/* Current Month Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
              dayNum
            ).padStart(2, '0')}`;
            const dayEvents = eventsByDate[dateStr] || [];
            const isToday =
              new Date().toISOString().split('T')[0] === dateStr;

            return (
              <div
                key={dayNum}
                onClick={() => handleDateClick(dateStr, dayEvents)}
                className={`min-h-24 p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isToday
                    ? 'border-indigo-400 bg-indigo-50/30'
                    : 'border-slate-200/80 bg-white hover:bg-slate-50/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold inline-flex items-center justify-center w-6 h-6 rounded-full ${
                      isToday
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-700'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[10px] font-bold text-slate-400">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                {/* Event Pills */}
                <div className="space-y-1 mt-1 overflow-hidden">
                  {dayEvents.slice(0, 2).map((ev) => (
                    <div
                      key={ev.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEventDetail(ev);
                      }}
                      className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium flex items-center gap-1 ${ev.color} hover:opacity-90`}
                      title={ev.title}
                    >
                      <span className="truncate">{ev.title}</span>
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <span className="text-[10px] text-slate-400 font-semibold block px-1">
                      +{dayEvents.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Events List Modal / Drawer */}
      {selectedDayEvents && (
        <Modal
          isOpen={!!selectedDayEvents}
          onClose={() => setSelectedDayEvents(null)}
          title={`Events on ${new Date(selectedDayEvents.date + 'T00:00:00').toLocaleDateString(
            [],
            { month: 'long', day: 'numeric', year: 'numeric' }
          )}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-3">
            {selectedDayEvents.events.map((ev) => (
              <div
                key={ev.id}
                onClick={() => handleOpenEventDetail(ev)}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${ev.color}`}>
                    {ev.type.toUpperCase()}
                  </span>
                  <Badge status={ev.status} size="xs" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-2">{ev.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{ev.subtitle}</p>
                {ev.notes && (
                  <p className="text-xs text-slate-600 mt-2 bg-white p-2 rounded-lg border border-slate-100">
                    {ev.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Single Event Detail Popover */}
      {selectedEventData && (
        <Modal
          isOpen={selectedEventModal}
          onClose={() => setSelectedEventModal(false)}
          title={selectedEventData.title}
          subtitle={selectedEventData.subtitle}
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge status={selectedEventData.status} size="sm" />
              <span className="text-xs text-slate-500">
                Scheduled on{' '}
                {new Date(selectedEventData.date).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            {selectedEventData.mode && (
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <Video className="w-4 h-4 text-purple-600" />
                <span>Mode: <strong>{selectedEventData.mode}</strong></span>
              </div>
            )}

            {selectedEventData.notes && (
              <div>
                <h5 className="text-xs font-semibold text-slate-500 mb-1">Notes</h5>
                <p className="text-xs text-slate-700 p-3 bg-slate-50 rounded-xl border border-slate-100 leading-relaxed">
                  {selectedEventData.notes}
                </p>
              </div>
            )}

            {selectedEventData.link && (
              <div className="pt-2">
                <a
                  href={selectedEventData.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <span>Open Meeting / Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Calendar;

