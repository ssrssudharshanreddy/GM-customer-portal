import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { api } from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/format';
import PageHeader from '../../components/PageHeader';
import StatusChip from '../../components/StatusChip';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FileText } from 'lucide-react';

const STATUSES = ['', 'UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE'];

export default function Invoices() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['my-invoices', status, page],
    queryFn: () => api.get('/invoices', { status: status || undefined, page, limit: 15 }),
    keepPreviousData: true,
  });

  const invoices = data?.invoices || data?.data || [];
  const total = data?.total || 0;

  return (
    <div>
      <PageHeader title="Invoices" subtitle={`${total} total invoices`} />

      <div className="flex justify-end mb-6">
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : invoices.length === 0 ? (
        <EmptyState icon={FileText} title="No invoices found" description="Invoices are generated automatically when you place orders." />
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <Link key={inv.id} href={`/invoices/${inv.id}`} className={`block bg-white rounded-xl shadow-card hover:shadow-elevated transition-shadow p-4 ${inv.status === 'OVERDUE' ? 'border border-red-200' : ''}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-text-primary text-sm">{inv.invoice_number}</p>
                      <StatusChip status={inv.status} />
                    </div>
                    <p className="text-xs text-text-muted">
                      Issued {formatDate(inv.invoice_date)} · Due {formatDate(inv.due_date)}
                    </p>
                    {inv.order_number && (
                      <p className="text-xs text-text-secondary mt-0.5">Order: {inv.order_number}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-text-primary">{formatCurrency(inv.total_amount)}</p>
                    {inv.amount_due > 0 && inv.amount_due !== inv.total_amount && (
                      <p className="text-xs text-red-600 mt-0.5">Due: {formatCurrency(inv.amount_due)}</p>
                    )}
                  </div>
                </div>
              </Link>
          ))}

          {total > 15 && (
            <div className="flex justify-center gap-2 pt-4">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 rounded-lg border border-surface-200 text-sm disabled:opacity-40 hover:bg-surface-100">Previous</button>
              <span className="px-4 py-2 text-sm text-text-secondary">Page {page}</span>
              <button disabled={invoices.length < 15} onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 rounded-lg border border-surface-200 text-sm disabled:opacity-40 hover:bg-surface-100">Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
