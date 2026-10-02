import React, { useMemo, useState } from 'react';
import type { Product } from '../../types';
import { useWorkspace } from '../../context/workspaceContext';
import { Button, Input, Modal, Select } from '../ui';

interface AdjustStockModalProps {
  product: Product;
  onClose: () => void;
}

type Mode = 'add' | 'remove' | 'set';

export const AdjustStockModal: React.FC<AdjustStockModalProps> = ({ product, onClose }) => {
  const { adjustStock } = useWorkspace();
  const [mode, setMode] = useState<Mode>('add');
  const [qty, setQty] = useState('1');
  const [reason, setReason] = useState('Manual correction');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const n = Number(qty) || 0;
  const resulting = useMemo(() => {
    if (mode === 'add') return product.currentStock + n;
    if (mode === 'remove') return product.currentStock - n;
    return n;
  }, [mode, n, product.currentStock]);

  const delta = resulting - product.currentStock;

  const submit = async () => {
    if (delta === 0) {
      setError('No change in stock.');
      return;
    }
    if (resulting < 0) {
      setError('Resulting stock cannot be negative.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await adjustStock(product.id, delta, reason.trim() || 'Manual correction');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Adjust failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Adjust stock"
      description={`${product.name} · ${product.sku}`}
      footer={
        <>
          <Button type="button" variant="ghost" size="sm" withArrow={false} onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" size="sm" loading={saving} onClick={() => void submit()}>
            Apply
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-vault-secondary">
          Current stock:{' '}
          <span className="font-mono text-vault-text tabular-nums">{product.currentStock}</span>
        </p>
        <Select
          label="Adjustment type"
          value={mode}
          onChange={(e) => setMode(e.target.value as Mode)}
          options={[
            { value: 'add', label: 'Add' },
            { value: 'remove', label: 'Remove' },
            { value: 'set', label: 'Set' },
          ]}
        />
        <Input
          label="Quantity"
          type="number"
          min={0}
          value={qty}
          onChange={(e) => setQty(e.target.value)}
        />
        <Input label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
        <p className="font-mono text-xs text-vault-amber tabular-nums">
          Resulting stock: {resulting} ({delta >= 0 ? `+${delta}` : delta})
        </p>
        {error ? (
          <p className="text-xs text-vault-danger" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </Modal>
  );
};
