import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { api } from '../../utils/api';
import { formatDate } from '../../utils/format';
import PageHeader from '../../components/PageHeader';
import StatusChip from '../../components/StatusChip';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { MessageSquare, Plus } from 'lucide-react';

export default function Tickets() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['my-tickets', status, page],
    queryFn: () => api.get('/tickets', { status: status || undefined, page, limit: 15 }),
    keepPreviousData: true,
  });

  const tickets = data?.tickets || data?.data || [];
  const total = data?.total || 0;

  return (
    <div>
      <PageHeader
        title="Support Tickets"
        subtitle={`${total} tickets`}
        action={
          <Link href="/tickets/new" className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> New Ticket
            </Link>
        }
      />

      <div className="flex justify-end mb-4">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
          <option value="">All Statuses</option>
          {['OPEN', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED'].map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No tickets"
          description="Raise a support ticket if you need help with anything."
          action={
            <Link href="/tickets/new" className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
                <Plus className="w-4 h-4" /> Raise Ticket
              </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Link key={ticket.id} href={`/tickets/${ticket.id}`} className="block bg-white rounded-xl shadow-card hover:shadow-elevated transition-shadow p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-semibold text-text-primary text-sm">{ticket.ticket_number}</p>
                      <StatusChip status={ticket.status} />
                      {ticket.category && (
                        <span className="text-xs bg-surface-100 text-text-muted px-2 py-0.5 rounded-full">
                          {ticket.category}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary line-clamp-1">{ticket.subject}</p>
                    <p className="text-xs text-text-muted mt-0.5">{formatDate(ticket.created_at)}</p>
                  </div>
                </div>
              </Link>
          ))}
          {total > 15 && (
            <div className="flex justify-center gap-2 pt-4">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 rounded-lg border border-surface-200 text-sm disabled:opacity-40 hover:bg-surface-100">Previous</button>
              <span className="px-4 py-2 text-sm text-text-secondary">Page {page}</span>
              <button disabled={tickets.length < 15} onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 rounded-lg border border-surface-200 text-sm disabled:opacity-40 hover:bg-surface-100">Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
