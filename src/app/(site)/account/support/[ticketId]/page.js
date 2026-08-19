'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import Spinner from '@/components/ui/Spinner';
import PageHeader from '@/components/ui/PageHeader';

export default function TicketDetailPage() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.get(`/support-tickets/${ticketId}`, 'user');
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
      await api.post(`/support-tickets/${ticketId}/reply`, { message }, 'user');
      setMessage('');
      load();
    } finally {
      setSending(false);
    }
  }

  if (loading) return <Spinner />;
  if (!ticket) return <p className="text-sm text-red-600">Ticket not found</p>;

  return (
    <div>
      <PageHeader title={ticket.subject} actions={<Badge status={ticket.status}>{ticket.status}</Badge>} />

      <Card className="mb-4">
        <p className="text-sm text-slate-900">{ticket.description}</p>
      </Card>

      <div className="mb-4 space-y-3">
        {ticket.replies.map((reply, i) => (
          <div
            key={i}
            className={`rounded-2xl p-3 text-sm ${
              reply.isFromAdmin ? 'mr-8 bg-amber-50 text-amber-900' : 'ml-8 bg-slate-100 text-slate-900'
            }`}
          >
            <p>{reply.message}</p>
            <p className="mt-1 text-xs text-slate-400">{reply.isFromAdmin ? 'Support Team' : 'You'}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleReply} className="flex items-end gap-2">
        <div className="flex-1">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a reply..."
            rows={2}
          />
        </div>
        <Button type="submit" loading={sending}>
          Send
        </Button>
      </form>
    </div>
  );
}
