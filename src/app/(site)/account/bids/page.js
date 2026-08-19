'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatPaise } from '@/lib/money';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import { GavelIcon } from '@/components/ui/Icons';

const STATUS_LABELS = {
  active: 'You are leading',
  outbid: 'Outbid',
  won: 'Won',
  lost: 'Lost',
  pending: 'Auction not started',
};

export default function MyBidsPage() {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const result = await api.get('/auctions/mine/bids', 'user');
      setBids(result);
    } catch {
      setBids([]);
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
      <PageHeader title="My Bids" description="Track auctions you have bid on." />

      {bids.length === 0 ? (
        <EmptyState
          icon={GavelIcon}
          title="You haven't placed any bids yet"
          description="Browse live auctions and place a bid to see it here."
        />
      ) : (
        <div className="space-y-3">
          {bids.map(({ auction, myHighestBidPaise, status }) => (
            <Link key={auction._id} href={`/auctions/${auction._id}`}>
              <Card hover>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{auction.listingId?.title}</p>
                    <p className="mt-1 text-xs text-slate-500">Your highest bid: {formatPaise(myHighestBidPaise)}</p>
                  </div>
                  <Badge status={status}>{STATUS_LABELS[status] || status}</Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
