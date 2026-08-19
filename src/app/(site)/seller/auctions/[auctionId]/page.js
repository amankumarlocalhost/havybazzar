'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { formatPaise } from '@/lib/money';
import { getSocket, joinAuctionRoom, leaveAuctionRoom } from '@/lib/socket';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import PageHeader from '@/components/ui/PageHeader';
import CountdownTimer from '@/components/listings/CountdownTimer';
import { GavelIcon, RupeeIcon } from '@/components/ui/Icons';

export default function SellerAuctionMonitorPage() {
  const { auctionId } = useParams();
  const [auction, setAuction] = useState(null);
  const [recentBids, setRecentBids] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAuction = useCallback(async () => {
    try {
      const data = await api.get(`/auctions/${auctionId}`);
      setAuction(data.auction);
      setRecentBids(data.recentBids);
    } finally {
      setLoading(false);
    }
  }, [auctionId]);

  useEffect(() => {
    loadAuction();
  }, [loadAuction]);

  useEffect(() => {
    const socket = getSocket();
    joinAuctionRoom(auctionId);
    socket.on('bid:new', loadAuction);
    socket.on('auction:closed', loadAuction);
    return () => {
      leaveAuctionRoom(auctionId);
      socket.off('bid:new', loadAuction);
      socket.off('auction:closed', loadAuction);
    };
  }, [auctionId, loadAuction]);

  if (loading || !auction) return <Spinner />;

  return (
    <div>
      <PageHeader title="Auction Monitor" description={auction.listingId?.title} />

      <Card className="mb-4">
        <div className="mb-4 flex items-center justify-between">
          <Badge status={auction.status}>{auction.status}</Badge>
          {auction.status === 'live' && <CountdownTimer endTime={auction.endTime} onExpire={loadAuction} />}
        </div>

        <p className="flex items-center gap-1.5 text-xs text-slate-500">
          <RupeeIcon className="h-3.5 w-3.5" />
          Current highest bid
        </p>
        <p className="mb-2 text-3xl font-bold tracking-tight text-slate-900">
          {auction.currentHighestBidPaise ? formatPaise(auction.currentHighestBidPaise) : 'No bids yet'}
        </p>
        <p className="text-xs text-slate-500">{auction.totalBidsCount} bids so far</p>

        {auction.status === 'closed' && (
          <p className="mt-3 text-sm text-slate-700">{auction.closeReason}</p>
        )}
      </Card>

      <Card>
        <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <GavelIcon className="h-4 w-4 text-amber-500" />
          Bid Activity
        </h3>
        <p className="mb-3 text-xs text-slate-400">
          Bidder identities are hidden to prevent manipulation.
        </p>
        {recentBids.length === 0 ? (
          <p className="text-xs text-slate-500">No bids yet</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recentBids.map((bid) => (
              <li key={bid._id} className="flex items-center justify-between py-2.5 text-xs">
                <span className="text-slate-500">Bidder</span>
                <span className="font-semibold text-slate-900">{formatPaise(bid.amountPaise)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
