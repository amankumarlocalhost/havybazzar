'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import { LifeBuoyIcon, PlusIcon } from '@/components/ui/Icons';

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const result = await api.get('/support-tickets/mine', 'user');
      setTickets(result);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard data-fetch-on-mount pattern
    load();
  }, [load]);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Support Tickets"
        description="Get help from the Heavy Bazar support team."
        actions={
          <Link href="/account/support/new">
            <Button>
              <PlusIcon className="h-4 w-4" />
              New Ticket
            </Button>
          </Link>
        }
      />

      {tickets.length === 0 ? (
        <EmptyState
          icon={LifeBuoyIcon}
          title="No tickets yet"
          description="Raise a support ticket if you need help with anything."
          action={
            <Link href="/account/support/new">
              <Button variant="secondary">Create your first ticket</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-2">
          {tickets.map((ticket) => (
            <Link key={ticket._id} href={`/account/support/${ticket._id}`}>
              <Card hover className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-900">{ticket.subject}</p>
                <Badge status={ticket.status}>{ticket.status}</Badge>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
