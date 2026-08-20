'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import PageHeader from '@/components/ui/PageHeader';
import Alert from '@/components/ui/Alert';
import FileUpload from '@/components/ui/FileUpload';

// Backend contract — src/routes/kyc.routes.js + src/validators/kyc.validator.js
// (heavy-bazar-backend): GET /kyc/me, POST /kyc/submit (multipart, max 5 files
// under "documents", docTypes as a single JSON-stringified array, in the same
// order as the files). DOC_TYPES below are exactly the three the backend allows.
const DOC_TYPES = [
  { value: 'government_id', label: 'Government ID' },
  { value: 'address_proof', label: 'Address Proof' },
  { value: 'business_registration', label: 'Business Registration' },
];

export default function KycPage() {
  const { user, refreshUser } = useAuth();

  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [businessName, setBusinessName] = useState('');
  const [businessRegistrationNumber, setBusinessRegistrationNumber] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [docType, setDocType] = useState(DOC_TYPES[0].value);
  const [pendingDocs, setPendingDocs] = useState([]); // { docType, file }
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get('/kyc/me', 'user');
      setKyc(data); // null until the user has submitted for the first time
    } catch (err) {
      setError(err.message || 'Unable to load KYC status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard data-fetch-on-mount pattern
    load();
  }, [load]);

  function handleAddDoc(files) {
    const file = files[0];
    if (!file) return;
    setPendingDocs((prev) => [...prev.filter((d) => d.docType !== docType), { docType, file }]);
  }

  function handleRemoveDoc(type) {
    setPendingDocs((prev) => prev.filter((d) => d.docType !== type));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (pendingDocs.length === 0) {
      setError('Please upload at least one document');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const formData = new FormData();
      if (businessName.trim()) formData.append('businessName', businessName.trim());
      if (businessRegistrationNumber.trim()) {
        formData.append('businessRegistrationNumber', businessRegistrationNumber.trim());
      }
      if (businessType.trim()) formData.append('businessType', businessType.trim());

      // docTypes is a single JSON-stringified array field, in the same order as the files.
      formData.append('docTypes', JSON.stringify(pendingDocs.map((d) => d.docType)));
      pendingDocs.forEach((doc) => formData.append('documents', doc.file));

      await api.postForm('/kyc/submit', formData, 'user');
      await load();
      await refreshUser?.();
      setPendingDocs([]);
    } catch (err) {
      setError(err.message || 'Unable to submit KYC');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Spinner />;

  const status = kyc?.status || user?.kycStatus || 'not_started';
  const canSubmit = ['not_started', 'pending', 'rejected'].includes(status);

  return (
    <div>
      <PageHeader title="KYC Verification" description="Verify your identity to unlock selling and bidding." />

      <div className="space-y-4">
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">KYC Status</p>
            <p className="mt-1 text-base font-semibold capitalize text-slate-900">{status.replace('_', ' ')}</p>
          </div>
          <Badge status={status}>{status.replace('_', ' ')}</Badge>
        </Card>

        {status === 'rejected' && kyc?.rejectionReason && (
          <Card className="border-red-200 bg-red-50">
            <p className="text-sm text-red-700">Rejection reason: {kyc.rejectionReason}</p>
          </Card>
        )}

        {status === 'verified' && (
          <Card>
            <p className="text-sm text-slate-600">
              Your KYC is verified — you can now add the seller role from the Profile tab.
            </p>
          </Card>
        )}

        {status === 'submitted' && (
          <Card>
            <p className="text-sm text-slate-600">
              Your documents are with the admin team for review — you&apos;ll hear back shortly.
            </p>
          </Card>
        )}

        {error && !canSubmit && <Alert tone="error">{error}</Alert>}

        {canSubmit && (
          <Card>
            <h2 className="mb-4 text-sm font-semibold text-slate-900">
              {status === 'rejected' ? 'Resubmit Documents' : 'Submit KYC Documents'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="businessName"
                label="Business Name (if applicable)"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
              <Input
                id="businessRegistrationNumber"
                label="Business Registration Number (if applicable)"
                value={businessRegistrationNumber}
                onChange={(e) => setBusinessRegistrationNumber(e.target.value)}
              />
              <Input
                id="businessType"
                label="Business Type (if applicable)"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Upload Document</label>
                <div className="mb-3">
                  <Select value={docType} onChange={(e) => setDocType(e.target.value)} className="sm:max-w-[220px]">
                    {DOC_TYPES.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <FileUpload
                  label="Click to upload a document"
                  hint="JPG, PNG, or PDF"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onFiles={handleAddDoc}
                />
              </div>

              {pendingDocs.length > 0 && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {pendingDocs.map((doc) => (
                    <div
                      key={doc.docType}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                    >
                      <span className="text-slate-700">{DOC_TYPES.find((d) => d.value === doc.docType)?.label}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDoc(doc.docType)}
                        className="font-medium text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {error && <Alert tone="error">{error}</Alert>}

              <Button type="submit" loading={submitting}>
                Submit
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
