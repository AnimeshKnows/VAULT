import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useWorkspace } from '../context/workspaceContext';
import { Button, Card, EmptyState, PageHeader, Skeleton, Stat, StatusPill } from '../components/ui';
import { formatDate, formatMoney, formatRelativeTime, greetingForHour } from '../lib/format';
import { fetchOrderVolume, type OrderVolumeDay } from '../lib/api/reports';
import { ROUTES } from '../lib/routes';
import { prefersReducedMotion } from '../lib/cn';
import { HeroCanvas } from '../components/HeroCanvas';
import { AdjustStockModal } from '../components/app/AdjustStockModal';
import type { Product } from '../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    products,
    orders,
    adjustments,
    currentUser,
    tenant,
    bootstrapping,
    openCreateOrder,
    executeReorder,
  } = useWorkspace();
  const [volume, setVolume] = useState<OrderVolumeDay[]>([]);
  const [volumeLoading, setVolumeLoading] = useState(true);
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
  const reduced = prefersReducedMotion();

  const loadVolume = useCallback(async () => {
    setVolumeLoading(true);
    try {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - 21);
      const data = await fetchOrderVolume(
        from.toISOString().slice(0, 10),
        to.toISOString().slice(0, 10)
      );
      setVolume(data);
    } catch {
      setVolume([]);
    } finally {
      setVolumeLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadVolume();
  }, [loadVolume, orders.length]);

  const unitsInStock = useMemo(
    () => products.reduce((sum, p) => sum + Math.max(0, p.currentStock), 0),
    [products]
  );
  const openOrders = useMemo(
    () => orders.filter((o) => o.status === 'Draft' || o.status === 'Confirmed').length,
    [orders]
  );
  const lowStock = useMemo(
    () => products.filter((p) => p.status === 'Low Stock' || p.status === 'Out of Stock'),
    [products]
  );

  const isEmpty = !bootstrapping && products.length === 0 && orders.length === 0;
  const greeting = `Good ${greetingForHour()}`;
  const firstName = currentUser?.firstName || 'there';
  const maxBar = Math.max(
    1,
    ...volume.map((d) => d.draft + d.confirmed + d.fulfilled)
  );

  return (
    <div className="pb-8 space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-vault-hairline bg-vault-surface">
        <div className="absolute inset-0 opacity-[0.12] pointer-events-none">
          <HeroCanvas />
        </div>
        <div className="relative px-5 py-6 sm:px-8 sm:py-8">
          <PageHeader
            index="S.01"
            label="OVERVIEW"
            title={`${greeting}, ${firstName}`}
            description={`${tenant?.name ?? 'Workspace'} · ${formatDate(new Date())}`}
            className="pb-0"
          />
        </div>
      </div>

      {isEmpty ? (
        <EmptyState
          icon="rocket_launch"
          title="Your workspace is ready"
          description="Add a product, adjust stock, then create your first order."
          actionLabel="Add product"
          onAction={() => navigate(ROUTES.products)}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Stat label="Products" value={products.length} animate={!reduced} />
            <Stat label="Units in stock" value={unitsInStock} animate={!reduced} />
            <Stat label="Open orders" value={openOrders} animate={!reduced} />
            <Stat label="Low-stock items" value={lowStock.length} animate={!reduced} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-mono text-[11px] uppercase tracking-wider text-vault-secondary">
                  Needs attention
                </h2>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  withArrow={false}
                  onClick={() => navigate(ROUTES.products)}
                >
                  View catalog
                </Button>
              </div>
              {lowStock.length === 0 ? (
                <p className="text-sm text-vault-secondary">All stocked up.</p>
              ) : (
                <ul className="space-y-2">
                  {lowStock.slice(0, 6).map((p, i) => (
                    <motion.li
                      key={p.id}
                      initial={reduced ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center justify-between gap-3 rounded-lg border border-vault-hairline bg-vault-raised/40 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm text-vault-text">{p.name}</p>
                        <p className="font-mono text-[10px] text-vault-muted">
                          {p.sku} · {p.currentStock} left
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          withArrow={false}
                          onClick={() => setAdjustProduct(p)}
                        >
                          Adjust
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          withArrow={false}
                          onClick={() =>
                            void executeReorder([
                              {
                                productId: p.id,
                                addUnits: Math.max(p.threshold * 2 - p.currentStock, p.threshold),
                              },
                            ])
                          }
                        >
                          Reorder
                        </Button>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-mono text-[11px] uppercase tracking-wider text-vault-secondary">
                  Recent orders
                </h2>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  withArrow={false}
                  onClick={() => navigate(ROUTES.orders)}
                >
                  All orders
                </Button>
              </div>
              {orders.length === 0 ? (
                <EmptyState
                  title="No orders yet"
                  description="Create an order when you are ready."
                  actionLabel="New order"
                  onAction={openCreateOrder}
                />
              ) : (
                <ul className="space-y-2">
                  {orders.slice(0, 6).map((o) => (
                    <li key={o.id}>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left hover:bg-vault-raised vault-focus"
                        onClick={() => navigate(ROUTES.orders)}
                      >
                        <div>
                          <p className="font-mono text-sm text-vault-text">{o.orderNumber}</p>
                          <p className="text-xs text-vault-muted">{o.customerName}</p>
                        </div>
                        <div className="text-right space-y-1">
                          <StatusPill
                            label={o.status}
                            tone={
                              o.status === 'Cancelled'
                                ? 'danger'
                                : o.status === 'Fulfilled'
                                  ? 'success'
                                  : o.status === 'Confirmed'
                                    ? 'info'
                                    : 'neutral'
                            }
                            icon={
                              o.status === 'Cancelled'
                                ? 'cancel'
                                : o.status === 'Fulfilled'
                                  ? 'check_circle'
                                  : 'schedule'
                            }
                          />
                          <p className="font-mono text-[10px] text-vault-secondary tabular-nums">
                            {formatMoney(o.totalAmount)}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <h2 className="font-mono text-[11px] uppercase tracking-wider text-vault-secondary mb-4">
                Order volume
              </h2>
              {volumeLoading ? (
                <Skeleton className="h-40 w-full" rounded="lg" />
              ) : volume.length === 0 ? (
                <p className="text-sm text-vault-secondary">No volume data yet.</p>
              ) : (
                <svg viewBox="0 0 320 140" className="w-full h-40" role="img" aria-label="Order volume chart">
                  {volume.map((d, i) => {
                    const total = d.draft + d.confirmed + d.fulfilled;
                    const h = (total / maxBar) * 100;
                    const x = 20 + i * ((280) / Math.max(volume.length, 1));
                    const w = Math.max(6, 280 / volume.length - 4);
                    return (
                      <g key={d.date}>
                        <title>
                          {d.date}: {total} orders
                        </title>
                        <rect
                          x={x}
                          y={120 - h}
                          width={w}
                          height={h}
                          rx={2}
                          className="fill-vault-amber"
                          opacity={0.85}
                        />
                      </g>
                    );
                  })}
                </svg>
              )}
            </Card>

            <Card>
              <h2 className="font-mono text-[11px] uppercase tracking-wider text-vault-secondary mb-4">
                Recent stock activity
              </h2>
              {adjustments.length === 0 ? (
                <p className="text-sm text-vault-secondary">No stock changes logged yet.</p>
              ) : (
                <ul className="space-y-2">
                  {adjustments.slice(0, 6).map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center justify-between gap-3 text-sm border-b border-vault-hairline pb-2 last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-vault-text">{a.productName}</p>
                        <p className="font-mono text-[10px] text-vault-muted">
                          {formatRelativeTime(a.timestampRaw)} · {a.operatorBadge}
                        </p>
                      </div>
                      <span
                        className={`font-mono tabular-nums ${
                          a.delta >= 0 ? 'text-vault-success' : 'text-vault-danger'
                        }`}
                      >
                        {a.delta >= 0 ? `+${a.delta}` : a.delta}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}

      {adjustProduct ? (
        <AdjustStockModal product={adjustProduct} onClose={() => setAdjustProduct(null)} />
      ) : null}
    </div>
  );
};
