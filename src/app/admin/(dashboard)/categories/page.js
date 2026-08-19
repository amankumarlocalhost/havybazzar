'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import { TagIcon, PlusIcon } from '@/components/ui/Icons';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [nameEn, setNameEn] = useState('');
  const [nameHi, setNameHi] = useState('');
  const [parentId, setParentId] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.get('/categories/admin/all', 'admin');
      setCategories(result);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard data-fetch-on-mount pattern
    load();
  }, [load]);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const name = { en: nameEn };
      if (nameHi) name.hi = nameHi;
      await api.post('/categories/admin', { name, parentId: parentId || null }, 'admin');
      setNameEn('');
      setNameHi('');
      setParentId('');
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(categoryId, isActive) {
    await api.patch(`/categories/admin/${categoryId}`, { isActive: !isActive }, 'admin');
    load();
  }

  const topLevel = categories.filter((c) => !c.parentId);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Organize the marketplace taxonomy buyers and sellers browse by."
        actions={
          <Button onClick={() => setShowForm((v) => !v)}>
            {showForm ? (
              'Cancel'
            ) : (
              <>
                <PlusIcon className="h-4 w-4" />
                New Category
              </>
            )}
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Name (English)" value={nameEn} onChange={(e) => setNameEn(e.target.value)} required />
              <Input label="Name (Hindi) — optional" value={nameHi} onChange={(e) => setNameHi(e.target.value)} />
            </div>
            <Select label="Parent Category (optional)" value={parentId} onChange={(e) => setParentId(e.target.value)}>
              <option value="">Top-level category</option>
              {topLevel.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name?.en}
                </option>
              ))}
            </Select>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" loading={saving}>
              Create
            </Button>
          </form>
        </Card>
      )}

      {categories.length === 0 ? (
        <EmptyState
          icon={TagIcon}
          title="No categories yet"
          description="Create your first category to start organizing listings."
        />
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <Card key={cat._id} hover className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {cat.parentId && <span className="text-slate-400">↳ </span>}
                  {cat.name?.en}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">{cat.listingCount || 0} listings</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge status={cat.isActive ? 'active' : 'closed'}>{cat.isActive ? 'Active' : 'Inactive'}</Badge>
                <Button
                  variant={cat.isActive ? 'danger' : 'primary'}
                  size="sm"
                  onClick={() => handleToggleActive(cat._id, cat.isActive)}
                >
                  {cat.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
