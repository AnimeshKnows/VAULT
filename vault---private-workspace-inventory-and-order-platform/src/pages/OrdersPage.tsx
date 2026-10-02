import React, { useMemo, useState } from 'react';
import type { Order, OrderStatus, Product } from '../types';
import { useWorkspace } from '../context/workspaceContext';
import {
  Button,
  ConfirmDialog,
  Drawer,
  EmptyState,
  Input,
  PageHeader,
  SkeletonRows,
  StatusPill,
  Table,
  Tabs,
} from '../components/ui';
import { formatDateTime, formatMoney } from '../lib/format';
import { friendlyApiMessage } from '../lib/errors';
import { CreateOrderDrawer } from '../components/app/CreateOrderDrawer';
import { cx } from '../lib/cn';

const statusTone = (s: OrderStatus) => {
  if (s === 'Cancelled') return 'danger' as const;
  if (s === 'Fulfilled') return 'success' as const;
  if (s === 'Confirmed') return 'info' as const;
  return 'neutral' as const;
};

export const OrdersPage: React.FC = () => {
  const {
    orders,
    products,
    bootstrapping,
    currentUser,
    createOrderOpen,
    openCreateOrder,
    closeCreateOrder,
    updateOrderStatus,
  } = useWorkspace();
  const isAdmin = currentUser?.role === 'Admin';

  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const counts = useMemo(() => {
    const c = { all: orders.length, Draft: 0, Confirmed: 0, Fulfilled: 0, Cancelled: 0 };
    for (const o of orders) c[o.status] += 1;
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    let list = [...orders];
    if (tab !== 'all') list = list.filter((o) => o.status === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerEmail.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => b.createdAtRaw.localeCompare(a.createdAtRaw));
    return list;
  }, [orders, tab, search]);

  const openCount = counts.Draft + counts.Confirmed;
  const gross = orders
    .filter((o) => o.status === 'Confirmed' || o.status === 'Fulfilled')
    .reduce((s, o) => s + o.totalAmount, 0);

  const runStatus = async (order: Order, status: OrderStatus) => {
    setBusy(true);
    setActionError(null);
    try {
      const updated = await updateOrderStatus(order.id, status);
      setSelected(updated);
    } catch (err) {
      setActionError(friendlyApiMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const stockCheck = (order: Order) =>
    order.items.map((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const available = prod?.currentStock ?? 0;
      return {
        ...item,
        available,
        short: Math.max(0, item.quantity - available),
      };
    });

  return (
    <div className="pb-8 space-y-6">
      <PageHeader
        index="S.03"
        label="ORDERS"
        title="Orders"
        description="Draft, confirm, fulfill, and track customer orders."
        actions={
          <Button type="button" size="sm" onClick={openCreateOrder}>
            New order
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-vault-hairline bg-vault-surface p-4">
          <p className="font-mono text-[10px] uppercase text-vault-muted">Open</p>
          <p className="mt-1 text-2xl font-bold text-vault-amber tabular-nums">{openCount}</p>
        </div>
        <div className="rounded-2xl border border-vault-hairline bg-vault-surface p-4">
          <p className="font-mono text-[10px] uppercase text-vault-muted">Total orders</p>
          <p className="mt-1 text-2xl font-bold text-vault-text tabular-nums">{orders.length}</p>
        </div>
        <div className="rounded-2xl border border-vault-hairline bg-vault-surface p-4 col-span-2 sm:col-span-1">
          <p className="font-mono text-[10px] uppercase text-vault-muted">Confirmed + fulfilled</p>
          <p className="mt-1 text-2xl font-bold text-vault-text tabular-nums">{formatMoney(gross)}</p>
        </div>
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { id: 'all', label: 'All', count: counts.all },
          { id: 'Draft', label: 'Draft', count: counts.Draft },
          { id: 'Confirmed', label: 'Confirmed', count: counts.Confirmed },
          { id: 'Fulfilled', label: 'Fulfilled', count: counts.Fulfilled },
          { id: 'Cancelled', label: 'Cancelled', count: counts.Cancelled },
        ]}
      />

      <Input
        label="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Order number or customer"
      />

      {bootstrapping ? (
        <SkeletonRows rows={5} cols={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No orders"
          description="Create an order to reserve stock on confirm."
          actionLabel="New order"
          onAction={openCreateOrder}
        />
      ) : (
        <Table
          rows={filtered}
          rowKey={(o) => o.id}
          onRowClick={(o) => {
            setSelected(o);
            setActionError(null);
          }}
          columns={[
            {
              key: 'number',
              header: 'Order',
              render: (o) => <span className="font-mono text-sm">{o.orderNumber}</span>,
            },
            { key: 'customer', header: 'Customer', render: (o) => o.customerName },
            {
              key: 'items',
              header: 'Items',
              render: (o) => (
                <span className="font-mono tabular-nums">{o.items.length}</span>
              ),
            },
            {
              key: 'total',
              header: 'Total',
              render: (o) => (
                <span className="font-mono tabular-nums">{formatMoney(o.totalAmount)}</span>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              render: (o) => <StatusPill label={o.status} tone={statusTone(o.status)} />,
            },
            {
              key: 'date',
              header: 'Created',
              render: (o) => (
                <span className="font-mono text-[11px] text-vault-secondary">
                  {formatDateTime(o.createdAtRaw)}
                </span>
              ),
            },
          ]}
        />
      )}

      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.orderNumber ?? 'Order'}
        description={selected ? selected.customerName : undefined}
        widthClassName="max-w-xl"
        footer={
          selected ? (
            <div className="flex flex-wrap gap-2 w-full">
              {selected.status === 'Draft' ? (
                <Button
                  type="button"
                  size="sm"
                  loading={busy}
                  onClick={() => void runStatus(selected, 'Confirmed')}
                >
                  Confirm
                </Button>
              ) : null}
              {selected.status === 'Confirmed' ? (
                <Button
                  type="button"
                  size="sm"
                  loading={busy}
                  onClick={() => void runStatus(selected, 'Fulfilled')}
                >
                  Fulfill
                </Button>
              ) : null}
              {isAdmin && selected.status !== 'Cancelled' ? (
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  withArrow={false}
                  onClick={() => setCancelTarget(selected)}
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          ) : null
        }
      >
        {selected ? (
          <div className="space-y-5">
            <StatusPill label={selected.status} tone={statusTone(selected.status)} />
            <OrderStepper status={selected.status} />

            <div>
              <p className="font-mono text-[10px] uppercase text-vault-muted mb-1">Customer</p>
              <p className="text-sm text-vault-text">{selected.customerName}</p>
              <p className="text-xs text-vault-secondary">{selected.customerEmail}</p>
            </div>

            {selected.status === 'Draft' ? (
              <div className="rounded-xl border border-vault-hairline bg-vault-raised/40 p-3 space-y-2">
                <p className="font-mono text-[10px] uppercase text-vault-muted">Stock check</p>
                {stockCheck(selected).map((line) => (
                  <div key={line.productId} className="flex justify-between text-xs">
                    <span className="text-vault-secondary">{line.name}</span>
                    <span
                      className={cx(
                        'font-mono tabular-nums',
                        line.short > 0 ? 'text-vault-danger' : 'text-vault-success'
                      )}
                    >
                      need {line.quantity} / have {line.available}
                      {line.short > 0 ? ` (−${line.short})` : ''}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}

            <table className="w-full text-sm">
              <thead>
                <tr className="font-mono text-[10px] uppercase text-vault-muted text-left">
                  <th className="py-1">Product</th>
                  <th className="py-1">Qty</th>
                  <th className="py-1">Unit</th>
                  <th className="py-1">Line</th>
                </tr>
              </thead>
              <tbody>
                {selected.items.map((item) => (
                  <tr key={item.productId} className="border-t border-vault-hairline">
                    <td className="py-2">
                      <p>{item.name}</p>
                      <p className="font-mono text-[10px] text-vault-muted">{item.sku}</p>
                    </td>
                    <td className="py-2 font-mono tabular-nums">{item.quantity}</td>
                    <td className="py-2 font-mono tabular-nums">{formatMoney(item.unitPrice)}</td>
                    <td className="py-2 font-mono tabular-nums">
                      {formatMoney(item.quantity * item.unitPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-right font-mono text-sm text-vault-amber tabular-nums">
              Total {formatMoney(selected.totalAmount)}
            </p>
            {actionError ? (
              <p className="text-xs text-vault-danger" role="alert">
                {actionError}
              </p>
            ) : null}
          </div>
        ) : null}
      </Drawer>

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        title="Cancel order?"
        description={
          cancelTarget?.status === 'Confirmed' || cancelTarget?.status === 'Fulfilled'
            ? 'Cancelling will restore reserved stock for Confirmed or Fulfilled orders.'
            : 'This draft order will be cancelled.'
        }
        confirmLabel="Cancel order"
        danger
        onConfirm={async () => {
          if (!cancelTarget) return;
          await runStatus(cancelTarget, 'Cancelled');
          setCancelTarget(null);
        }}
      />

      {createOrderOpen ? (
        <CreateOrderDrawer products={products} onClose={closeCreateOrder} />
      ) : null}
    </div>
  );
};

function OrderStepper({ status }: { status: OrderStatus }) {
  const steps: OrderStatus[] = ['Draft', 'Confirmed', 'Fulfilled'];
  const activeIdx =
    status === 'Cancelled' ? -1 : Math.max(0, steps.indexOf(status));

  if (status === 'Cancelled') {
    return (
      <div className="flex items-center gap-2 text-vault-danger font-mono text-[11px] uppercase">
        <span className="material-symbols-outlined text-[16px]">cancel</span>
        Cancelled
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2" aria-label="Order lifecycle">
      {steps.map((step, i) => (
        <React.Fragment key={step}>
          <div
            className={cx(
              'flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider',
              i <= activeIdx ? 'text-vault-amber' : 'text-vault-muted'
            )}
          >
            <span
              className={cx(
                'h-2 w-2 rounded-full',
                i <= activeIdx ? 'bg-vault-amber' : 'bg-vault-border'
              )}
            />
            {step}
          </div>
          {i < steps.length - 1 ? (
            <div
              className={cx(
                'h-px flex-1 min-w-4 transition-[background-color] duration-300',
                i < activeIdx ? 'bg-vault-amber' : 'bg-vault-hairline'
              )}
            />
          ) : null}
        </React.Fragment>
      ))}
    </div>
  );
}
