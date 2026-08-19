'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Spinner from '@/components/ui/Spinner';
import PageHeader from '@/components/ui/PageHeader';

const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'closed'];

export default function AdminTicketDetailPage() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.get(`/support-tickets/admin/${ticketId}`, 'admin');
      setTicket(data);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleReply(e) {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      await api.post(`/support-tickets/admin/${ticketId}/reply`, { message }, 'admin');
      setMessage('');
      load();
    } finally {
      setSending(false);
    }
  }

  async function handleStatusChange(status) {
    await api.patch(`/support-tickets/admin/${ticketId}/status`, { status }, 'admin');
    load();
  }

  if (loading) return <Spinner />;
  if (!ticket) return <p className="text-sm text-red-600">Ticket not found</p>;

  return (
    <div>
      <PageHeader
        title={ticket.subject}
        description={ticket.userId?.fullName}
        actions={
          <>
            <Badge status={ticket.status}>{ticket.status}</Badge>
            <div className="w-40">
              <Select value={ticket.status} onChange={(e) => handleStatusChange(e.target.value)}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
          </>
        }
      />

      <Card className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Original Message</p>
        <p className="mt-2 text-sm text-slate-900">{ticket.description}</p>
      </Card>

      <div className="mb-6 space-y-3">
        {ticket.replies.map((reply, i) => (
          <div
            key={i}
            className={`rounded-2xl p-4 text-sm ${
              reply.isFromAdmin
                ? 'ml-8 border border-amber-200 bg-amber-50 text-slate-900'
                : 'mr-8 border border-slate-200 bg-slate-100 text-slate-900'
            }`}
          >
            <p>{reply.message}</p>
            <p className="mt-1.5 text-xs font-medium text-slate-400">{reply.isFromAdmin ? 'Admin' : 'User'}</p>
          </div>
        ))}
      </div>

      <Card>
        <form onSubmit={handleReply} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a reply..."
              rows={2}
            />
          </div>
          <Button type="submit" loading={sending}>
            Send
          </Button>
        </form>
      </Card>
    </div>
  );
}
