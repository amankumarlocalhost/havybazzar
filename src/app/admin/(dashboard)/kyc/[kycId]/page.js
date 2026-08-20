'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import { FileTextIcon, AlertTriangleIcon } from '@/components/ui/Icons';

export default function AdminKycDetailPage() {
  const { kycId } = useParams();
  const router = useRouter();

  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.get(`/kyc/admin/${kycId}`, 'admin');
      setKyc(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [kycId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard data-fetch-on-mount pattern
    load();
  }, [load]);

  async function handleReview(action) {
    if (action === 'reject' && !reason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }
    setError('');
    setActing(true);
    try {
      await api.post(`/kyc/admin/${kycId}/review`, { action, reason }, 'admin');
      router.push('/admin/kyc');
    } catch (err) {
      setError(err.message);
    } finally {
      setActing(false);
    }
  }

  if (loading) return <Spinner />;

  if (!kyc) {
    return (
      <EmptyState
        icon={AlertTriangleIcon}
        title="KYC record not found"
        description={error || 'This KYC request could not be loaded.'}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title={kyc.userId?.fullName}
        description={kyc.userId?.email || kyc.userId?.phone}
        actions={<Badge status={kyc.status} />}
      />

      {kyc.businessName && (
        <Card className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Business Details</p>
          <p className="mt-1 text-sm font-medium text-slate-900">{kyc.businessName}</p>
          {kyc.businessRegistrationNumber && (
            <p className="text-xs text-slate-500">Reg. No: {kyc.businessRegistrationNumber}</p>
          )}
        </Card>
      )}

      <Card className="mb-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Documents</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {kyc.documents.map((doc) => (
            <a
              key={doc.fileKey}
              href={doc.viewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-24 flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-600 transition-colors hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700"
            >
              <FileTextIcon className="h-5 w-5" />
              {doc.docType.replace('_', ' ')}
            </a>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Document links are valid for 10 minutes (for security purposes).
        </p>
      </Card>

      {kyc.status === 'submitted' ? (
        <Card>
          <Textarea
            label="Reason for rejection (not required for verification)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className="mb-3"
          />

          {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <Button onClick={() => handleReview('verify')} loading={acting}>
              Verify
            </Button>
            <Button variant="danger" onClick={() => handleReview('reject')} loading={acting}>
              Reject
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <p className="text-sm font-medium text-slate-900">
            This KYC has already been {kyc.status === 'verified' ? 'verified' : kyc.status}.
          </p>
          {kyc.status === 'rejected' && kyc.rejectionReason && (
            <p className="mt-1 text-sm text-slate-500">Reason: {kyc.rejectionReason}</p>
          )}
        </Card>
      )}
    </div>
  );
}
