import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import { ChevronLeft, CheckCircle } from 'lucide-react';

const CATEGORIES = [
  { value: 'ORDER', label: 'Order Issue' },
  { value: 'DELIVERY', label: 'Delivery Issue' },
  { value: 'PRODUCT', label: 'Product Quality' },
  { value: 'PAYMENT', label: 'Payment Issue' },
  { value: 'ACCOUNT_ISSUES', label: 'Account Issue' },
];

const PRIORITIES = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
];

export default function CreateTicket() {
  const [, navigate] = useLocation();
  const [form, setForm] = useState({
    subject: '',
    category: '',
    priority: 'MEDIUM',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.category || !form.message) {
      setError('Please fill all required fields.'); return;
    }
    if (form.subject.length < 5) {
      setError('Subject must be at least 5 characters long.'); return;
    }
    if (form.message.length < 10) {
      setError('Description must be at least 10 characters long.'); return;
    }
    setSubmitting(true); setError('');
    try {
      await api.post('/tickets', form);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to create ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div>
        <PageHeader title="New Ticket" />
        <div className="max-w-lg mx-auto bg-white rounded-xl shadow-card p-8 text-center">
          <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text-primary mb-2">Ticket Created!</h2>
          <p className="text-sm text-text-secondary mb-6">
            Your ticket has been created. Our team will respond as soon as possible.
          </p>
          <button onClick={() => navigate('/tickets')}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
            View My Tickets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link href="/tickets" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-6">
          <ChevronLeft className="w-4 h-4" /> Back to Tickets
        </Link>
      <PageHeader title="Raise Support Ticket" subtitle="Describe your issue and we'll help you resolve it" />

      <div className="max-w-lg">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Subject *</label>
            <input type="text" value={form.subject} onChange={(e) => set('subject', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Brief description of your issue" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Category *</label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Priority</label>
              <select value={form.priority} onChange={(e) => set('priority', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Description *</label>
            <textarea value={form.message} onChange={(e) => set('message', e.target.value)} rows={5} minLength={10}
              className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              placeholder="Please describe your issue in detail, including any order numbers, dates, or relevant information…" />
          </div>

          <button type="submit" disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
            {submitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
            {submitting ? 'Submitting…' : 'Submit Ticket'}
          </button>
        </form>
      </div>
    </div>
  );
}
