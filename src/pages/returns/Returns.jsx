import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { api } from '../../utils/api';
import { formatDate } from '../../utils/format';
import PageHeader from '../../components/PageHeader';
import StatusChip from '../../components/StatusChip';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { RotateCcw, Plus } from 'lucide-react';

export default function Returns() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['my-returns', page],
    queryFn: () => api.get('/returns', { page, limit: 15 }),
    keepPreviousData: true,
  });

  const returns = data?.returns || data?.data || [];
  const total = data?.total || 0;

  return (
    <div>
      <PageHeader
        title="Returns"
        subtitle={`${total} total return requests`}
        action={
          <Link href="/returns/new" className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> New Return
            </Link>
        }
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : returns.length === 0 ? (
        <EmptyState
          icon={RotateCcw}
          title="No return requests"
          description="You haven't submitted any return requests yet."
          action={
            <Link href="/returns/new" className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
                <Plus className="w-4 h-4" /> Request a Return
              </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {returns.map((ret) => (
            <Link key={ret.id} href={`/returns/${ret.id}`}>
              <div className="bg-white rounded-xl shadow-card p-4 hover:shadow-lg transition-shadow cursor-pointer block">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-text-primary text-sm">{ret.return_number}</p>
                    <StatusChip status={ret.status} />
                  </div>
                  <p className="text-xs text-text-muted">
                    Order: {ret.order_number} · {formatDate(ret.created_at)}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5 capitalize">
                    Reason: {ret.reason?.replace(/_/g, ' ').toLowerCase()}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    ret.return_type === 'FULL' ? 'bg-purple-100 text-purple-700' : 'bg-sky-100 text-sky-700'
                  }`}>
                    {ret.return_type}
                  </span>
                </div>
              </div>
              </div>
            </Link>
          ))}

          {total > 15 && (
            <div className="flex justify-center gap-2 pt-4">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 rounded-lg border border-surface-200 text-sm disabled:opacity-40 hover:bg-surface-100">Previous</button>
              <span className="px-4 py-2 text-sm text-text-secondary">Page {page}</span>
              <button disabled={returns.length < 15} onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 rounded-lg border border-surface-200 text-sm disabled:opacity-40 hover:bg-surface-100">Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
