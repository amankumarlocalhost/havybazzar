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
import Alert from '@/components/ui/Alert';
import Checkbox from '@/components/ui/Checkbox';
import EmptyState from '@/components/ui/EmptyState';
import Tabs from '@/components/ui/Tabs';
import MediaGallery from '@/components/listings/MediaGallery';
import SpecTable from '@/components/listings/SpecTable';
import ListingCard from '@/components/listings/ListingCard';
import { MapPinIcon, HeartIcon, GavelIcon, InboxIcon } from '@/components/ui/Icons';

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
  const [activeTab, setActiveTab] = useState('description');

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
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          icon={InboxIcon}
          title={error || 'Listing not found'}
          description="It may have been removed or is no longer available."
          action={
            <Link href="/listings">
              <Button variant="secondary">Browse other listings</Button>
            </Link>
          }
        />
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

          <div className="mt-6">
            <Tabs
              items={[
                { value: 'description', label: 'Description' },
                { value: 'specifications', label: 'Specifications' },
              ]}
              value={activeTab}
              onChange={setActiveTab}
              className="mb-4 max-w-xs"
            />

            {activeTab === 'description' ? (
              <Card>
                <p className="text-sm leading-relaxed text-slate-600">
                  {listing.description || 'No description available.'}
                </p>
              </Card>
            ) : (
              <SpecTable specifications={listing.specifications} />
            )}
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
                <div className="mb-4">
                  <p className="text-3xl font-bold tracking-tight text-slate-900">
                    {formatPaise(listing.fixedPricePaise)}
                  </p>
                  {listing.totalQuantity > 1 && (
                    <p className="mt-1 text-sm text-slate-500">
                      {listing.quantityAvailable} of {listing.totalQuantity} units available
                    </p>
                  )}
                </div>

                <Checkbox
                  className="mb-4"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  label="I have read and accept the Terms & Conditions"
                />

                {buyError && (
                  <Alert tone="error" className="mb-3">
                    {buyError}
                  </Alert>
                )}

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
