import { useQuery } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { api } from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/format';
import StatusChip from '../../components/StatusChip';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ChevronLeft, Download, CreditCard } from 'lucide-react';

export default function InvoiceDetail() {
  const [, params] = useRoute('/invoices/:id');

  const { data, isLoading } = useQuery({
    queryKey: ['invoice', params.id],
    queryFn: () => api.get(`/invoices/${params.id}`),
    enabled: !!params.id,
  });

  const invoice = data?.invoice || data;

  if (isLoading) return <LoadingSpinner fullPage />;
  if (!invoice) return <div className="text-center py-16 text-text-muted">Invoice not found.</div>;

  const isPending = ['UNPAID', 'PARTIALLY_PAID', 'OVERDUE'].includes(invoice.status);

  return (
    <div>
      <Link href="/invoices" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-6">
          <ChevronLeft className="w-4 h-4" /> Back to Invoices
        </Link>

      <div className="max-w-2xl">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-card p-6 mb-4">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-text-primary">{invoice.invoice_number}</h1>
                <StatusChip status={invoice.status} />
              </div>
              {invoice.order_number && (
                <p className="text-sm text-text-muted">Order: {invoice.order_number}</p>
              )}
            </div>
            <div className="flex gap-2">
              {isPending && (
                <Link href="/payments" className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                    <CreditCard className="w-4 h-4" /> Pay Now
                  </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            <div>
              <p className="text-text-muted mb-0.5">Invoice Date</p>
              <p className="font-medium text-text-primary">{formatDate(invoice.invoice_date)}</p>
            </div>
            <div>
              <p className="text-text-muted mb-0.5">Due Date</p>
              <p className={`font-medium ${invoice.status === 'OVERDUE' ? 'text-red-600' : 'text-text-primary'}`}>
                {formatDate(invoice.due_date)}
              </p>
            </div>
          </div>

          {/* Line Items */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-200 text-text-muted text-xs">
                <th className="text-left pb-2">Item</th>
                <th className="text-right pb-2">Qty</th>
                <th className="text-right pb-2">Rate</th>
                <th className="text-right pb-2">GST</th>
                <th className="text-right pb-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {(invoice.items || []).map((item, idx) => (
                <tr key={idx} className="border-b border-surface-100">
                  <td className="py-2 text-text-primary">{item.product_name}</td>
                  <td className="py-2 text-right text-text-secondary">{item.quantity} {item.unit}</td>
                  <td className="py-2 text-right text-text-secondary">{formatCurrency(item.unit_price)}</td>
                  <td className="py-2 text-right text-text-secondary">{item.gst_percent}%</td>
                  <td className="py-2 text-right font-medium text-text-primary">{formatCurrency(item.line_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-surface-200 pt-4 mt-2 space-y-2 text-sm">
            <div className="flex justify-between text-text-secondary">
              <span>Subtotal</span><span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>GST ({invoice.gst_percent || ''}%)</span>
              <span>{formatCurrency(invoice.tax_amount)}</span>
            </div>
            {invoice.amount_paid > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Amount Paid</span><span>- {formatCurrency(invoice.amount_paid)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base text-text-primary border-t border-surface-200 pt-2">
              <span>{invoice.amount_due > 0 ? 'Amount Due' : 'Total Amount'}</span>
              <span>{formatCurrency(invoice.amount_due ?? invoice.total_amount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
