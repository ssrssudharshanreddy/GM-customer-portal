import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { api } from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/format';
import PageHeader from '../../components/PageHeader';
import StatusChip from '../../components/StatusChip';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ShoppingCart, Search } from 'lucide-react';

const STATUSES = ['', 'PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'DISPATCHED', 'DELIVERED', 'CANCELLED'];

export default function Orders() {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['my-orders', status, search, page],
    queryFn: () => api.get('/orders', {
      status: status || undefined,
      search: search || undefined,
      page,
      limit: 15,
    }),
    keepPreviousData: true,
  });

  const orders = data?.orders || data?.data || [];
  const total = data?.total || 0;

  return (
    <div>
      <PageHeader title="My Orders" subtitle={`${total} total orders`} />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search by order number…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
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
      ) : orders.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="No orders found" description="Your orders will appear here once you place them." />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`} className="block bg-white rounded-xl shadow-card hover:shadow-elevated transition-shadow p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-text-primary text-sm">{order.order_number}</p>
                      <StatusChip status={order.status} />
                    </div>
                    <p className="text-xs text-text-muted">{formatDate(order.created_at)}</p>
                    <p className="text-xs text-text-secondary mt-1">
                      {order.item_count || '—'} item{order.item_count !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-text-primary">{formatCurrency(order.grand_total)}</p>
                    <p className="text-xs text-text-muted mt-0.5">incl. GST</p>
                  </div>
                </div>
              </Link>
          ))}

          {total > 15 && (
            <div className="flex justify-center gap-2 pt-4">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 rounded-lg border border-surface-200 text-sm disabled:opacity-40 hover:bg-surface-100">
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-text-secondary">Page {page}</span>
              <button disabled={orders.length < 15} onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 rounded-lg border border-surface-200 text-sm disabled:opacity-40 hover:bg-surface-100">
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
