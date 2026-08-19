'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { completePayment } from '@/lib/completePayment';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import PageHeader from '@/components/ui/PageHeader';
import MediaGallery from '@/components/listings/MediaGallery';
import SpecTable from '@/components/listings/SpecTable';
import { AlertTriangleIcon, UploadIcon } from '@/components/ui/Icons';

export default function EditListingPage() {
  const { listingId } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [payingEmd, setPayingEmd] = useState(false);

  // NOTE: The backend does not yet have a direct "get one of my listings by id"
  // endpoint — only the list (getMyListings) exists. So we look it up from the
  // list instead. This works, but adding a dedicated GET /listings/mine/:id
  // endpoint would be better in the future.
  const loadListing = useCallback(async () => {
    try {
      const result = await api.get('/listings/mine?limit=50', 'user');
      const found = result.items.find((item) => item._id === listingId);
      if (!found) throw new Error('Listing not found');
      setListing(found);
    } catch (err) {
      setError(err.message || 'Unable to load listing');
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard data-fetch-on-mount pattern
    loadListing();
  }, [loadListing]);

  async function handleFileChange(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('media', file));
      await api.postForm(`/listings/${listingId}/media`, formData, 'user');
      await loadListing();
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = ''; // reset so the same file can be selected again
    }
  }

  async function handleSubmitForReview() {
    setSubmitting(true);
    setError('');
    try {
      const updated = await api.post(`/listings/${listingId}/submit`, {}, 'user');
      setListing(updated);
    } catch (err) {
      setError(err.message || 'Unable to submit');
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePaySellerEmd() {
    setPayingEmd(true);
    setError('');
    try {
      await completePayment({
        initiatePath: `/payments/emd/seller/${listingId}/initiate`,
        user,
      });
      await loadListing();
    } catch (err) {
      setError(err.message || 'Unable to complete EMD payment');
    } finally {
      setPayingEmd(false);
    }
  }

  if (loading) return <Spinner />;
  if (error && !listing) {
    return (
      <p className="flex items-center gap-1.5 text-sm text-red-600">
        <AlertTriangleIcon className="h-4 w-4 flex-shrink-0" />
        {error}
      </p>
    );
  }

  const canEditMedia = ['draft', 'rejected'].includes(listing.status);
  const canSubmit = canEditMedia && listing.media?.length > 0;
  const needsSellerEmd = listing.status === 'pending_payment';
  const hasSpecifications = listing.specifications && Object.keys(listing.specifications).length > 0;

  return (
    <div>
      <PageHeader
        title={listing.title}
        description={listing.listingType === 'auction' ? 'Auction' : 'Fixed Price'}
        actions={<Badge status={listing.status}>{listing.status}</Badge>}
      />

      {listing.status === 'rejected' && listing.rejectionReason && (
        <Card className="mb-4 border-red-200 bg-red-50">
          <p className="flex items-start gap-2 text-sm text-red-700">
            <AlertTriangleIcon className="mt-0.5 h-4 w-4 flex-shrink-0" />
            Rejection reason: {listing.rejectionReason}
          </p>
        </Card>
      )}

      {needsSellerEmd && (
        <Card className="mb-4 border-amber-200 bg-amber-50">
          <p className="mb-3 text-sm text-amber-800">
            You need to pay the seller EMD before the auction can be published.
          </p>
          <Button onClick={handlePaySellerEmd} loading={payingEmd}>
            Pay EMD
          </Button>
        </Card>
      )}

      <Card className="mb-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Photos and Videos</h2>

        <div className="mb-4">
          <MediaGallery media={listing.media || []} />
        </div>

        {canEditMedia && (
          <>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600">
              <UploadIcon className="h-4 w-4 text-slate-400" />
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
                onChange={handleFileChange}
                disabled={uploading}
                className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-amber-500 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-slate-900 hover:file:bg-amber-400 disabled:opacity-50"
              />
            </label>
            {uploading && <p className="mt-2 text-xs text-slate-500">Uploading...</p>}
          </>
        )}
      </Card>

      {hasSpecifications && (
        <Card className="mb-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Specifications</h2>
          <SpecTable specifications={listing.specifications} />
        </Card>
      )}

      {error && (
        <p className="mb-4 flex items-center gap-1.5 text-sm text-red-600">
          <AlertTriangleIcon className="h-4 w-4 flex-shrink-0" />
          {error}
        </p>
      )}

      {canSubmit && (
        <Button onClick={handleSubmitForReview} loading={submitting}>
          Submit for Review
        </Button>
      )}

      {listing.status === 'under_review' && (
        <p className="text-sm text-slate-500">Under review by admin — you&apos;ll hear back shortly.</p>
      )}

      {listing.status === 'active' && (
        <Button variant="secondary" onClick={() => router.push(`/listings/${listing.slug}`)}>
          View Live Listing
        </Button>
      )}
    </div>
  );
}
