import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { api } from '../../utils/api';
import { formatCurrency, formatCurrencyCompact, formatDate } from '../../utils/format';
import KPICard from '../../components/KPICard';
import StatusChip from '../../components/StatusChip';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  TrendingUp, ShoppingCart, FileText, CreditCard, Package,
  RotateCcw, ArrowRight, Bell, AlertCircle
} from 'lucide-react';

function QuickAction({ href, icon: Icon, label, color }) {
  const colors = {
    blue: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
    green: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    amber: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
    purple: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
  };
  return (
    <Link href={href}>
      <a className={`flex items-center gap-3 p-4 rounded-xl font-medium text-sm transition-colors ${colors[color] || colors.blue}`}>
        <Icon className="w-5 h-5" />
        {label}
        <ArrowRight className="w-4 h-4 ml-auto opacity-60" />
      </a>
    </Link>
  );
}

export default function Dashboard() {
  const { data: creditData, isLoading: creditLoading } = useQuery({
    queryKey: ['my-credit'],
    queryFn: () => api.get('/credit-accounts/my'),
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['my-orders-summary'],
    queryFn: () => api.get('/orders', { limit: 5 }),
  });

  const { data: invoicesData } = useQuery({
    queryKey: ['my-invoices-summary'],
    queryFn: () => api.get('/invoices', { limit: 3, status: 'UNPAID,OVERDUE' }),
  });

  const { data: notificationsData } = useQuery({
    queryKey: ['my-notifications'],
    queryFn: () => api.get('/notifications', { limit: 3, unread: true }),
  });

  const credit = creditData?.credit_account || creditData || {};
  const orders = ordersData?.orders || ordersData?.data || [];
  const invoices = invoicesData?.invoices || invoicesData?.data || [];
  const notifications = notificationsData?.notifications || notificationsData?.data || [];

  const creditUtil = credit.credit_limit > 0
    ? ((credit.used_credit / credit.credit_limit) * 100).toFixed(0)
    : 0;

  return (
    <div>
      <PageHeader
        title="My Dashboard"
        subtitle="Overview of your account and recent activity"
      />

      {/* Notifications Banner */}
      {notifications.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-brand-50 border border-brand-200 flex items-start gap-3">
          <Bell className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-brand-800">
              You have {notifications.length} unread notification{notifications.length > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-brand-700 mt-0.5">{notifications[0]?.message}</p>
          </div>
          <Link href="/notifications">
            <a className="text-xs text-brand-600 font-medium hover:underline">View all</a>
          </Link>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KPICard
          label="Credit Limit"
          value={formatCurrencyCompact(credit.credit_limit)}
          icon={TrendingUp}
          color="brand"
          loading={creditLoading}
        />
        <KPICard
          label="Available Credit"
          value={formatCurrencyCompact(credit.available_credit)}
          sub={`${creditUtil}% utilized`}
          icon={CreditCard}
          color={creditUtil > 80 ? 'red' : 'green'}
          loading={creditLoading}
        />
        <KPICard
          label="Outstanding"
          value={formatCurrencyCompact(credit.outstanding_amount)}
          icon={FileText}
          color={credit.outstanding_amount > 0 ? 'amber' : 'green'}
          loading={creditLoading}
        />
        <KPICard
          label="Total Orders"
          value={ordersData?.total || orders.length}
          icon={ShoppingCart}
          color="purple"
          loading={ordersLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-text-primary">Recent Orders</h2>
            <Link href="/orders">
              <a className="text-xs text-brand-600 hover:underline font-medium">View all</a>
            </Link>
          </div>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-text-muted text-sm">No orders yet</div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <Link key={order.id} href={`/orders/${order.id}`}>
                  <a className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-50 transition-colors group">
                    <div>
                      <p className="text-sm font-medium text-text-primary group-hover:text-brand-600">
                        {order.order_number}
                      </p>
                      <p className="text-xs text-text-muted">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <StatusChip status={order.status} />
                      <p className="text-xs text-text-muted mt-1">{formatCurrency(order.grand_total)}</p>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Pending Invoices */}
        <div className="bg-white rounded-xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-text-primary">Unpaid Invoices</h2>
            <Link href="/invoices">
              <a className="text-xs text-brand-600 hover:underline font-medium">View all</a>
            </Link>
          </div>
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-text-muted text-sm">No pending invoices</div>
          ) : (
            <div className="space-y-3">
              {invoices.map((inv) => (
                <div key={inv.id} className={`flex items-center justify-between p-3 rounded-lg
                  ${inv.status === 'OVERDUE' ? 'bg-red-50 border border-red-200' : 'hover:bg-surface-50'}`}>
                  <div className="flex items-start gap-2">
                    {inv.status === 'OVERDUE' && <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />}
                    <div>
                      <p className="text-sm font-medium text-text-primary">{inv.invoice_number}</p>
                      <p className="text-xs text-text-muted">Due {formatDate(inv.due_date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-text-primary">{formatCurrency(inv.amount_due)}</p>
                    <StatusChip status={inv.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <QuickAction href="/products" icon={Package} label="Browse Products" color="blue" />
            <QuickAction href="/payments" icon={CreditCard} label="Make Payment" color="green" />
            <QuickAction href="/returns" icon={RotateCcw} label="Request Return" color="amber" />
            <QuickAction href="/tickets" icon={FileText} label="Raise Ticket" color="purple" />
          </div>
        </div>
      </div>
    </div>
  );
}
