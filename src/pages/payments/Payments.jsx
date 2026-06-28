import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../utils/api';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/format';
import PageHeader from '../../components/PageHeader';
import StatusChip from '../../components/StatusChip';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { CreditCard, Upload, CheckCircle, FileText } from 'lucide-react';

const PAYMENT_MODES = [
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'NEFT', label: 'NEFT' },
  { value: 'RTGS', label: 'RTGS' },
  { value: 'IMPS', label: 'IMPS' },
  { value: 'UPI', label: 'UPI' },
  { value: 'CHEQUE', label: 'Cheque' },
];

function PaymentForm({ invoices, onSuccess }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    invoice_id: '',
    amount: '',
    payment_mode: '',
    reference_number: '',
    remarks: '',
  });
  const [proof, setProof] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const selectedInvoice = invoices.find((i) => i.id === form.invoice_id);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.invoice_id || !form.amount || !form.payment_mode || !form.reference_number) {
      setError('Please fill all required fields.'); return;
    }
    if (!proof) { setError('Payment proof is required.'); return; }
    setSubmitting(true); setError('');
    try {
      const payload = {
        invoice_id: form.invoice_id,
        amount: parseFloat(form.amount),
        payment_mode: form.payment_mode,
        reference_number: form.reference_number,
        remarks: form.remarks,
        payment_date: new Date().toISOString().split('T')[0],
      };
      const payment = await api.post('/payments', payload);
      
      const formData = new FormData();
      formData.append('file', proof);
      await api.upload(`/payments/${payment.id}/receipt`, formData);
      
      qc.invalidateQueries(['my-payments']);
      qc.invalidateQueries(['my-invoices']);
      qc.invalidateQueries(['my-credit']);
      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(err.message || 'Payment submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-xl shadow-card p-8 text-center">
        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h3 className="font-semibold text-text-primary mb-1">Payment Submitted!</h3>
        <p className="text-sm text-text-secondary">Our accounts team will verify your payment shortly.</p>
        <button onClick={() => setSuccess(false)} className="mt-4 text-sm text-brand-600 hover:underline">
          Submit another payment
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-card p-6">
      <h2 className="text-sm font-semibold text-text-primary mb-5">Submit Payment</h2>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Invoice *</label>
          <select value={form.invoice_id} onChange={(e) => {
            set('invoice_id', e.target.value);
            const inv = invoices.find((i) => i.id === e.target.value);
            if (inv) set('amount', inv.amount_due?.toString() || '');
          }}
            className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
            <option value="">Select an invoice</option>
            {invoices.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.invoice_number} — {formatCurrency(inv.amount_due)} due
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Amount Paid (₹) *</label>
            <input type="number" step="0.01" min="1" value={form.amount} onChange={(e) => set('amount', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Payment Mode *</label>
            <select value={form.payment_mode} onChange={(e) => set('payment_mode', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
              <option value="">Select mode</option>
              {PAYMENT_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            UTR / Transaction Reference *
          </label>
          <input type="text" value={form.reference_number} onChange={(e) => set('reference_number', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
            placeholder="UTR or transaction ID" />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Remarks</label>
          <textarea value={form.remarks} onChange={(e) => set('remarks', e.target.value)} rows={2}
            className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            placeholder="Optional remarks" />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Payment Proof *</label>
          <label className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border-2 border-dashed cursor-pointer transition-colors
            ${proof ? 'border-emerald-300 bg-emerald-50' : 'border-surface-200 hover:border-brand-300 hover:bg-brand-50'}`}>
            <Upload className="w-4 h-4 text-text-muted flex-shrink-0" />
            <span className="text-sm text-text-secondary truncate">
              {proof ? proof.name : 'Upload screenshot / bank receipt (PDF, JPG, PNG)'}
            </span>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setProof(e.target.files?.[0])} className="hidden" />
          </label>
        </div>

        <button type="submit" disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
          {submitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CreditCard className="w-4 h-4" />}
          {submitting ? 'Submitting…' : 'Submit Payment'}
        </button>
      </form>
    </div>
  );
}

export default function Payments() {
  const [tab, setTab] = useState('submit');

  const { data: invoicesData } = useQuery({
    queryKey: ['my-invoices-unpaid'],
    queryFn: () => api.get('/invoices', { status: 'UNPAID,PARTIALLY_PAID,OVERDUE', limit: 50 }),
  });

  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ['my-payments'],
    queryFn: () => api.get('/payments/my'),
    enabled: tab === 'history',
  });

  const pendingInvoices = invoicesData?.invoices || invoicesData?.data || [];
  const payments = paymentsData?.payments || paymentsData?.data || [];

  return (
    <div>
      <PageHeader title="Payments" subtitle="Submit and track your payments" />

      <div className="flex gap-1 mb-6 bg-surface-100 rounded-xl p-1 w-fit">
        {['submit', 'history'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize
              ${tab === t ? 'bg-white shadow-sm text-text-primary' : 'text-text-muted hover:text-text-primary'}`}>
            {t === 'submit' ? 'Submit Payment' : 'Payment History'}
          </button>
        ))}
      </div>

      {tab === 'submit' ? (
        <div className="max-w-lg">
          {pendingInvoices.length === 0 ? (
            <div className="bg-white rounded-xl shadow-card p-8 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="font-semibold text-text-primary mb-1">No Outstanding Invoices</h3>
              <p className="text-sm text-text-secondary">All invoices are paid. You're all clear!</p>
            </div>
          ) : (
            <PaymentForm invoices={pendingInvoices} />
          )}
        </div>
      ) : (
        <div>
          {isLoading ? <LoadingSpinner /> : payments.length === 0 ? (
            <EmptyState icon={CreditCard} title="No payments yet" description="Your submitted payments will appear here." />
          ) : (
            <div className="space-y-3">
              {payments.map((p) => (
                <div key={p.id} className="bg-white rounded-xl shadow-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-text-primary">{p.invoice_number}</p>
                        <StatusChip status={p.status} />
                      </div>
                      <p className="text-xs text-text-muted">
                        {p.payment_mode} · {p.transaction_reference}
                      </p>
                      <p className="text-xs text-text-muted">{formatDateTime(p.payment_date)}</p>
                    </div>
                    <p className="font-bold text-text-primary">{formatCurrency(p.amount_paid)}</p>
                  </div>
                  {p.rejection_reason && (
                    <div className="mt-2 p-2 rounded bg-red-50 text-xs text-red-700">
                      Rejected: {p.rejection_reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
