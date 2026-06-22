import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import { ChevronLeft, CheckCircle, Upload } from 'lucide-react';
import { Link } from 'wouter';

const RETURN_REASONS = [
  { value: 'DAMAGED', label: 'Damaged Product' },
  { value: 'WRONG_PRODUCT', label: 'Wrong Product Delivered' },
  { value: 'QUANTITY_MISMATCH', label: 'Quantity Mismatch' },
  { value: 'QUALITY_ISSUE', label: 'Quality Issue' },
  { value: 'MISSING_ITEMS', label: 'Missing Items' },
  { value: 'OTHER', label: 'Other' },
];

export default function CreateReturn() {
  const [, navigate] = useLocation();
  const [form, setForm] = useState({
    order_id: '',
    reason: '',
    return_type: 'FULL',
    description: '',
    items: [],
  });
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const { data: ordersData } = useQuery({
    queryKey: ['returnable-orders'],
    queryFn: () => api.get('/orders', { status: 'DELIVERED', limit: 50 }),
  });

  const { data: orderData } = useQuery({
    queryKey: ['order-items', form.order_id],
    queryFn: () => api.get(`/orders/${form.order_id}`),
    enabled: !!form.order_id,
  });

  const orders = ordersData?.orders || ordersData?.data || [];
  const orderItems = orderData?.order?.items || orderData?.items || [];

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggleItem = (item) => {
    setForm((f) => {
      const exists = f.items.find((i) => i.product_id === item.product_id);
      if (exists) {
        return { ...f, items: f.items.filter((i) => i.product_id !== item.product_id) };
      }
      return { ...f, items: [...f.items, { product_id: item.product_id, quantity: item.quantity, product_name: item.product_name }] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.order_id || !form.reason || !form.description) {
      setError('Please fill all required fields.'); return;
    }
    setSubmitting(true); setError('');
    try {
      const formData = new FormData();
      formData.append('order_id', form.order_id);
      formData.append('reason', form.reason);
      formData.append('return_type', form.return_type);
      formData.append('description', form.description);
      if (form.items.length > 0) formData.append('items', JSON.stringify(form.items));
      images.forEach((img) => formData.append('images', img));
      await api.upload('/returns', formData);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to submit return request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div>
        <PageHeader title="Request Return" />
        <div className="max-w-lg mx-auto bg-white rounded-xl shadow-card p-8 text-center">
          <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text-primary mb-2">Return Request Submitted</h2>
          <p className="text-sm text-text-secondary mb-6">
            Your return request has been submitted. Our team will review it and contact you.
          </p>
          <button onClick={() => navigate('/returns')}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
            View My Returns
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link href="/returns">
        <a className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-6">
          <ChevronLeft className="w-4 h-4" /> Back to Returns
        </a>
      </Link>
      <PageHeader title="Request Return" subtitle="Submit a return request for a delivered order" />

      <div className="max-w-lg">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-card p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Order *</label>
            <select value={form.order_id} onChange={(e) => set('order_id', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
              <option value="">Select a delivered order</option>
              {orders.map((o) => <option key={o.id} value={o.id}>{o.order_number}</option>)}
            </select>
          </div>

          {form.order_id && orderItems.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Return Type</label>
              <div className="flex gap-3">
                {['FULL', 'PARTIAL'].map((t) => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="return_type" value={t} checked={form.return_type === t}
                      onChange={() => set('return_type', t)} />
                    <span className="text-sm text-text-secondary">{t === 'FULL' ? 'Full Return' : 'Partial Return'}</span>
                  </label>
                ))}
              </div>

              {form.return_type === 'PARTIAL' && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-text-muted mb-2">Select items to return:</p>
                  {orderItems.map((item) => (
                    <label key={item.product_id} className="flex items-center gap-3 p-2 rounded-lg border border-surface-200 cursor-pointer hover:bg-surface-50">
                      <input type="checkbox" checked={form.items.some((i) => i.product_id === item.product_id)}
                        onChange={() => toggleItem(item)} />
                      <span className="text-sm text-text-primary flex-1">{item.product_name}</span>
                      <span className="text-xs text-text-muted">Qty: {item.quantity}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Reason *</label>
            <select value={form.reason} onChange={(e) => set('reason', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
              <option value="">Select reason</option>
              {RETURN_REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Description *</label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              placeholder="Describe the issue in detail…" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Supporting Images (optional)
            </label>
            <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg border-2 border-dashed border-surface-200 hover:border-brand-300 hover:bg-brand-50 cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-text-muted flex-shrink-0" />
              <span className="text-sm text-text-secondary">
                {images.length > 0 ? `${images.length} file(s) selected` : 'Upload images of the issue (JPG, PNG)'}
              </span>
              <input type="file" accept=".jpg,.jpeg,.png" multiple
                onChange={(e) => setImages(Array.from(e.target.files || []))} className="hidden" />
            </label>
          </div>

          <button type="submit" disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
            {submitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
            {submitting ? 'Submitting…' : 'Submit Return Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
