import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../utils/api';
import { formatRelativeTime } from '../../utils/format';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle, CreditCard, Trash2 } from 'lucide-react';

const TYPE_ICONS = {
  ORDER: CheckCircle,
  PAYMENT: CreditCard,
  CREDIT: AlertTriangle,
  TICKET: Bell,
  GENERAL: Info,
};

const TYPE_COLORS = {
  ORDER: 'text-emerald-600 bg-emerald-50',
  PAYMENT: 'text-brand-600 bg-brand-50',
  CREDIT: 'text-amber-600 bg-amber-50',
  TICKET: 'text-purple-600 bg-purple-50',
  GENERAL: 'text-text-muted bg-surface-100',
};

export default function Notifications() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['all-notifications'],
    queryFn: () => api.get('/notifications', { limit: 50 }),
  });

  const notifications = data?.notifications || data?.data || [];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read', {});
      qc.invalidateQueries(['all-notifications']);
      qc.invalidateQueries(['my-notifications']);
    } catch {}
  };

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`, {});
      qc.invalidateQueries(['all-notifications']);
      qc.invalidateQueries(['my-notifications']);
    } catch {}
  };

  const deleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      qc.invalidateQueries(['all-notifications']);
      qc.invalidateQueries(['my-notifications']);
    } catch {}
  };

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        action={
          unreadCount > 0 ? (
            <button onClick={markAllRead}
              className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium">
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
          ) : null
        }
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up! Notifications will appear here." />
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const Icon = TYPE_ICONS[notif.type] || TYPE_ICONS.GENERAL;
            const iconColor = TYPE_COLORS[notif.type] || TYPE_COLORS.GENERAL;
            return (
              <div
                key={notif.id}
                onClick={() => !notif.is_read && markRead(notif.id)}
                className={`flex gap-4 p-4 rounded-xl transition-colors cursor-pointer group relative
                  ${notif.is_read ? 'bg-white shadow-card' : 'bg-brand-50 border border-brand-100 shadow-card'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 pr-8">
                  {notif.title && (
                    <p className={`text-sm font-semibold mb-0.5 ${notif.is_read ? 'text-text-primary' : 'text-brand-900'}`}>
                      {notif.title}
                    </p>
                  )}
                  <p className={`text-sm ${notif.is_read ? 'text-text-secondary' : 'text-brand-800'}`}>
                    {notif.body}
                  </p>
                  <p className="text-xs text-text-muted mt-1">{formatRelativeTime(notif.created_at)}</p>
                </div>
                {!notif.is_read && (
                  <div className="w-2 h-2 bg-brand-500 rounded-full flex-shrink-0 mt-2" />
                )}
                <button
                  onClick={(e) => deleteNotification(e, notif.id)}
                  className="absolute top-4 right-4 p-1.5 text-surface-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete Notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
