'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { formatPaise } from '@/lib/money';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import { AlertTriangleIcon } from '@/components/ui/Icons';

export default function AdminAuctionDetailPage() {
  const { auctionId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      // Public endpoint (no admin-only data), admin token is fine as
      // an unused auth header here — same shape everyone gets.
      const result = await api.get(`/auctions/${auctionId}`);
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load auction');
    } finally {
      setLoading(false);
    }
  }, [auctionId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard data-fetch-on-mount pattern
    load();
  }, [load]);

  if (loading) return <Spinner />;

  if (error || !data) {
    return (
      <EmptyState icon={AlertTriangleIcon} title="Could not load auction" description={error} />
    );
  }

  const { auction, recentBids } = data;

  return (
    <div>
      <PageHeader
        title={auction.listingId?.title}
        description="Read-only view — admin cannot place bids."
        actions={<Badge status={auction.status}>{auction.status}</Badge>}
      />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current Highest Bid</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {formatPaise(auction.currentHighestBidPaise || auction.startingBidPaise)}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Starting Bid</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{formatPaise(auction.startingBidPaise)}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current Leader</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {auction.currentLeaderId?.fullName || '— no bids yet'}
          </p>
          {auction.currentLeaderId?.email && (
            <p className="text-xs text-slate-400">{auction.currentLeaderId.email}</p>
          )}
        </Card>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reserve Price</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {auction.reservePricePaise ? formatPaise(auction.reservePricePaise) : 'No reserve'}
          </p>
          {auction.reservePricePaise != null && auction.currentHighestBidPaise != null && (
            <p className="mt-1 text-xs text-slate-400">
              {auction.currentHighestBidPaise >= auction.reservePricePaise ? 'Reserve met' : 'Reserve not met yet'}
            </p>
          )}
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Min Bid Increment</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{formatPaise(auction.minIncrementPaise)}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Buyer EMD Amount</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{formatPaise(auction.emdAmountPaise)}</p>
        </Card>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Start Time</p>
          <p className="mt-1 text-sm text-slate-700">{new Date(auction.startTime).toLocaleString('en-IN')}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">End Time</p>
          <p className="mt-1 text-sm text-slate-700">{new Date(auction.endTime).toLocaleString('en-IN')}</p>
          {auction.originalEndTime && auction.originalEndTime !== auction.endTime && (
            <p className="mt-1 text-xs text-slate-400">
              Original: {new Date(auction.originalEndTime).toLocaleString('en-IN')}
            </p>
          )}
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Bids</p>
          <p className="mt-1 text-sm text-slate-700">{auction.totalBidsCount ?? 0}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Extensions</p>
          <p className="mt-1 text-sm text-slate-700">{auction.extensionCount ?? 0}</p>
        </Card>
      </div>

      {auction.status === 'closed' && (
        <Card className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Close Details</p>
          {auction.closedAt && (
            <p className="mt-1 text-sm text-slate-700">
              Closed at: {new Date(auction.closedAt).toLocaleString('en-IN')}
            </p>
          )}
          {auction.closeReason && <p className="mt-1 text-sm text-slate-700">Reason: {auction.closeReason}</p>}
          {auction.winnerId && (
            <p className="mt-1 text-sm text-slate-700">
              Winner: {auction.winnerId.fullName || auction.winnerId}
            </p>
          )}
          {auction.winningBidPaise != null && (
            <p className="mt-1 text-sm text-slate-700">Winning Bid: {formatPaise(auction.winningBidPaise)}</p>
          )}
        </Card>
      )}

      <Card>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Bid History ({recentBids.length})
        </p>
        {recentBids.length === 0 ? (
          <p className="text-sm text-slate-400">No bids placed yet.</p>
        ) : (
          <div className="space-y-2">
            {recentBids.map((bid) => (
              <div
                key={bid._id}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
              >
                <span className="font-medium text-slate-800">{bid.bidderId?.fullName || 'Unknown'}</span>
                <span className="font-bold text-slate-900">{formatPaise(bid.amountPaise)}</span>
                <span className="text-xs text-slate-400">{new Date(bid.createdAt).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
