import React, { useMemo, useState } from 'react';
import { useWorkspace } from '../context/workspaceContext';
import { Button, EmptyState, Input, PageHeader, Select, SkeletonRows } from '../components/ui';
import { formatDate, formatDateTime } from '../lib/format';
import { AdjustStockModal } from '../components/app/AdjustStockModal';
import { cx } from '../lib/cn';

export const StockLogPage: React.FC = () => {
  const { adjustments, products, bootstrapping } = useWorkspace();
  const [productFilter, setProductFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [adjustOpen, setAdjustOpen] = useState(false);

  const users = useMemo(() => {
    const set = new Set(adjustments.map((a) => a.operatorBadge).filter(Boolean));
    return Array.from(set).sort();
  }, [adjustments]);

  const filtered = useMemo(() => {
    return adjustments.filter((a) => {
      if (productFilter !== 'all' && a.sku !== productFilter) return false;
      if (userFilter !== 'all' && a.operatorBadge !== userFilter) return false;
      const t = new Date(a.timestampRaw).getTime();
      if (from && t < new Date(from).getTime()) return false;
      if (to && t > new Date(to).getTime() + 86_400_000) return false;
      return true;
    });
  }, [adjustments, productFilter, userFilter, from, to]);

  const byDay = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const a of filtered) {
      const key = formatDate(a.timestampRaw);
      const list = map.get(key) ?? [];
      list.push(a);
      map.set(key, list);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const defaultProduct = products[0] ?? null;

  return (
    <div className="pb-8 space-y-6">
      <PageHeader
        index="S.04"
        label="STOCK LOG"
        title="Stock Log"
        description="Audit trail of every stock change in this workspace."
        actions={
          <Button
            type="button"
            size="sm"
            onClick={() => setAdjustOpen(true)}
            disabled={!defaultProduct}
          >
            Adjust stock
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Select
          label="Product SKU"
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All products' },
            ...Array.from(new Set(adjustments.map((a) => a.sku))).map((sku) => ({
              value: sku,
              label: sku,
            })),
          ]}
        />
        <Select
          label="User"
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All users' },
            ...users.map((u) => ({ value: u, label: u })),
          ]}
        />
        <Input label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>

      {bootstrapping ? (
        <SkeletonRows rows={6} cols={4} />
      ) : byDay.length === 0 ? (
        <EmptyState
          icon="history"
          title="No stock activity"
          description="Adjustments, receipts, and write-offs will appear here."
          actionLabel={defaultProduct ? 'Adjust stock' : undefined}
          onAction={defaultProduct ? () => setAdjustOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-6">
          {byDay.map(([day, items]) => (
            <section key={day}>
              <div className="sticky top-14 z-[1] -mx-1 bg-vault-base/95 px-1 py-2 backdrop-blur">
                <h2 className="font-mono text-[11px] uppercase tracking-wider text-vault-amber">
                  {day}
                </h2>
              </div>
              <ul className="space-y-2">
                {items.map((a) => (
                  <li
                    key={a.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-vault-hairline bg-vault-surface px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-vault-text">{a.productName}</p>
                      <p className="font-mono text-[10px] text-vault-muted">
                        {a.sku} · {formatDateTime(a.timestampRaw)} · {a.operatorBadge}
                      </p>
                      {a.reason ? (
                        <p className="text-xs text-vault-secondary mt-1">{a.reason}</p>
                      ) : null}
                    </div>
                    <div className="text-right">
                      <p
                        className={cx(
                          'font-mono text-sm tabular-nums flex items-center justify-end gap-1',
                          a.delta >= 0 ? 'text-vault-success' : 'text-vault-danger'
                        )}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {a.delta >= 0 ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                        {a.delta >= 0 ? `+${a.delta}` : a.delta}
                      </p>
                      <p className="font-mono text-[10px] text-vault-muted tabular-nums">
                        → {a.newStock}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {adjustOpen && defaultProduct ? (
        <AdjustStockModal product={defaultProduct} onClose={() => setAdjustOpen(false)} />
      ) : null}
    </div>
  );
};
