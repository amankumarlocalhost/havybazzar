'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const CURRENT_YEAR = new Date().getFullYear();

export default function PostEquipmentPage() {
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    condition: 'good',
    state: '',
    listingType: 'fixed_price',
    fixedPrice: '',
    startingBid: '',
    minBidIncrement: '',
    reservePrice: '',
    startTime: '',
    endTime: '',
  });

  const [specs, setSpecs] = useState({
    general: { brand: '', type: '', productionYear: '', hoursOnMeter: '', totalWeightKg: '' },
    engine: { brand: '', type: '', cylinderCount: '' },
    hydraulic: { systemType: '', quickCouplerBrand: '', quickCouplerType: '' },
    cabin: { hasAirSuspensionSeat: false, hasAirConditioning: false },
    undercarriage: { shoesWidthMm: '', tracksWidthMm: '' },
  });

  useEffect(() => {
    api
      .get('/categories')
      .then((data) => {
        // Flat list banao — top-level + unke children, dono dikhane ke liye
        const flat = [];
        data.forEach((cat) => {
          flat.push(cat);
          (cat.children || []).forEach((child) => flat.push(child));
        });
        setCategories(flat);
      })
      .catch(() => {});
  }, []);

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateSpec(group, field, value) {
    setSpecs((prev) => ({ ...prev, [group]: { ...prev[group], [field]: value } }));
  }

  function buildSpecsPayload() {
    // Khaali fields hataao aur numbers ko convert karo — backend ko sirf
    // wahi bhejo jo user ne actually bhara ho
    const payload = {};
    for (const [group, fields] of Object.entries(specs)) {
      const cleaned = {};
      for (const [key, value] of Object.entries(fields)) {
        if (value === '' || value === undefined) continue;
        if (typeof value === 'boolean') {
          cleaned[key] = value;
        } else if (!isNaN(value)) {
          cleaned[key] = Number(value);
        } else {
          cleaned[key] = value;
        }
      }
      if (Object.keys(cleaned).length > 0) payload[group] = cleaned;
    }
    return payload;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const body = {
        title: form.title,
        description: form.description,
        categoryId: form.categoryId,
        condition: form.condition,
        location: { state: form.state },
        listingType: form.listingType,
        specifications: buildSpecsPayload(),
      };

      if (form.listingType === 'fixed_price') {
        body.fixedPrice = Number(form.fixedPrice);
      } else {
        body.auctionConfig = {
          startingBid: Number(form.startingBid),
          minBidIncrement: Number(form.minBidIncrement),
          ...(form.reservePrice ? { reservePrice: Number(form.reservePrice) } : {}),
          startTime: new Date(form.startTime).toISOString(),
          endTime: new Date(form.endTime).toISOString(),
        };
      }

      const listing = await api.post('/listings', body, 'user');
      router.push(`/seller/listings/${listing._id}`);
    } catch (err) {
      setError(err.message || 'Error creating listing');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Post Equipment</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h2 className="mb-4 text-sm font-medium text-gray-900">Basic Details</h2>
          <div className="space-y-4">
            <Input
              label="Equipment Name"
              value={form.title}
              onChange={(e) => updateForm('title', e.target.value)}
              placeholder="e.g. Hitachi ZX19-6 CR"
              required
            />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => updateForm('description', e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Category</label>
              <select
                value={form.categoryId}
                onChange={(e) => updateForm('categoryId', e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name?.en}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Condition</label>
                <select
                  value={form.condition}
                  onChange={(e) => updateForm('condition', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                </select>
              </div>
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
          <h2 className="mb-4 text-sm font-medium text-gray-900">Pricing</h2>

          <div className="mb-4 flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={form.listingType === 'fixed_price'}
                onChange={() => updateForm('listingType', 'fixed_price')}
              />
              Fixed Price
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={form.listingType === 'auction'}
                onChange={() => updateForm('listingType', 'auction')}
              />
              Auction
            </label>
          </div>

          {form.listingType === 'fixed_price' ? (
            <Input
              label="Price (₹)"
              type="number"
              value={form.fixedPrice}
              onChange={(e) => updateForm('fixedPrice', e.target.value)}
              required
            />
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
              <p className="text-xs text-gray-500">
                You&apos;ll need to pay the EMD before the auction is published — this happens in the next step after creating the draft.
              </p>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-medium text-gray-900">Specifications (optional)</h2>

          <div className="space-y-5">
            <div>
              <p className="mb-2 text-xs font-medium text-gray-500">General</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Input
                  placeholder="Brand"
                  value={specs.general.brand}
                  onChange={(e) => updateSpec('general', 'brand', e.target.value)}
                />
                <Input
                  placeholder="Type"
                  value={specs.general.type}
                  onChange={(e) => updateSpec('general', 'type', e.target.value)}
                />
                <Input
                  placeholder={`Production Year (max ${CURRENT_YEAR})`}
                  type="number"
                  value={specs.general.productionYear}
                  onChange={(e) => updateSpec('general', 'productionYear', e.target.value)}
                />
                <Input
                  placeholder="Hours on Meter"
                  type="number"
                  value={specs.general.hoursOnMeter}
                  onChange={(e) => updateSpec('general', 'hoursOnMeter', e.target.value)}
                />
                <Input
                  placeholder="Total Weight (kg)"
                  type="number"
                  value={specs.general.totalWeightKg}
                  onChange={(e) => updateSpec('general', 'totalWeightKg', e.target.value)}
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-gray-500">Engine</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Input
                  placeholder="Engine Brand"
                  value={specs.engine.brand}
                  onChange={(e) => updateSpec('engine', 'brand', e.target.value)}
                />
                <Input
                  placeholder="Engine Type"
                  value={specs.engine.type}
                  onChange={(e) => updateSpec('engine', 'type', e.target.value)}
                />
                <Input
                  placeholder="Cylinder Count"
                  type="number"
                  value={specs.engine.cylinderCount}
                  onChange={(e) => updateSpec('engine', 'cylinderCount', e.target.value)}
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-gray-500">Hydraulic</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Input
                  placeholder="System Type"
                  value={specs.hydraulic.systemType}
                  onChange={(e) => updateSpec('hydraulic', 'systemType', e.target.value)}
                />
                <Input
                  placeholder="Quick Coupler Brand"
                  value={specs.hydraulic.quickCouplerBrand}
                  onChange={(e) => updateSpec('hydraulic', 'quickCouplerBrand', e.target.value)}
                />
                <Input
                  placeholder="Quick Coupler Type"
                  value={specs.hydraulic.quickCouplerType}
                  onChange={(e) => updateSpec('hydraulic', 'quickCouplerType', e.target.value)}
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-gray-500">Cabin</p>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={specs.cabin.hasAirSuspensionSeat}
                    onChange={(e) => updateSpec('cabin', 'hasAirSuspensionSeat', e.target.checked)}
                  />
                  Air Suspension Seat
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={specs.cabin.hasAirConditioning}
                    onChange={(e) => updateSpec('cabin', 'hasAirConditioning', e.target.checked)}
                  />
                  Air Conditioning
                </label>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-gray-500">Undercarriage</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Input
                  placeholder="Shoes Width (mm)"
                  type="number"
                  value={specs.undercarriage.shoesWidthMm}
                  onChange={(e) => updateSpec('undercarriage', 'shoesWidthMm', e.target.value)}
                />
                <Input
                  placeholder="Tracks Width (mm)"
                  type="number"
                  value={specs.undercarriage.tracksWidthMm}
                  onChange={(e) => updateSpec('undercarriage', 'tracksWidthMm', e.target.value)}
                />
              </div>
            </div>
          </div>
        </Card>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" loading={submitting}>
          Create Draft and Add Photos
        </Button>
      </form>
    </div>
  );
}
