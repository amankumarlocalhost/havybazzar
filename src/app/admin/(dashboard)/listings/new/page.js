'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Radio from '@/components/ui/Radio';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import FileUpload from '@/components/ui/FileUpload';
import PageHeader from '@/components/ui/PageHeader';

const CURRENT_YEAR = new Date().getFullYear();

export default function AdminNewListingPage() {
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [sellerSearch, setSellerSearch] = useState('');
  const [sellerResults, setSellerResults] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [sellerLoading, setSellerLoading] = useState(false);

  const [media, setMedia] = useState([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    condition: 'good',
    state: '',
    listingType: 'fixed_price',
    fixedPrice: '',
    quantity: '1',
    startingBid: '',
    minBidIncrement: '',
    reservePrice: '',
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
    api
      .get('/categories')
      .then((data) => {
        const flat = [];
        data.forEach((cat) => {
          flat.push(cat);
          (cat.children || []).forEach((child) => flat.push(child));
        });
        setCategories(flat);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!sellerSearch.trim()) {
      setSellerResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setSellerLoading(true);
      try {
        const params = new URLSearchParams({ search: sellerSearch, role: 'seller', limit: '10' });
        const result = await api.get(`/admin/users?${params.toString()}`, 'admin');
        setSellerResults(result.items);
      } catch {
        setSellerResults([]);
      } finally {
        setSellerLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [sellerSearch]);

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleAddMedia(files) {
    setMedia((prev) => [...prev, ...files]);
  }

  function handleRemoveMedia(index) {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedSeller) {
      setError('Please select a seller for this listing');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const data = {
        sellerId: selectedSeller._id,
        title: form.title,
        description: form.description,
        categoryId: form.categoryId,
        condition: form.condition,
        location: { state: form.state },
        listingType: form.listingType,
      };

      if (form.listingType === 'fixed_price') {
        data.fixedPrice = Number(form.fixedPrice);
        data.quantity = Number(form.quantity) || 1;
      } else {
        data.auctionConfig = {
          startingBid: Number(form.startingBid),
          minBidIncrement: Number(form.minBidIncrement),
          ...(form.reservePrice ? { reservePrice: Number(form.reservePrice) } : {}),
          startTime: new Date(form.startTime).toISOString(),
          endTime: new Date(form.endTime).toISOString(),
        };
      }

      const formData = new FormData();
      formData.append('data', JSON.stringify(data));
      media.forEach((file) => formData.append('media', file));

      await api.postForm('/listings/admin', formData, 'admin');
      router.push('/admin/listings');
    } catch (err) {
      setError(err.message || 'Error creating listing');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Post Equipment (Admin)"
        description="Create and publish a listing directly on behalf of a seller — fixed price or auction, goes live immediately."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Seller</h2>

          {selectedSeller ? (
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <div>
                <p className="text-sm font-medium text-slate-900">{selectedSeller.fullName}</p>
                <p className="text-xs text-slate-500">{selectedSeller.email || selectedSeller.phone}</p>
              </div>
              <Button type="button" variant="ghost" onClick={() => setSelectedSeller(null)}>
                Change
              </Button>
            </div>
          ) : (
            <div>
              <Input
                placeholder="Search seller by name, email or phone"
                value={sellerSearch}
                onChange={(e) => setSellerSearch(e.target.value)}
              />
              {sellerLoading && <p className="mt-2 text-xs text-slate-400">Searching...</p>}
              {!sellerLoading && sellerResults.length > 0 && (
                <div className="mt-2 space-y-1">
                  {sellerResults.map((s) => (
                    <button
                      type="button"
                      key={s._id}
                      onClick={() => {
                        setSelectedSeller(s);
                        setSellerSearch('');
                        setSellerResults([]);
                      }}
                      className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-left text-sm hover:border-brand-300 hover:bg-brand-50/40"
                    >
                      <span>
                        {s.fullName} — <span className="text-slate-400">{s.email || s.phone}</span>
                      </span>
                      <span className="text-xs text-slate-400">KYC: {s.kycStatus}</span>
                    </button>
                  ))}
                </div>
              )}
              {!sellerLoading && sellerSearch.trim() && sellerResults.length === 0 && (
                <p className="mt-2 text-xs text-slate-400">
                  No matching seller with verified KYC found.
                </p>
              )}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Basic Details</h2>
          <div className="space-y-4">
            <Input
              label="Equipment Name"
              value={form.title}
              onChange={(e) => updateForm('title', e.target.value)}
              placeholder="e.g. Hitachi ZX19-6 CR"
              required
            />

            <Textarea
              label="Description"
              value={form.description}
              onChange={(e) => updateForm('description', e.target.value)}
              rows={3}
            />

            <Select
              label="Category"
              value={form.categoryId}
              onChange={(e) => updateForm('categoryId', e.target.value)}
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name?.en}
                </option>
              ))}
            </Select>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Condition"
                value={form.condition}
                onChange={(e) => updateForm('condition', e.target.value)}
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </Select>
              <Input
                label="State"
                value={form.state}
                onChange={(e) => updateForm('state', e.target.value)}
                placeholder="e.g. Assam"
                required
              />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Pricing</h2>

          <div className="mb-4 flex gap-6">
            <Radio
              name="listingType"
              label="Fixed Price"
              checked={form.listingType === 'fixed_price'}
              onChange={() => updateForm('listingType', 'fixed_price')}
            />
            <Radio
              name="listingType"
              label="Auction"
              checked={form.listingType === 'auction'}
              onChange={() => updateForm('listingType', 'auction')}
            />
          </div>

          {form.listingType === 'fixed_price' ? (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Price (₹)"
                type="number"
                value={form.fixedPrice}
                onChange={(e) => updateForm('fixedPrice', e.target.value)}
                required
              />
              <Input
                label="Units Available"
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => updateForm('quantity', e.target.value)}
                hint="How many of this item does the seller have?"
                required
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Starting Bid (₹)"
                  type="number"
                  value={form.startingBid}
                  onChange={(e) => updateForm('startingBid', e.target.value)}
                  required
                />
                <Input
                  label="Minimum Bid Increment (₹)"
                  type="number"
                  value={form.minBidIncrement}
                  onChange={(e) => updateForm('minBidIncrement', e.target.value)}
                  required
                />
              </div>
              <Input
                label="Reserve Price (₹) — optional"
                type="number"
                value={form.reservePrice}
                onChange={(e) => updateForm('reservePrice', e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Auction Start"
                  type="datetime-local"
                  value={form.startTime}
                  onChange={(e) => updateForm('startTime', e.target.value)}
                  required
                />
                <Input
                  label="Auction End"
                  type="datetime-local"
                  value={form.endTime}
                  onChange={(e) => updateForm('endTime', e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-slate-500">
                Admin-created auctions skip the seller EMD requirement and publish immediately.
              </p>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Photos / Videos</h2>
          <FileUpload
            label="Click to upload"
            hint="JPG, PNG, WEBP images or MP4/MOV videos"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
            multiple
            onFiles={handleAddMedia}
          />
          {media.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {media.map((file, i) => (
                <span
                  key={i}
                  className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
                >
                  {file.name}
                  <button type="button" onClick={() => handleRemoveMedia(i)} className="text-slate-400 hover:text-red-600">
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </Card>

        {error && <Alert tone="error">{error}</Alert>}

        <Button type="submit" loading={submitting}>
          Create and Publish Listing
        </Button>
      </form>
    </div>
  );
}
