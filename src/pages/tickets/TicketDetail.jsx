import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { api } from '../../utils/api';
import { formatDateTime } from '../../utils/format';
import StatusChip from '../../components/StatusChip';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ChevronLeft, Send, User, Users } from 'lucide-react';

export default function TicketDetail() {
  const [, params] = useRoute('/tickets/:id');
  const qc = useQueryClient();
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['ticket', params.id],
    queryFn: () => api.get(`/tickets/${params.id}`),
    enabled: !!params.id,
  });

  const ticket = data?.ticket || data;
  const messages = ticket?.messages || data?.messages || [];

  const sendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      await api.post(`/tickets/${params.id}/messages`, { message: reply });
      setReply('');
      refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (isLoading) return <LoadingSpinner fullPage />;
  if (!ticket) return <div className="text-center py-16 text-text-muted">Ticket not found.</div>;

  return (
    <div>
      <Link href="/tickets">
        <a className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-6">
          <ChevronLeft className="w-4 h-4" /> Back to Tickets
        </a>
      </Link>

      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-lg font-semibold text-text-primary">{ticket.ticket_number}</h1>
            <StatusChip status={ticket.status} />
          </div>
          <p className="text-sm text-text-muted">{ticket.category} · {ticket.priority} Priority</p>
        </div>
      </div>

      <div className="max-w-2xl">
        {/* Subject & Description */}
        <div className="bg-white rounded-xl shadow-card p-5 mb-4">
          <h2 className="font-semibold text-text-primary mb-2">{ticket.subject}</h2>
          <p className="text-sm text-text-secondary leading-relaxed">{ticket.description}</p>
          <p className="text-xs text-text-muted mt-3">{formatDateTime(ticket.created_at)}</p>
        </div>

        {/* Messages */}
        {messages.length > 0 && (
          <div className="space-y-3 mb-4">
            {messages.map((msg, idx) => {
              const isCustomer = msg.sender_type === 'CUSTOMER';
              return (
                <div key={idx} className={`flex gap-3 ${isCustomer ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isCustomer ? 'bg-brand-100' : 'bg-surface-100'}`}>
                    {isCustomer ? <User className="w-4 h-4 text-brand-600" /> : <Users className="w-4 h-4 text-text-muted" />}
                  </div>
                  <div className={`flex-1 max-w-sm ${isCustomer ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className={`px-4 py-3 rounded-xl text-sm ${isCustomer ? 'bg-brand-600 text-white' : 'bg-white shadow-card text-text-primary'}`}>
                      {msg.message}
                    </div>
                    <p className="text-xs text-text-muted mt-1">{formatDateTime(msg.created_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Reply box */}
        {!['RESOLVED', 'CLOSED'].includes(ticket.status) && (
          <div className="bg-white rounded-xl shadow-card p-4">
            <div className="flex gap-3">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
                placeholder="Type your reply…"
                className="flex-1 px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
              <button onClick={sendReply} disabled={sending || !reply.trim()}
                className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg transition-colors self-end">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
