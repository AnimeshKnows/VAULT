import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../ui';
import { ROUTES } from '../../lib/routes';
import { formatMoney } from '../../lib/format';

export interface CommandProduct {
  id: string;
  name: string;
  sku: string;
  unitPrice: number;
}

export interface CommandOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
}

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  products: CommandProduct[];
  orders: CommandOrder[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onClose,
  products,
  orders,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQuery('');
      window.setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const q = query.trim().toLowerCase();
  const productHits = useMemo(() => {
    if (!q) return products.slice(0, 6);
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [products, q]);

  const orderHits = useMemo(() => {
    if (!q) return orders.slice(0, 6);
    return orders
      .filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [orders, q]);

  const go = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <Modal open={open} onClose={onClose} title="Search workspace" size="lg">
      <div className="space-y-4">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products and orders…"
          className="w-full h-11 rounded-lg border border-vault-hairline bg-vault-raised px-3 text-sm text-vault-text placeholder:text-vault-muted vault-focus"
          aria-label="Search products and orders"
        />

        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-vault-muted mb-2">
            Products
          </p>
          {productHits.length === 0 ? (
            <p className="text-xs text-vault-secondary">No products match.</p>
          ) : (
            <ul className="space-y-1">
              {productHits.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-vault-raised vault-focus"
                    onClick={() => go(ROUTES.products)}
                  >
                    <span>
                      <span className="block text-sm text-vault-text">{p.name}</span>
                      <span className="font-mono text-[11px] text-vault-muted">{p.sku}</span>
                    </span>
                    <span className="font-mono text-xs text-vault-secondary tabular-nums">
                      {formatMoney(p.unitPrice)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-vault-muted mb-2">
            Orders
          </p>
          {orderHits.length === 0 ? (
            <p className="text-xs text-vault-secondary">No orders match.</p>
          ) : (
            <ul className="space-y-1">
              {orderHits.map((o) => (
                <li key={o.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-vault-raised vault-focus"
                    onClick={() => go(ROUTES.orders)}
                  >
                    <span>
                      <span className="block font-mono text-sm text-vault-text">{o.orderNumber}</span>
                      <span className="text-[11px] text-vault-muted">{o.customerName}</span>
                    </span>
                    <span className="font-mono text-[10px] uppercase text-vault-secondary">
                      {o.status}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
};
