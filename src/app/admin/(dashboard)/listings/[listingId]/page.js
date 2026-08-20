'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatPaise } from '@/lib/money';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import MediaGallery from '@/components/listings/MediaGallery';
import { AlertTriangleIcon } from '@/components/ui/Icons';

function fmtDate(d) {
  return d ? new Date(d).toLocaleString('en-IN') : '—';
}

const SPEC_GROUPS = [
  {
    key: 'general',
    label: 'General',
    fields: [
      ['brand', 'Brand'],
      ['type', 'Type'],
      ['typeExtended', 'Full Type'],
      ['productionYear', 'Production Year'],
      ['hoursOnMeter', 'Hours on Meter'],
      ['totalWeightKg', 'Total Weight (kg)'],
      ['serialNumber', 'Serial Number'],
      ['referenceNumber', 'Reference Number'],
    ],
  },
  {
    key: 'engine',
    label: 'Engine',
    fields: [
      ['brand', 'Brand'],
      ['type', 'Type'],
      ['cylinderCount', 'Cylinder Count'],
    ],
  },
  {
    key: 'hydraulic',
    label: 'Hydraulic',
    fields: [
      ['systemType', 'System Type'],
      ['quickCouplerBrand', 'Quick Coupler Brand'],
      ['quickCouplerType', 'Quick Coupler Type'],
    ],
  },
  {
    key: 'cabin',
    label: 'Cabin',
    fields: [
      ['hasAirSuspensionSeat', 'Air Suspension Seat'],
      ['hasAirConditioning', 'Air Conditioning'],
    ],
  },
  {
    key: 'undercarriage',
    label: 'Undercarriage',
    fields: [
      ['shoesWidthMm', 'Shoes Width (mm)'],
      ['tracksWidthMm', 'Tracks Width (mm)'],
    ],
  },
];

export default function AdminListingDetailPage() {
  const { listingId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const result = await api.get(`/listings/admin/${listingId}`, 'admin');
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load listing');
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard data-fetch-on-mount pattern
    load();
  }, [load]);

  if (loading) return <Spinner />;

  if (error || !data) {
    return <EmptyState icon={AlertTriangleIcon} title="Could not load listing" description={error} />;
  }

  const { listing, order } = data;
  const auction = listing.auctionId;

  return (
    <div>
      <PageHeader
        title={listing.title}
        description={`${listing.categoryId?.name?.en || ''} — ${listing.listingType === 'auction' ? 'Auction' : 'Fixed Price'}`}
        actions={<Badge status={listing.status}>{listing.status}</Badge>}
      />

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="mb-4">
            <MediaGallery media={listing.media || []} />
          </Card>

          <Card className="mb-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Description</p>
            <p className="text-sm text-slate-700">{listing.description || '— no description provided'}</p>
          </Card>

          <Card>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Specifications</p>
            <div className="space-y-4">
              {SPEC_GROUPS.map((group) => {
                const values = listing.specifications?.[group.key] || {};
                const rows = group.fields.filter(([key]) => values[key] !== undefined && values[key] !== '');
                if (rows.length === 0) return null;
                return (
                  <div key={group.key}>
                    <p className="mb-1 text-xs font-medium text-slate-500">{group.label}</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
                      {rows.map(([key, label]) => (
                        <p key={key}>
                          <span className="text-slate-500">{label}: </span>
                          <span className="font-medium text-slate-800">
                            {typeof values[key] === 'boolean' ? (values[key] ? 'Yes' : 'No') : values[key]}
                          </span>
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}
              {SPEC_GROUPS.every(
                (g) => Object.keys(listing.specifications?.[g.key] || {}).length === 0
              ) && <p className="text-sm text-slate-400">No specifications provided.</p>}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Seller</p>
            <p className="text-sm font-semibold text-slate-900">{listing.sellerId?.fullName}</p>
            <p className="text-xs text-slate-500">{listing.sellerId?.email || listing.sellerId?.phone}</p>
            <p className="mt-1 text-xs text-slate-400">KYC: {listing.sellerId?.kycStatus}</p>
          </Card>

          <Card>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Basics</p>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-slate-500">Condition: </span>
                <span className="font-medium text-slate-800">{listing.condition || '—'}</span>
              </p>
              <p>
                <span className="text-slate-500">Location: </span>
                <span className="font-medium text-slate-800">
                  {[listing.location?.city, listing.location?.state].filter(Boolean).join(', ') || '—'}
                </span>
              </p>
              {listing.vehicleRegistrationNumber && (
                <p>
                  <span className="text-slate-500">Vehicle Reg. No: </span>
                  <span className="font-medium text-slate-800">{listing.vehicleRegistrationNumber}</span>
                </p>
              )}
            </div>
          </Card>

          <Card>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Pricing</p>
            {listing.listingType === 'fixed_price' ? (
              <div>
                <p className="text-lg font-bold text-slate-900">{formatPaise(listing.fixedPricePaise)}</p>
                <p className="mt-1 text-sm text-slate-600">
                  Units available: <span className="font-medium text-slate-800">{listing.quantityAvailable}</span> of{' '}
                  {listing.totalQuantity}
                </p>
              </div>
            ) : auction ? (
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-slate-500">Starting Bid: </span>
                  <span className="font-medium text-slate-800">{formatPaise(auction.startingBidPaise)}</span>
                </p>
                <p>
                  <span className="text-slate-500">Current Highest: </span>
                  <span className="font-medium text-slate-800">
                    {formatPaise(auction.currentHighestBidPaise || auction.startingBidPaise)}
                  </span>
                </p>
                <p>
                  <span className="text-slate-500">Reserve Price: </span>
                  <span className="font-medium text-slate-800">
                    {auction.reservePricePaise ? formatPaise(auction.reservePricePaise) : 'No reserve'}
                  </span>
                </p>
                <p>
                  <span className="text-slate-500">Status: </span>
                  <Badge status={auction.status}>{auction.status}</Badge>
                </p>
                {auction.closeReason && (
                  <p>
                    <span className="text-slate-500">Close Reason: </span>
                    <span className="font-medium text-slate-800">{auction.closeReason}</span>
                  </p>
                )}
                <Link href={`/admin/auctions/${auction._id}`}>
                  <Button variant="secondary" className="mt-2 w-full">
                    View Full Bid History
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Auction not yet created.</p>
            )}
          </Card>

          <Card>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Timeline</p>
            <div className="space-y-1.5 text-sm">
              <p>
                <span className="text-slate-500">Created: </span>
                {fmtDate(listing.createdAt)}
              </p>
              <p>
                <span className="text-slate-500">Submitted for Review: </span>
                {fmtDate(listing.submittedForReviewAt)}
              </p>
              {listing.status === 'rejected' ? (
                <>
                  <p>
                    <span className="text-slate-500">Rejected: </span>
                    {fmtDate(listing.rejectedAt)}
                  </p>
                  {listing.rejectionReason && (
                    <p className="text-red-600">Reason: {listing.rejectionReason}</p>
                  )}
                </>
              ) : (
                <p>
                  <span className="text-slate-500">Approved: </span>
                  {fmtDate(listing.approvedAt)}
                </p>
              )}
              {listing.reviewedByAdminId && (
                <p>
                  <span className="text-slate-500">Reviewed By: </span>
                  {listing.reviewedByAdminId.fullName}
                </p>
              )}
            </div>
          </Card>

          {order && (
            <Card>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Order (Sold)</p>
              <p className="text-sm">
                <span className="text-slate-500">Order #: </span>
                {order.orderNumber}
              </p>
              <p className="text-sm">
                <span className="text-slate-500">Buyer: </span>
                {order.buyerId?.fullName} ({order.buyerId?.email || order.buyerId?.phone})
              </p>
              <p className="text-sm">
                <span className="text-slate-500">Amount: </span>
                {formatPaise(order.totalAmountPaise)}
              </p>
              <p className="text-sm">
                <span className="text-slate-500">Status: </span>
                <Badge status={order.status}>{order.status}</Badge>
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
