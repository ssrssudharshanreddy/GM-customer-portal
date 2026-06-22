const STATUS_STYLES = {
  APPLICATION_SUBMITTED: 'bg-blue-100 text-blue-700',
  PENDING_CRE_REVIEW: 'bg-amber-100 text-amber-700',
  ACTION_REQUIRED: 'bg-red-100 text-red-700',
  PENDING_ACCOUNTS_REVIEW: 'bg-amber-100 text-amber-700',
  CREDIT_SETUP_IN_PROGRESS: 'bg-sky-100 text-sky-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  ACTIVE: 'bg-green-100 text-green-700',
  SUSPENDED: 'bg-orange-100 text-orange-700',
  BLOCKED: 'bg-red-100 text-red-700',
  REJECTED: 'bg-red-100 text-red-700',
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-cyan-100 text-cyan-700',
  PROCESSING: 'bg-violet-100 text-violet-700',
  PACKED: 'bg-sky-100 text-sky-700',
  DISPATCHED: 'bg-amber-100 text-amber-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-slate-100 text-slate-600',
  STOCK_HOLD: 'bg-red-100 text-red-700',
  UNPAID: 'bg-amber-100 text-amber-700',
  PARTIALLY_PAID: 'bg-sky-100 text-sky-700',
  PAID: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-red-100 text-red-700',
  PENDING_VERIFICATION: 'bg-amber-100 text-amber-700',
  VERIFIED: 'bg-green-100 text-green-700',
  REJECTED_PAYMENT: 'bg-red-100 text-red-700',
  RETURN_REQUESTED: 'bg-blue-100 text-blue-700',
  UNDER_REVIEW: 'bg-amber-100 text-amber-700',
  RETURN_APPROVED: 'bg-emerald-100 text-emerald-700',
  PICKUP_SCHEDULED: 'bg-sky-100 text-sky-700',
  COLLECTED: 'bg-violet-100 text-violet-700',
  RETURN_COMPLETED: 'bg-green-100 text-green-700',
  RETURN_REJECTED: 'bg-red-100 text-red-700',
  OPEN: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  RESOLVED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-slate-100 text-slate-600',
  ESCALATED: 'bg-red-100 text-red-700',
};

const LABEL_MAP = {
  APPLICATION_SUBMITTED: 'Submitted',
  PENDING_CRE_REVIEW: 'CRE Review',
  ACTION_REQUIRED: 'Action Required',
  PENDING_ACCOUNTS_REVIEW: 'AE Review',
  CREDIT_SETUP_IN_PROGRESS: 'Credit Setup',
  PARTIALLY_PAID: 'Partial',
  PENDING_VERIFICATION: 'Pending Verification',
  RETURN_REQUESTED: 'Requested',
  RETURN_APPROVED: 'Approved',
  RETURN_COMPLETED: 'Completed',
  RETURN_REJECTED: 'Rejected',
  PICKUP_SCHEDULED: 'Pickup Scheduled',
  STOCK_HOLD: 'Stock Hold',
};

export default function StatusChip({ status, className = '' }) {
  if (!status) return null;
  const styles = STATUS_STYLES[status] || 'bg-slate-100 text-slate-600';
  const label = LABEL_MAP[status] || status.replace(/_/g, ' ');
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles} ${className}`}>
      {label}
    </span>
  );
}
