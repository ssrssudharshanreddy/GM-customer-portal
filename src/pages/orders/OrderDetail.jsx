import { useQuery } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { api } from '../../utils/api';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/format';
import StatusChip from '../../components/StatusChip';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ChevronLeft, Package, MapPin, CheckCircle, Circle, Clock } from 'lucide-react';

const ORDER_TIMELINE = [
  'PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'DISPATCHED', 'OUT_FOR_DELIVERY', 'DELIVERED',
];

export default function OrderDetail() {
  const [, params] = useRoute('/orders/:id');

  const { data, isLoading } = useQuery({
    queryKey: ['order', params.id],
    queryFn: () => api.get(`/orders/${params.id}`),
    enabled: !!params.id,
  });

  const order = data?.order || data;

  if (isLoading) return <LoadingSpinner fullPage />;
  if (!order) return <div className="text-center py-16 text-text-muted">Order not found.</div>;

  const currentStep = ORDER_TIMELINE.indexOf(order.status);

  return (
    <div>
      <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-6">
          <ChevronLeft className="w-4 h-4" /> Back to Orders
        </Link>

      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">{order.order_number}</h1>
          <p className="text-sm text-text-muted">{formatDateTime(order.created_at)}</p>
        </div>
        <StatusChip status={order.status} />
      </div>

      {/* Timeline */}
      {order.status !== 'CANCELLED' && (
        <div className="bg-white rounded-xl shadow-card p-6 mb-6 overflow-x-auto">
          <h2 className="text-sm font-semibold text-text-primary mb-5">Order Progress</h2>
          <div className="flex items-center min-w-max">
            {ORDER_TIMELINE.map((step, idx) => {
              const done = currentStep > idx;
              const current = currentStep === idx;
              return (
                <div key={step} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center
                      ${done ? 'bg-emerald-100' : current ? 'bg-brand-100' : 'bg-surface-100'}`}>
                      {done ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : current ? (
                        <Clock className="w-4 h-4 text-brand-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-surface-300" />
                      )}
                    </div>
                    <p className={`text-xs mt-1 font-medium text-center
                      ${done ? 'text-emerald-600' : current ? 'text-brand-600' : 'text-text-muted'}`}>
                      {step === 'OUT_FOR_DELIVERY' ? 'Out for Delivery' : (step.charAt(0) + step.slice(1).toLowerCase())}
                    </p>
                  </div>
                  {idx < ORDER_TIMELINE.length - 1 && (
                    <div className={`h-0.5 w-12 mx-1 mb-5 ${done ? 'bg-emerald-300' : 'bg-surface-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-card p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-4">Items Ordered</h2>
            <div className="space-y-3">
              {(order.items || []).map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 py-2 border-b border-surface-100 last:border-0">
                  <div className="w-10 h-10 bg-surface-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-surface-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary line-clamp-1">{item.product_name}</p>
                    <p className="text-xs text-text-muted">{item.product_code} · {item.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-text-primary">
                      {item.quantity} × {formatCurrency(item.unit_price)}
                    </p>
                    <p className="text-xs text-text-muted">{formatCurrency(item.line_total)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-surface-200 pt-4 mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>GST</span><span>{formatCurrency(order.tax_total)}</span>
              </div>
              <div className="flex justify-between font-semibold text-text-primary">
                <span>Grand Total</span><span>{formatCurrency(order.grand_total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-card p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-3">Delivery Address</h2>
            <div className="flex gap-2 text-sm text-text-secondary">
              <MapPin className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5" />
              <div>
                <p>{order.delivery_address_line1}</p>
                {order.delivery_address_line2 && <p>{order.delivery_address_line2}</p>}
                <p>{order.delivery_city}, {order.delivery_state} - {order.delivery_pincode}</p>
              </div>
            </div>
          </div>

          {order.invoice_number && (
            <div className="bg-white rounded-xl shadow-card p-5">
              <h2 className="text-sm font-semibold text-text-primary mb-2">Invoice</h2>
              <Link href={`/invoices/${order.invoice_id}`} className="text-sm text-brand-600 hover:underline font-medium">
                  {order.invoice_number}
                </Link>
            </div>
          )}

          {order.notes && (
            <div className="bg-surface-50 rounded-xl p-4 border border-surface-200">
              <p className="text-xs font-medium text-text-muted mb-1">Notes</p>
              <p className="text-sm text-text-secondary">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
