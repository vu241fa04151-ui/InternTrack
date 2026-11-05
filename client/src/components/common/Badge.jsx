import React from 'react';

const Badge = ({ children, status = 'default', size = 'sm', className = '' }) => {
  const statusStyles = {
    Interested: 'bg-slate-100 text-slate-700 border-slate-200',
    Applied: 'bg-blue-50 text-blue-700 border-blue-200',
    Assessment: 'bg-purple-50 text-purple-700 border-purple-200',
    Shortlisted: 'bg-pink-50 text-pink-700 border-pink-200',
    Interview: 'bg-amber-50 text-amber-700 border-amber-200',
    Selected: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    Withdrawn: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    Scheduled: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
    Remote: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Hybrid: 'bg-violet-50 text-violet-700 border-violet-200',
    'On-site': 'bg-amber-50 text-amber-700 border-amber-200',
    verified: 'bg-sky-50 text-sky-700 border-sky-200',
    sample: 'bg-amber-50 text-amber-800 border-amber-200',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizes = {
    xs: 'px-1.5 py-0.5 text-[10px] font-semibold',
    sm: 'px-2.5 py-1 text-xs font-medium',
    md: 'px-3 py-1.5 text-sm font-medium',
  };

  const appliedStyle = statusStyles[status] || statusStyles.default;
  const appliedSize = sizes[size] || sizes.sm;

  return (
    <span
      className={`inline-flex items-center rounded-full border ${appliedStyle} ${appliedSize} ${className}`}
    >
      {children || status}
    </span>
  );
};

export default Badge;
