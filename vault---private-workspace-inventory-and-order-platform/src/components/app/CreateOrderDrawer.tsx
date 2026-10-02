import React, { useMemo, useState } from 'react';
import type { Product } from '../../types';
import { useWorkspace } from '../../context/workspaceContext';
import { Button, Drawer, Input, Select } from '../ui';
import { formatMoney } from '../../lib/format';
import { friendlyApiMessage } from '../../lib/errors';

interface CreateOrderDrawerProps {
  products: Product[];
  onClose: () => void;
}

interface Line {
  productId: string;
  quantity: number;
}

export const CreateOrderDrawer: React.FC<CreateOrderDrawerProps> = ({ products, onClose }) => {
  const { createOrder } = useWorkspace();
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [lines, setLines] = useState<Line[]>([]);
  const [productId, setProductId] = useState(products[0]?.id ?? '');
  const [qty, setQty] = useState('1');
  const [confirmNow, setConfirmNow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeProducts = products.filter((p) => p.isActive && p.currentStock > 0);

  const enriched = useMemo(
    () =>
      lines.map((line) => {
        const p = products.find((x) => x.id === line.productId);
        return {
          ...line,
          product: p,
          over: p ? line.quantity > p.currentStock : true,
          lineTotal: p ? line.quantity * p.unitPrice : 0,
        };
      }),
    [lines, products]
  );

  const total = enriched.reduce((s, l) => s + l.lineTotal, 0);
  const hasOver = enriched.some((l) => l.over);

  const addLine = () => {
    if (!productId) return;
    const q = Math.max(1, Number(qty) || 1);
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === productId);
      if (existing) {
        return prev.map((l) =>
          l.productId === productId ? { ...l, quantity: l.quantity + q } : l
        );
      }
      return [...prev, { productId, quantity: q }];
    });
  };

  const submit = async () => {
    if (!customerName.trim() || lines.length === 0) {
      setError('Customer name and at least one line item are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createOrder({
        customerName: customerName.trim(),
        customerEmail:
          customerEmail.trim() ||
          `${customerName.trim().toLowerCase().replace(/\s+/g, '.')}@client.com`,
        items: lines,
        confirmImmediately: confirmNow,
      });
      onClose();
    } catch (err) {
      setError(friendlyApiMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      open
      onClose={onClose}
      title="Create order"
      description="Stock is reserved when the order is confirmed."
      widthClassName="max-w-xl"
      footer={
        <>
          <Button type="button" variant="ghost" size="sm" withArrow={false} onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" size="sm" loading={saving} onClick={() => void submit()}>
            Create
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Customer name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          required
        />
        <Input
          label="Customer email"
          type="email"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          hint="Optional — a placeholder is used if blank."
        />

        <div className="rounded-xl border border-vault-hairline p-3 space-y-3">
          <Select
            label="Product"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            options={activeProducts.map((p) => ({
              value: p.id,
              label: `${p.name} (${p.sku}) · ${p.currentStock} avail`,
            }))}
          />
          <Input
            label="Quantity"
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
          <Button type="button" size="sm" variant="secondary" withArrow={false} onClick={addLine}>
            Add line
          </Button>
        </div>

        <ul className="space-y-2">
          {enriched.map((line) => (
            <li
              key={line.productId}
              className="flex items-center justify-between gap-2 rounded-lg border border-vault-hairline px-3 py-2 text-sm"
            >
              <div>
                <p>{line.product?.name}</p>
                <p className="font-mono text-[10px] text-vault-muted">
                  qty {line.quantity}
                  {line.over ? ' · exceeds stock' : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono tabular-nums">{formatMoney(line.lineTotal)}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  withArrow={false}
                  onClick={() =>
                    setLines((prev) => prev.filter((l) => l.productId !== line.productId))
                  }
                >
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>

        {hasOver ? (
          <p className="text-xs text-vault-amber" role="alert">
            One or more quantities exceed available stock.
          </p>
        ) : null}

        <label className="flex items-center gap-2 text-xs text-vault-secondary">
          <input
            type="checkbox"
            checked={confirmNow}
            onChange={(e) => setConfirmNow(e.target.checked)}
            className="accent-[#FFB020]"
          />
          Confirm immediately
        </label>

        <p className="text-right font-mono text-sm text-vault-amber tabular-nums">
          Total {formatMoney(total)}
        </p>
        <p className="text-[11px] text-vault-muted">
          Stock is reserved when the order is confirmed.
        </p>
        {error ? (
          <p className="text-xs text-vault-danger" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </Drawer>
  );
};
