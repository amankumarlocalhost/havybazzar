'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { completePayment } from '@/lib/completePayment';
import { formatPaise } from '@/lib/money';
import { getSocket, joinAuctionRoom, leaveAuctionRoom } from '@/lib/socket';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import EmptyState from '@/components/ui/EmptyState';
import CountdownTimer from '@/components/listings/CountdownTimer';
import { ArrowRightIcon, GavelIcon, CheckCircleIcon } from '@/components/ui/Icons';

export default function AuctionPage() {
  const { auctionId } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [auction, setAuction] = useState(null);
  const [recentBids, setRecentBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [bidAmount, setBidAmount] = useState('');
  const [autoBidAmount, setAutoBidAmount] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [needsEmd, setNeedsEmd] = useState(false);

  const loadAuction = useCallback(async () => {
    try {
      const data = await api.get(`/auctions/${auctionId}`);
      setAuction(data.auction);
      setRecentBids(data.recentBids);
    } catch (err) {
      setError(err.message || 'Unable to load auction');
    } finally {
      setLoading(false);
    }
  }, [auctionId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard data-fetch-on-mount pattern
    loadAuction();
  }, [loadAuction]);

  // ---- Real-time updates ----
  useEffect(() => {
    const socket = getSocket();
    joinAuctionRoom(auctionId);

    function handleBidNew() {
      loadAuction(); // Simple and reliable — just reload the full auction detail.
    }
    function handleStarted() {
      loadAuction();
    }
    function handleClosed() {
      loadAuction();
    }

    socket.on('bid:new', handleBidNew);
    socket.on('auction:started', handleStarted);
    socket.on('auction:closed', handleClosed);

    return () => {
      leaveAuctionRoom(auctionId);
      socket.off('bid:new', handleBidNew);
      socket.off('auction:started', handleStarted);
      socket.off('auction:closed', handleClosed);
    };
  }, [auctionId, loadAuction]);

  async function handleJoinAndPayEmd() {
    if (!user) {
      router.push('/login');
      return;
    }
    setActionError('');
    setActionLoading(true);
    try {
      await completePayment({
        initiatePath: `/payments/emd/buyer/${auctionId}/initiate`,
        user,
      });
      setNeedsEmd(false);
    } catch (err) {
      setActionError(err.message || 'Unable to complete EMD payment');
    } finally {
      setActionLoading(false);
    }
  }

  async function handlePlaceBid(e) {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    setActionError('');
    setActionLoading(true);
    try {
      await api.post(`/auctions/${auctionId}/bid`, { amount: Number(bidAmount) }, 'user');
      setBidAmount('');
      loadAuction();
    } catch (err) {
      if (err.message?.includes('EMD')) setNeedsEmd(true);
      setActionError(err.message || 'Unable to place bid');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSetAutoBid(e) {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    setActionError('');
    setActionLoading(true);
    try {
      await api.post(`/auctions/${auctionId}/auto-bid`, { maxAmount: Number(autoBidAmount) }, 'user');
      setAutoBidAmount('');
      loadAuction();
    } catch (err) {
      if (err.message?.includes('EMD')) setNeedsEmd(true);
      setActionError(err.message || 'Unable to set auto-bid');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleFinalPayment() {
    setActionError('');
    setActionLoading(true);
    try {
      await completePayment({
        initiatePath: `/payments/final-payment/${auctionId}/initiate`,
        body: { acceptTerms: true },
        user,
      });
      router.push('/account');
    } catch (err) {
      setActionError(err.message || 'Unable to complete payment');
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <Spinner className="min-h-[70vh]" />;

  if (error || !auction) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState icon={GavelIcon} title={error || 'Auction not found'} description="It may have ended or is no longer available." />
      </div>
    );
  }

  const isLive = auction.status === 'live';
  const isClosed = auction.status === 'closed';
  const isWinner = isClosed && user && auction.winnerId?._id === user.id;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link
        href={`/listings/${auction.listingId?._id}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800"
      >
        <ArrowRightIcon className="h-4 w-4 rotate-180" />
        {auction.listingId?.title}
      </Link>

      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left: bid form + history */}
        <div className="md:col-span-2">
          <Card className="mb-4">
            <div className="mb-4 flex items-center justify-between">
              <Badge status={auction.status}>{auction.status}</Badge>
              {isLive && <CountdownTimer endTime={auction.endTime} onExpire={loadAuction} />}
            </div>

            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Current highest bid</p>
            <p className="mb-1 text-3xl font-bold tracking-tight text-slate-900">
              {auction.currentHighestBidPaise ? formatPaise(auction.currentHighestBidPaise) : 'No bids yet'}
            </p>
            <p className="mb-4 text-xs text-slate-500">{auction.totalBidsCount} bids so far</p>

            {isClosed && (
              <div className="mb-4 rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-700">{auction.closeReason}</p>
                {isWinner && (
                  <>
                    <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-brand-700">
                      <CheckCircleIcon className="h-4 w-4" />
                      Congratulations! You won — please complete the remaining payment.
                    </p>
                    <Button className="mt-3" onClick={handleFinalPayment} loading={actionLoading}>
                      Complete Final Payment
                    </Button>
                  </>
                )}
              </div>
            )}

            {isLive && (
              <>
                {needsEmd && (
                  <Alert tone="warning" className="mb-4">
                    <p>You need to pay the EMD before you can bid.</p>
                    <Button className="mt-2 w-full" onClick={handleJoinAndPayEmd} loading={actionLoading}>
                      Pay EMD and Join
                    </Button>
                  </Alert>
                )}

                <form onSubmit={handlePlaceBid} className="mb-3 flex gap-2">
                  <Input
                    type="number"
                    placeholder="Bid amount (₹)"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    required
                  />
                  <Button type="submit" loading={actionLoading}>
                    <GavelIcon className="h-4 w-4" />
                    Place Bid
                  </Button>
                </form>

                <form onSubmit={handleSetAutoBid} className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Max amount (auto-bid)"
                    value={autoBidAmount}
                    onChange={(e) => setAutoBidAmount(e.target.value)}
                    required
                  />
                  <Button type="submit" variant="secondary" loading={actionLoading}>
                    Set Auto-Bid
                  </Button>
                </form>

                {!needsEmd && (
                  <button
                    type="button"
                    onClick={handleJoinAndPayEmd}
                    className="mt-3 text-xs font-medium text-slate-500 hover:text-slate-700 hover:underline"
                  >
                    Haven&apos;t paid the EMD yet? Pay here
                  </button>
                )}

                {actionError && (
                  <Alert tone="error" className="mt-3">
                    {actionError}
                  </Alert>
                )}
              </>
            )}

            {!isLive && !isClosed && (
              <p className="text-sm text-slate-500">
                Auction has not started yet — it goes live on {new Date(auction.startTime).toLocaleString('en-IN')}.
              </p>
            )}
          </Card>
        </div>

        {/* Right: bid history */}
        <div>
          <Card>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Bid History</h3>
            {recentBids.length === 0 ? (
              <p className="text-xs text-slate-500">No bids yet</p>
            ) : (
              <ul className="space-y-2">
                {recentBids.map((bid) => (
                  <li key={bid._id} className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">
                      {bid.bidderId?.fullName || 'Bidder'}
                      {bid.isAutoBid && <span className="ml-1 text-slate-400">(auto)</span>}
                    </span>
                    <span className="font-semibold text-slate-900">{formatPaise(bid.amountPaise)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
