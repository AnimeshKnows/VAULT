import React, { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../context/workspaceContext';
import {
  Button,
  Card,
  EmptyState,
  Input,
  PageHeader,
  Skeleton,
  Stat,
} from '../components/ui';
import {
  fetchOrderVolume,
  fetchReportSummary,
  fetchStockValuation,
  type OrderVolumeDay,
  type ReportSummary,
  type StockValuation,
} from '../lib/api/reports';
import { formatMoney, formatNumber } from '../lib/format';
import { friendlyApiMessage } from '../lib/errors';

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const ReportsPage: React.FC = () => {
  const { orders } = useWorkspace();
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [volume, setVolume] = useState<OrderVolumeDay[]>([]);
  const [valuation, setValuation] = useState<StockValuation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableView, setTableView] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, v, val] = await Promise.all([
        fetchReportSummary(),
        fetchOrderVolume(from, to),
        fetchStockValuation(),
      ]);
      setSummary(s);
      setVolume(v);
      setValuation(val);
    } catch (err) {
      setError(friendlyApiMessage(err, 'Failed to load reports'));
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    void load();
  }, [load]);

  const maxBar = Math.max(1, ...volume.map((d) => d.draft + d.confirmed + d.fulfilled));
  const maxVal = Math.max(1, ...(valuation?.categories.map((c) => c.valuation) ?? [1]));

  return (
    <div className="pb-8 space-y-6">
      <PageHeader
        index="S.06"
        label="REPORTS"
        title="Reports"
        description="Summary, order volume, and stock valuation."
        actions={
          <div className="flex flex-wrap gap-2 items-end">
            <Input label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            <Input label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            <Button type="button" size="sm" variant="secondary" withArrow={false} onClick={() => void load()}>
              Refresh
            </Button>
          </div>
        }
      />

      {error ? (
        <EmptyState title="Could not load reports" description={error} actionLabel="Retry" onAction={() => void load()} />
      ) : null}

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-[11px] uppercase tracking-wider text-vault-secondary">Summary</h2>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            withArrow={false}
            onClick={() => {
              if (!summary) return;
              downloadCsv('summary.csv', [
                ['Metric', 'Value'],
                ['Products', String(summary.totalProducts)],
                ['In stock', String(summary.inStockCount)],
                ['Low stock', String(summary.lowStockCount)],
                ['Out of stock', String(summary.outOfStockCount)],
                ['Orders', String(summary.totalOrders)],
                ['Revenue', String(summary.revenue)],
              ]);
            }}
          >
            Export CSV
          </Button>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : summary ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat label="Products" value={summary.totalProducts} animate={false} />
            <Stat label="Orders" value={summary.totalOrders} animate={false} />
            <Stat label="Low stock" value={summary.lowStockCount} animate={false} />
            <Card padding="md">
              <p className="font-mono text-[10px] uppercase text-vault-secondary">Revenue</p>
              <p className="mt-2 text-2xl font-bold text-vault-amber tabular-nums">
                {formatMoney(summary.revenue)}
              </p>
            </Card>
          </div>
        ) : (
          <EmptyState title="No summary" description="No report data yet." />
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <h2 className="font-mono text-[11px] uppercase tracking-wider text-vault-secondary">
            Order volume
          </h2>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              withArrow={false}
              onClick={() => setTableView((v) => !v)}
            >
              {tableView ? 'Chart' : 'Table'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              withArrow={false}
              onClick={() =>
                downloadCsv('order-volume.csv', [
                  ['Date', 'Draft', 'Confirmed', 'Fulfilled', 'Cancelled'],
                  ...volume.map((d) => [
                    d.date,
                    String(d.draft),
                    String(d.confirmed),
                    String(d.fulfilled),
                    String(d.cancelled),
                  ]),
                ])
              }
            >
              Export CSV
            </Button>
          </div>
        </div>
        {loading ? (
          <Skeleton className="h-48 w-full" />
        ) : volume.length === 0 ? (
          <EmptyState title="No volume data" description="Try a wider date range." />
        ) : tableView ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="font-mono text-[10px] uppercase text-vault-muted text-left">
                  <th className="py-2">Date</th>
                  <th>Draft</th>
                  <th>Confirmed</th>
                  <th>Fulfilled</th>
                  <th>Cancelled</th>
                </tr>
              </thead>
              <tbody>
                {volume.map((d) => (
                  <tr key={d.date} className="border-t border-vault-hairline font-mono tabular-nums text-xs">
                    <td className="py-2">{d.date}</td>
                    <td>{d.draft}</td>
                    <td>{d.confirmed}</td>
                    <td>{d.fulfilled}</td>
                    <td>{d.cancelled}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <svg viewBox="0 0 400 160" className="w-full h-48" role="img" aria-label="Order volume">
            {volume.map((d, i) => {
              const total = d.draft + d.confirmed + d.fulfilled;
              const h = (total / maxBar) * 120;
              const gap = 360 / Math.max(volume.length, 1);
              const x = 20 + i * gap;
              const w = Math.max(4, gap - 6);
              return (
                <g key={d.date}>
                  <title>
                    {d.date}: {total}
                  </title>
                  <rect x={x} y={140 - h} width={w} height={h} rx={2} className="fill-vault-amber" />
                  <text
                    x={x + w / 2}
                    y={154}
                    textAnchor="middle"
                    className="fill-vault-muted"
                    style={{ fontSize: 8, fontFamily: 'JetBrains Mono' }}
                  >
                    {d.date.slice(5)}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-[11px] uppercase tracking-wider text-vault-secondary">
            Stock valuation
          </h2>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            withArrow={false}
            onClick={() => {
              if (!valuation) return;
              downloadCsv('stock-valuation.csv', [
                ['Category', 'Products', 'Units', 'Valuation'],
                ...valuation.categories.map((c) => [
                  c.category,
                  String(c.productCount),
                  String(c.totalUnits),
                  String(c.valuation),
                ]),
              ]);
            }}
          >
            Export CSV
          </Button>
        </div>
        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : !valuation || valuation.categories.length === 0 ? (
          <EmptyState title="No valuation data" description="Add products with stock to see valuation." />
        ) : (
          <div className="space-y-3">
            <p className="font-mono text-sm text-vault-amber tabular-nums">
              Total {formatMoney(valuation.totalValuation)}
            </p>
            {valuation.categories
              .slice()
              .sort((a, b) => b.valuation - a.valuation)
              .map((c) => (
                <div key={c.category}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-vault-text">{c.category}</span>
                    <span className="font-mono tabular-nums text-vault-secondary">
                      {formatMoney(c.valuation)} · {formatNumber(c.totalUnits)} units
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-vault-raised overflow-hidden">
                    <div
                      className="h-full bg-vault-amber rounded-full"
                      style={{ width: `${(c.valuation / maxVal) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        )}
      </Card>

      <p className="text-[11px] text-vault-muted font-mono">
        Date range applies to order volume. Summary and valuation use current workspace totals. In-memory
        orders available for export: {orders.length}.
      </p>
    </div>
  );
};
