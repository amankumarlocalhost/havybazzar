'use client';

/**
 * Admin -> Orders -> View details
 * ---------------------------------------------------------------------------
 * Ek order ka POORA record ek jagah: product kya bika, buyer/seller kaun,
 * kahan ship hona hai, aur sabse important — PAYMENT: Razorpay ke saare
 * records (EMD, purchase, final payment) plus wallet ledger entries
 * (commission, seller payout). Data ek hi call se aata hai:
 * GET /orders/admin/:orderId
 * ---------------------------------------------------------------------------
 */

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatPaise } from '@/lib/money';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import { AlertTriangleIcon } from '@/components/ui/Icons';

const STATUS_OPTIONS = ['processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

const PURPOSE_LABEL = {
  buyer_emd: 'Buyer EMD',
  seller_emd: 'Seller EMD',
  fixed_price_purchase: 'Fixed price purchase',
  auction_final_payment: 'Auction final payment',
};

const LEDGER_LABEL = {
  emd_held: 'EMD held',
  emd_released: 'EMD released',
  emd_adjusted: 'EMD adjusted in price',
  emd_forfeited: 'EMD forfeited',
  coin_credit: 'Coins credited',
  coin_debit: 'Coins used',
  sale_credit: 'Sale amount credited to seller',
  commission_debit: 'Platform commission',
};

function cloudinaryUrl(fileKey) {
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${fileKey}`;
}

function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

/** Label + value ki ek line — poore page me yahi pattern repeat hota hai */
function Field({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm text-slate-800">{value ?? '—'}</p>
    </div>
  );
}

function SectionCard({ title, subtitle, children, className = '' }) {
  return (
    <Card className={`mb-4 ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
      <div className="mt-3">{children}</div>
    </Card>
  );
}

export default function AdminOrderDetailPage() {
  const { orderId } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await api.get(`/orders/admin/${orderId}`, 'admin');
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard data-fetch-on-mount pattern
    load();
  }, [load]);

  async function handleStatusChange(newStatus) {
    setUpdating(true);
    try {
      await api.patch(`/orders/admin/${orderId}/status`, { status: newStatus }, 'admin');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <Spinner />;

  if (!data) {
    return (
      <EmptyState
        icon={AlertTriangleIcon}
        title="Order not found"
        description={error || 'This order could not be loaded.'}
      />
    );
  }

  const { order, auction, payments, ledger, paymentSummary } = data;
  const listing = order.listingId;
  const buyer = order.buyerId;
  const seller = order.sellerId;
  const coverImage = listing?.media?.find((m) => m.type === 'image') || listing?.media?.[0];

  return (
    <div>
      <Link
        href="/admin/orders"
        className="mb-3 inline-block text-xs font-semibold text-slate-500 hover:text-slate-800"
      >
        ← Back to orders
      </Link>

      <PageHeader
        title={`Order #${order.orderNumber}`}
        description={`${order.orderType === 'auction_win' ? 'Auction win' : 'Fixed price'} · placed ${formatDateTime(
          order.createdAt
        )}`}
        actions={<Badge status={order.status}>{order.status}</Badge>}
      />

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {/* ---- Paisa sabse upar: admin ko yahi sabse pehle chahiye ---- */}
      <SectionCard
        title="Payment summary"
        subtitle="Buyer ne kitna diya, platform ne kitna rakha, seller ko kitna gaya"
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <Field label="Order total" value={formatPaise(paymentSummary.totalAmountPaise)} />
          <Field label="Collected from buyer" value={formatPaise(paymentSummary.paidByBuyerPaise)} />
          <Field label="EMD adjusted" value={formatPaise(paymentSummary.emdAdjustedPaise)} />
          <Field label="Platform commission" value={formatPaise(paymentSummary.commissionPaise)} />
          <Field label="Seller payout" value={formatPaise(paymentSummary.sellerPayoutPaise)} />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge status={paymentSummary.isFullyPaid ? 'paid' : 'pending'}>
            {paymentSummary.isFullyPaid ? 'Fully paid' : 'Payment incomplete'}
          </Badge>
          {paymentSummary.hasExcessPayment && (
            <Badge status="failed">Extra payment — duplicate/refund check karein</Badge>
          )}
          <span className="text-xs text-slate-500">Terms accepted: {formatDateTime(order.termsAcceptedAt)}</span>
          {order.invoiceNumber && (
            <span className="text-xs text-slate-500">
              · Invoice {order.invoiceNumber} ({formatDateTime(order.invoiceGeneratedAt)})
            </span>
          )}
        </div>
      </SectionCard>

      {/* ---- Razorpay records ---- */}
      <SectionCard
        title="Payment transactions"
        subtitle="Is listing/auction se jude saare Razorpay records — EMD, purchase, final payment"
      >
        {payments.length === 0 ? (
          <p className="text-sm text-slate-500">Is order ke liye koi payment record nahi mila.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="pb-2 pr-4 font-semibold">Purpose</th>
                  <th className="pb-2 pr-4 font-semibold">Paid by</th>
                  <th className="pb-2 pr-4 font-semibold">Amount</th>
                  <th className="pb-2 pr-4 font-semibold">Status</th>
                  <th className="pb-2 pr-4 font-semibold">Razorpay IDs</th>
                  <th className="pb-2 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p._id} className="align-top">
                    <td className="py-2.5 pr-4 font-medium text-slate-800">
                      {PURPOSE_LABEL[p.purpose] || p.purpose}
                    </td>
                    <td className="py-2.5 pr-4 text-slate-600">
                      {p.userId?.fullName}
                      <span className="block text-slate-400">{p.userId?.email || p.userId?.phone}</span>
                    </td>
                    <td className="py-2.5 pr-4 font-semibold text-slate-900">{formatPaise(p.amountPaise)}</td>
                    <td className="py-2.5 pr-4">
                      <Badge status={p.status}>{p.status}</Badge>
                      {p.failureReason && <span className="mt-1 block text-red-600">{p.failureReason}</span>}
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-[11px] text-slate-500">
                      {p.razorpayOrderId}
                      <span className="block">{p.razorpayPaymentId || '—'}</span>
                    </td>
                    <td className="py-2.5 text-slate-500">{formatDateTime(p.paidAt || p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* ---- Wallet ledger ---- */}
      <SectionCard title="Wallet ledger" subtitle="EMD, commission aur seller payout ki append-only entries">
        {ledger.length === 0 ? (
          <p className="text-sm text-slate-500">Is order ke liye koi ledger entry nahi bani.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="pb-2 pr-4 font-semibold">Entry</th>
                  <th className="pb-2 pr-4 font-semibold">User</th>
                  <th className="pb-2 pr-4 font-semibold">Direction</th>
                  <th className="pb-2 pr-4 font-semibold">Amount</th>
                  <th className="pb-2 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ledger.map((t) => (
                  <tr key={t._id}>
                    <td className="py-2.5 pr-4 font-medium text-slate-800">
                      {LEDGER_LABEL[t.type] || t.type}
                      {t.description && <span className="block text-slate-400">{t.description}</span>}
                    </td>
                    <td className="py-2.5 pr-4 text-slate-600">{t.userId?.fullName}</td>
                    <td className="py-2.5 pr-4">
                      <span className={t.direction === 'credit' ? 'text-brand-700' : 'text-red-600'}>
                        {t.direction === 'credit' ? 'Credit' : 'Debit'}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 font-semibold text-slate-900">{formatPaise(t.amountPaise)}</td>
                    <td className="py-2.5 text-slate-500">{formatDateTime(t.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* ---- Product ---- */}
      <SectionCard title="Product">
        <div className="flex flex-col gap-4 sm:flex-row">
          {coverImage?.fileKey && (
            // eslint-disable-next-line @next/next/no-img-element -- Cloudinary URL, admin-only screen
            <img
              src={cloudinaryUrl(coverImage.fileKey)}
              alt={listing?.title || ''}
              className="h-32 w-44 flex-shrink-0 rounded-xl object-cover"
            />
          )}
          <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-3">
            <Field label="Title" value={listing?.title} />
            <Field label="Listing type" value={listing?.listingType} />
            <Field label="Listing status" value={listing?.status} />
            <Field label="Brand" value={listing?.specifications?.general?.brand} />
            <Field label="Production year" value={listing?.specifications?.general?.productionYear} />
            <Field label="Hours on meter" value={listing?.specifications?.general?.hoursOnMeter} />
            <Field
              label="Location"
              value={
                listing?.location ? [listing.location.city, listing.location.state].filter(Boolean).join(', ') : null
              }
            />
            <Field label="Listing ID" value={<span className="font-mono text-[11px]">{listing?._id}</span>} />
          </div>
        </div>
      </SectionCard>

      {/* ---- Buyer / Seller ---- */}
      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Buyer</p>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <Field label="Name" value={buyer?.fullName} />
            <Field label="Email" value={buyer?.email} />
            <Field label="Phone" value={buyer?.phone} />
            <Field label="KYC" value={buyer?.kycStatus} />
            <Field label="Account status" value={buyer?.status} />
            <Field label="Joined" value={formatDateTime(buyer?.createdAt)} />
          </div>
          {buyer?._id && (
            <Link
              href={`/admin/users/${buyer._id}`}
              className="mt-3 inline-block text-xs font-semibold text-brand-700 hover:underline"
            >
              Open buyer profile →
            </Link>
          )}
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Seller</p>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <Field label="Name" value={seller?.fullName} />
            <Field label="Email" value={seller?.email} />
            <Field label="Phone" value={seller?.phone} />
            <Field label="KYC" value={seller?.kycStatus} />
            <Field label="Account status" value={seller?.status} />
            <Field label="Joined" value={formatDateTime(seller?.createdAt)} />
          </div>
          {seller?._id && (
            <Link
              href={`/admin/users/${seller._id}`}
              className="mt-3 inline-block text-xs font-semibold text-brand-700 hover:underline"
            >
              Open seller profile →
            </Link>
          )}
        </Card>
      </div>

      {/* ---- Auction (sirf auction listings ke liye) ---- */}
      {auction && (
        <SectionCard title="Auction" subtitle="Is listing ka auction record">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field label="Status" value={auction.status} />
            <Field label="Starting bid" value={formatPaise(auction.startingBidPaise)} />
            <Field label="Winning bid" value={formatPaise(auction.winningBidPaise)} />
            <Field label="EMD amount" value={formatPaise(auction.emdAmountPaise)} />
            <Field label="Total bids" value={auction.totalBidsCount} />
            <Field label="Start" value={formatDateTime(auction.startTime)} />
            <Field label="End" value={formatDateTime(auction.endTime)} />
          </div>
        </SectionCard>
      )}

      {/* ---- Shipping + status change ---- */}
      <SectionCard title="Shipping & delivery">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="text-sm text-slate-800">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Ship to</p>
            {order.shippingAddress ? (
              <p className="mt-0.5">
                {order.shippingAddress.line1}
                {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}
                <br />
                {order.shippingAddress.country}
              </p>
            ) : (
              <p className="mt-0.5">—</p>
            )}
          </div>

          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Update status</p>
            <Select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updating}
              className="w-44"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
