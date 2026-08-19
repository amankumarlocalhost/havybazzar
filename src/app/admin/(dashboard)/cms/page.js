'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import { FileTextIcon } from '@/components/ui/Icons';

export default function AdminCmsPage() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [isNewSlug, setIsNewSlug] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.get('/cms/admin/all', 'admin');
      setPages(result);
    } catch {
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard data-fetch-on-mount pattern
    load();
  }, [load]);

  function handleEdit(page) {
    setSlug(page.slug);
    setTitleEn(page.title?.en || '');
    setContentEn(page.content?.en || '');
    setIsNewSlug(false);
  }

  function handleNew() {
    setSlug('');
    setTitleEn('');
    setContentEn('');
    setIsNewSlug(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.put(`/cms/admin/${slug}`, { title: { en: titleEn }, content: { en: contentEn } }, 'admin');
      handleNew();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="CMS Pages" description="Manage static content pages such as policies, FAQs, and terms." />

      <div className="mb-6 space-y-3">
        {pages.length === 0 ? (
          <EmptyState icon={FileTextIcon} title="No pages yet" description="Create your first CMS page below." />
        ) : (
          pages.map((page) => (
            <Card key={page._id} hover className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">{page.title?.en}</p>
                <p className="text-xs text-slate-500">/{page.slug}</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => handleEdit(page)}>
                Edit
              </Button>
            </Card>
          ))
        )}
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">
            {isNewSlug ? 'Create New Page' : `Edit: /${slug}`}
          </h3>
          {!isNewSlug && (
            <Button variant="ghost" size="sm" onClick={handleNew}>
              New page
            </Button>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Slug (e.g. privacy-policy, faq, terms)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            disabled={!isNewSlug}
            required
          />
          <Input label="Title (English)" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} required />
          <Textarea
            label="Content (English)"
            value={contentEn}
            onChange={(e) => setContentEn(e.target.value)}
            rows={8}
            required
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" loading={saving}>
            Save
          </Button>
        </form>
      </Card>
    </div>
  );
}
