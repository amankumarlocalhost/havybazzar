'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import { BellIcon } from '@/components/ui/Icons';

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const result = await api.get('/notifications/mine', 'user');
      setItems(result.items);
      setUnreadCount(result.unreadCount);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard data-fetch-on-mount pattern
    load();
  }, [load]);

  async function handleMarkRead(id) {
    await api.patch(`/notifications/${id}/read`, {}, 'user');
    load();
  }

  async function handleMarkAllRead() {
    await api.patch('/notifications/read-all', {}, 'user');
    load();
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Updates on your bids, orders, and account."
        actions={
          unreadCount > 0 ? (
            <Button variant="secondary" onClick={handleMarkAllRead}>
              Mark All Read
            </Button>
          ) : undefined
        }
      />

      {unreadCount > 0 && <p className="mb-4 -mt-2 text-xs text-slate-500">{unreadCount} unread</p>}

      {items.length === 0 ? (
        <EmptyState icon={BellIcon} title="No notifications yet" description="You're all caught up." />
      ) : (
        <div className="space-y-2">
          {items.map((n) =>
            n.isRead ? (
              <Card key={n._id} className="bg-white">
                <NotificationBody notification={n} />
              </Card>
            ) : (
              <Card
                key={n._id}
                as="button"
                interactive
                className="bg-amber-50/60 ring-1 ring-amber-100"
                onClick={() => handleMarkRead(n._id)}
              >
                <NotificationBody notification={n} />
              </Card>
            )
          )}
        </div>
      )}
    </div>
  );
}

function NotificationBody({ notification }) {
  return (
    <>
      <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
      <p className="mt-1 text-xs text-slate-600">{notification.message}</p>
      <p className="mt-1 text-xs text-slate-400">
        {new Date(notification.createdAt).toLocaleString('en-IN')}
      </p>
    </>
  );
}
