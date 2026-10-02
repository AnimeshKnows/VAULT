import React, { useMemo, useState } from 'react';
import { useWorkspace } from '../context/workspaceContext';
import type { Product } from '../types';
import {
  Button,
  ConfirmDialog,
  Drawer,
  EmptyState,
  Input,
  PageHeader,
  Select,
  SkeletonRows,
  StatusPill,
  Table,
  Textarea,
} from '../components/ui';
import { formatMoney, initialsFromName } from '../lib/format';
import { fieldErrorsFromApi, friendlyApiMessage } from '../lib/errors';
import { AdjustStockModal } from '../components/app/AdjustStockModal';
import { cx } from '../lib/cn';

export const ProductsPage: React.FC = () => {
  const {
    products,
    bootstrapping,
    currentUser,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useWorkspace();
  const isAdmin = currentUser?.role === 'Admin';

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [lowOnly, setLowOnly] = useState(false);
  const [sort, setSort] = useState<'name' | 'stock' | 'price'>('name');
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [cat, setCat] = useState('General');
  const [price, setPrice] = useState('0');
  const [stock, setStock] = useState('0');
  const [threshold, setThreshold] = useState('10');
  const [description, setDescription] = useState('');

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return ['all', ...Array.from(set).sort()];
  }, [products]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
      );
    }
    if (category !== 'all') list = list.filter((p) => p.category === category);
    if (lowOnly) list = list.filter((p) => p.status !== 'In Stock');
    list.sort((a, b) => {
      if (sort === 'stock') return a.currentStock - b.currentStock;
      if (sort === 'price') return a.unitPrice - b.unitPrice;
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [products, search, category, lowOnly, sort]);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setSku(`SKU-${Math.floor(100 + Math.random() * 900)}`);
    setCat('General');
    setPrice('0');
    setStock('0');
    setThreshold('10');
    setDescription('');
    setFormError(null);
    setFieldErrors({});
    setDrawerOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setName(p.name);
    setSku(p.sku);
    setCat(p.category);
    setPrice(String(p.unitPrice));
    setStock(String(p.currentStock));
    setThreshold(String(p.threshold));
    setDescription(p.description ?? '');
    setFormError(null);
    setFieldErrors({});
    setDrawerOpen(true);
  };

  const submit = async () => {
    setSaving(true);
    setFormError(null);
    setFieldErrors({});
    try {
      if (editing) {
        await updateProduct(editing.id, {
          name: name.trim(),
          sku: sku.trim().toUpperCase(),
          category: cat.trim() || 'General',
          unitPrice: Number(price) || 0,
          threshold: Number(threshold) || 0,
          description: description.trim() || null,
          isActive: editing.isActive,
        });
      } else {
        await createProduct({
          name: name.trim(),
          sku: sku.trim().toUpperCase(),
          category: cat.trim() || 'General',
          unitPrice: Number(price) || 0,
          initialStock: Number(stock) || 0,
          threshold: Number(threshold) || 0,
          description: description.trim() || undefined,
        });
      }
      setDrawerOpen(false);
    } catch (err) {
      const fields = fieldErrorsFromApi(err);
      setFieldErrors(fields);
      if (fields.Sku || fields.sku) {
        setFieldErrors((f) => ({ ...f, sku: fields.Sku || fields.sku }));
      }
      setFormError(friendlyApiMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const stockBar = (p: Product) => {
    const max = Math.max(p.threshold * 2, p.currentStock, 1);
    const pct = Math.min(100, (p.currentStock / max) * 100);
    const danger = p.currentStock <= p.threshold;
    return (
      <div className="w-24 h-1.5 rounded-full bg-vault-raised overflow-hidden">
        <div
          className={cx('h-full rounded-full', danger ? 'bg-vault-danger' : 'bg-vault-amber')}
          style={{ width: `${pct}%` }}
        />
      </div>
    );
  };

  const monogram = (p: Product) => (
    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vault-raised border border-vault-hairline font-mono text-[11px] font-bold text-vault-amber">
      {initialsFromName(p.name)}
    </div>
  );

  return (
    <div className="pb-8 space-y-6">
      <PageHeader
        index="S.02"
        label="CATALOG"
        title="Products"
        description="SKUs, pricing, and on-hand stock for this workspace."
        actions={
          <Button type="button" size="sm" onClick={openCreate}>
            Add product
          </Button>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:flex-wrap">
        <div className="flex-1 min-w-[180px]">
          <Input
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name or SKU"
          />
        </div>
        <div className="w-full sm:w-40">
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={categories.map((c) => ({
              value: c,
              label: c === 'all' ? 'All' : c,
            }))}
          />
        </div>
        <div className="w-full sm:w-40">
          <Select
            label="Sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            options={[
              { value: 'name', label: 'Name' },
              { value: 'stock', label: 'Stock' },
              { value: 'price', label: 'Price' },
            ]}
          />
        </div>
        <label className="flex items-center gap-2 text-xs text-vault-secondary pb-2">
          <input
            type="checkbox"
            checked={lowOnly}
            onChange={(e) => setLowOnly(e.target.checked)}
            className="accent-[#FFB020]"
          />
          Low stock only
        </label>
        <div className="flex gap-1 pb-1">
          <Button
            type="button"
            size="sm"
            variant={view === 'table' ? 'primary' : 'ghost'}
            withArrow={false}
            onClick={() => setView('table')}
          >
            Table
          </Button>
          <Button
            type="button"
            size="sm"
            variant={view === 'grid' ? 'primary' : 'ghost'}
            withArrow={false}
            onClick={() => setView('grid')}
          >
            Grid
          </Button>
        </div>
      </div>

      {bootstrapping ? (
        <SkeletonRows rows={6} cols={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No products"
          description="Add your first SKU to start tracking inventory."
          actionLabel="Add product"
          onAction={openCreate}
        />
      ) : view === 'table' ? (
        <Table
          rows={filtered}
          rowKey={(p) => p.id}
          columns={[
            {
              key: 'product',
              header: 'Product',
              render: (p) => (
                <div className="flex items-center gap-3">
                  {monogram(p)}
                  <div>
                    <p className="text-sm text-vault-text">{p.name}</p>
                    <p className="font-mono text-[10px] text-vault-muted">{p.sku}</p>
                  </div>
                </div>
              ),
            },
            { key: 'category', header: 'Category', render: (p) => p.category },
            {
              key: 'price',
              header: 'Price',
              render: (p) => (
                <span className="font-mono tabular-nums">{formatMoney(p.unitPrice)}</span>
              ),
            },
            {
              key: 'stock',
              header: 'Stock',
              render: (p) => (
                <div className="space-y-1">
                  <span className="font-mono tabular-nums text-xs">{p.currentStock}</span>
                  {stockBar(p)}
                </div>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              render: (p) => (
                <StatusPill
                  label={p.status}
                  tone={
                    p.status === 'Out of Stock'
                      ? 'danger'
                      : p.status === 'Low Stock'
                        ? 'amber'
                        : 'success'
                  }
                  icon={
                    p.status === 'Out of Stock'
                      ? 'error'
                      : p.status === 'Low Stock'
                        ? 'warning'
                        : 'check_circle'
                  }
                />
              ),
            },
            {
              key: 'actions',
              header: 'Actions',
              render: (p) => (
                <div className="flex flex-wrap gap-1">
                  <Button type="button" size="sm" variant="ghost" withArrow={false} onClick={() => openEdit(p)}>
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    withArrow={false}
                    onClick={() => setAdjustProduct(p)}
                  >
                    Adjust
                  </Button>
                  {isAdmin ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      withArrow={false}
                      onClick={() => setDeleteTarget(p)}
                    >
                      Delete
                    </Button>
                  ) : null}
                </div>
              ),
            },
          ]}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-vault-hairline bg-vault-surface p-4 space-y-3"
            >
              <div className="flex items-start gap-3">
                {monogram(p)}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-vault-text truncate">{p.name}</p>
                  <p className="font-mono text-[10px] text-vault-muted">{p.sku}</p>
                </div>
                <StatusPill label={p.status} tone={p.status === 'In Stock' ? 'success' : 'amber'} />
              </div>
              <p className="font-mono text-sm tabular-nums text-vault-amber">{formatMoney(p.unitPrice)}</p>
              {stockBar(p)}
              <Button type="button" size="sm" variant="secondary" onClick={() => setAdjustProduct(p)}>
                Adjust
              </Button>
            </div>
          ))}
        </div>
      )}

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? 'Edit product' : 'Add product'}
        description="Basics, pricing, and stock thresholds."
        footer={
          <>
            <Button type="button" variant="ghost" size="sm" withArrow={false} onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            <Button type="button" size="sm" loading={saving} onClick={() => void submit()}>
              {editing ? 'Save' : 'Create'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-vault-muted">Basics</p>
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} error={fieldErrors.name} />
          <Input label="SKU" value={sku} onChange={(e) => setSku(e.target.value)} error={fieldErrors.sku} />
          <Input label="Category" value={cat} onChange={(e) => setCat(e.target.value)} />
          <p className="font-mono text-[10px] uppercase tracking-wider text-vault-muted pt-2">Pricing</p>
          <Input label="Price (INR)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
          <p className="font-mono text-[10px] uppercase tracking-wider text-vault-muted pt-2">Stock</p>
          {!editing ? (
            <Input
              label="Initial stock"
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          ) : null}
          <Input
            label="Low-stock threshold"
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
          />
          <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          {formError ? (
            <p className="text-xs text-vault-danger" role="alert">
              {formError}
            </p>
          ) : null}
        </div>
      </Drawer>

      {adjustProduct ? (
        <AdjustStockModal product={adjustProduct} onClose={() => setAdjustProduct(null)} />
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete product?"
        description={`Remove ${deleteTarget?.name ?? 'this SKU'} from the catalog. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteProduct(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
};
