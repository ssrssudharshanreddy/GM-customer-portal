import { useQuery } from '@tanstack/react-query';
import { api } from '../../utils/api';
import { formatCurrency, formatDate, formatPercent } from '../../utils/format';
import PageHeader from '../../components/PageHeader';
import KPICard from '../../components/KPICard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { TrendingUp, CreditCard, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function CreditAccount() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-credit-full'],
    queryFn: () => api.get('/credit-accounts/my'),
  });

  const { data: historyData } = useQuery({
    queryKey: ['my-credit-history'],
    queryFn: () => api.get('/credit-accounts/my/history'),
  });

  const credit = data?.credit_account || data || {};
  const history = historyData?.history || historyData?.data || [];

  const utilization = credit.credit_limit > 0
    ? (credit.used_credit / credit.credit_limit) * 100
    : 0;

  const utilizationColor = utilization > 90 ? 'red' : utilization > 70 ? 'amber' : 'green';

  if (isLoading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <PageHeader title="Credit Account" subtitle="Your credit profile and history" />

      {credit.is_frozen && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex gap-3">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">Credit Account Frozen</p>
            <p className="text-sm text-red-700 mt-0.5">
              Your credit account is currently frozen. Please contact your accounts executive for assistance.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KPICard
          label="Credit Limit"
          value={formatCurrency(credit.credit_limit)}
          icon={TrendingUp}
          color="brand"
        />
        <KPICard
          label="Used Credit"
          value={formatCurrency(credit.used_credit)}
          sub={`${formatPercent(utilization)} utilized`}
          icon={CreditCard}
          color={utilizationColor}
        />
        <KPICard
          label="Available Credit"
          value={formatCurrency(credit.available_credit)}
          icon={CheckCircle}
          color="green"
        />
        <KPICard
          label="Outstanding"
          value={formatCurrency(credit.outstanding_amount)}
          icon={AlertTriangle}
          color={credit.outstanding_amount > 0 ? 'amber' : 'green'}
        />
      </div>

      {/* Utilization Bar */}
      <div className="bg-white rounded-xl shadow-card p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-text-primary">Credit Utilization</p>
          <p className={`text-sm font-semibold ${
            utilization > 90 ? 'text-red-600' : utilization > 70 ? 'text-amber-600' : 'text-emerald-600'
          }`}>{formatPercent(utilization)}</p>
        </div>
        <div className="w-full h-3 bg-surface-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              utilization > 90 ? 'bg-red-500' : utilization > 70 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(utilization, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-text-muted mt-1">
          <span>₹0</span>
          <span>{formatCurrency(credit.credit_limit)}</span>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-card p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Account Details</h2>
          <div className="space-y-3 text-sm">
            {[
              ['Credit Days', credit.credit_days ? `${credit.credit_days} days` : '—'],
              ['Account Status', credit.is_frozen ? 'Frozen' : 'Active'],
              ['Last Updated', formatDate(credit.updated_at)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <span className="text-text-muted">{label}</span>
                <span className="font-medium text-text-primary">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Quick Summary</h2>
          <div className="space-y-3 text-sm">
            {[
              ['Total Invoiced', formatCurrency(credit.total_invoiced)],
              ['Total Paid', formatCurrency(credit.total_paid)],
              ['Overdue Amount', formatCurrency(credit.overdue_amount)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <span className="text-text-muted">{label}</span>
                <span className="font-medium text-text-primary">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-white rounded-xl shadow-card p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Credit Events</h2>
          <div className="space-y-3">
            {history.map((event, idx) => (
              <div key={idx} className="flex items-start gap-3 py-2 border-b border-surface-100 last:border-0">
                <div className="w-7 h-7 rounded-full bg-surface-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-3.5 h-3.5 text-text-muted" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-text-primary">{event.event_description || event.action}</p>
                  <p className="text-xs text-text-muted">{formatDate(event.created_at)}</p>
                </div>
                {event.amount_change && (
                  <span className={`text-sm font-medium ${event.amount_change > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {event.amount_change > 0 ? '+' : ''}{formatCurrency(event.amount_change)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
