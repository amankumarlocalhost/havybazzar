'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { completePayment } from '@/lib/completePayment';
import { formatPaise } from '@/lib/money';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import MediaGallery from '@/components/listings/MediaGallery';
import SpecTable from '@/components/listings/SpecTable';
import ListingCard from '@/components/listings/ListingCard';
import { MapPinIcon, HeartIcon, GavelIcon } from '@/components/ui/Icons';

export default function ListingDetailPage() {
  const { slugOrId } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get(`/listings/detail/${slugOrId}`);
        setListing(data);
        // Related listings need listing._id, so load them after the detail resolves.
        const relatedData = await api.get(`/listings/${data._id}/related`);
        setRelated(relatedData);
      } catch (err) {
        setError(err.message || 'Unable to load listing');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slugOrId]);

  async function handleToggleWishlist() {
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      const result = await api.post(`/listings/${listing._id}/wishlist`, {}, 'user');
      setWishlisted(result.added);
    } catch {
      // If this fails, the UI should not break.
    }
  }

  async function handleBuyNow() {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!acceptTerms) {
      setBuyError('You must accept the Terms & Conditions');
      return;
    }

    setBuyError('');
    setBuying(true);
    try {
      await completePayment({
        initiatePath: `/payments/purchase/${listing._id}/initiate`,
        body: { acceptTerms: true },
        user,
      });
      router.push('/account'); // Order created — Orders section is not yet on the account page, coming in Phase 2.
    } catch (err) {
      setBuyError(err.message || 'Unable to complete payment');
    } finally {
      setBuying(false);
    }
  }

  if (loading) return <Spinner className="min-h-[70vh]" />;

  if (error || !listing) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-sm text-red-600">{error || 'Listing not found'}</p>
        <Link href="/listings" className="mt-4 inline-block text-sm font-medium text-amber-600 hover:text-amber-700">
          Browse other listings
        </Link>
      </div>
    );
  }

  const isAuction = listing.listingType === 'auction';

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Left: media + specs */}
        <div className="lg:col-span-3">
          <MediaGallery media={listing.media} />

          <Card className="mt-6">
            <h2 className="mb-2 text-sm font-semibold text-slate-900">Description</h2>
            <p className="text-sm leading-relaxed text-slate-600">
              {listing.description || 'No description available.'}
            </p>
          </Card>

          <div className="mt-6">
            <SpecTable specifications={listing.specifications} />
          </div>
        </div>

        {/* Right: price, actions */}
        <div className="lg:col-span-2">
          <Card className="lg:sticky lg:top-20">
            <div className="mb-2 flex items-start justify-between gap-3">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">{listing.title}</h1>
              <Badge status={isAuction ? 'live' : 'active'}>{isAuction ? 'Auction' : 'Fixed Price'}</Badge>
            </div>

            {listing.location?.state && (
              <p className="mb-4 flex items-center gap-1.5 text-sm text-slate-500">
                <MapPinIcon className="h-4 w-4" />
                {listing.location.state}
              </p>
            )}

            <div className="my-4 border-t border-slate-100" />

            {isAuction ? (
              <>
                <p className="mb-4 text-sm text-slate-600">
                  This equipment is up for auction — visit the live bidding page to place a bid.
                </p>
                <Link href={`/auctions/${listing.auctionId}`}>
                  <Button className="w-full" size="lg">
                    <GavelIcon className="h-4 w-4" />
                    View Auction and Bid
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <p className="mb-4 text-3xl font-bold tracking-tight text-slate-900">
                  {formatPaise(listing.fixedPricePaise)}
                </p>

                <label className="mb-4 flex items-start gap-2 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500/30"
                  />
                  I have read and accept the Terms & Conditions
                </label>

                {buyError && <p className="mb-3 text-xs text-red-600">{buyError}</p>}

                <Button className="w-full" size="lg" onClick={handleBuyNow} loading={buying}>
                  Buy Now
                </Button>
              </>
            )}

            <Button variant="secondary" className="mt-3 w-full" onClick={handleToggleWishlist}>
              <HeartIcon className={`h-4 w-4 ${wishlisted ? 'fill-current text-red-500' : ''}`} />
              {wishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
            </Button>
          </Card>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-bold tracking-tight text-slate-900">Similar Equipment</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4">
            {related.map((item) => (
              <ListingCard key={item._id} listing={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
