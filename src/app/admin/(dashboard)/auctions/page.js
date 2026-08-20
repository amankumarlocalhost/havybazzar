'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatPaise } from '@/lib/money';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import { PackageIcon } from '@/components/ui/Icons';

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'live', label: 'Live' },
  { value: 'closed', label: 'Closed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function AdminAuctionsPage() {
  const [status, setStatus] = useState('all');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (status !== 'all') params.set('status', status);
      const result = await api.get(`/auctions/admin/all?${params.toString()}`, 'admin');
      setItems(result.items);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard data-fetch-on-mount pattern
    load();
  }, [load]);

  return (
    <div>
      <PageHeader title="Auctions" description="Monitor live and past auctions — bids, leaders, and status." />

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatus(tab.value)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              status === tab.value
                ? 'bg-amber-500 text-slate-900 shadow-sm shadow-amber-500/30'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && <Spinner />}

      {!loading && items.length === 0 && (
        <EmptyState
          icon={PackageIcon}
          title="No auctions found"
          description="There are no auctions in this status right now."
        />
      )}

      {!loading && items.length > 0 && (
        <div className="space-y-3">
          {items.map((auction) => (
            <Card key={auction._id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{auction.listingId?.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Seller: {auction.sellerId?.fullName} ({auction.sellerId?.email})
                  </p>
                  <p className="text-xs text-slate-500">
                    Current leader:{' '}
                    {auction.currentLeaderId
                      ? `${auction.currentLeaderId.fullName} (${auction.currentLeaderId.email})`
                      : '— no bids yet'}
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {formatPaise(auction.currentHighestBidPaise || auction.startingBidPaise)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={auction.status}>{auction.status}</Badge>
                  <Link href={`/admin/auctions/${auction._id}`}>
                    <Button variant="secondary">View Bids</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
