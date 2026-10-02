import React from 'react';
import { cx } from '../../lib/cn';

export interface TableColumn<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => React.ReactNode;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  empty?: React.ReactNode;
  className?: string;
}

export function Table<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  empty,
  className,
}: TableProps<T>) {
  if (rows.length === 0 && empty) return <>{empty}</>;

  return (
    <div className={cx('overflow-x-auto rounded-2xl border border-vault-hairline', className)}>
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 z-[1] bg-vault-raised">
          <tr className="border-b border-vault-hairline">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cx(
                  'py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-vault-secondary font-semibold',
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cx(
                'border-b border-vault-hairline last:border-0 transition-colors duration-120',
                onRowClick
                  ? 'cursor-pointer hover:bg-vault-raised/80'
                  : 'hover:bg-vault-raised/40'
              )}
            >
              {columns.map((col) => (
                <td key={col.key} className={cx('py-3 px-4 text-vault-text', col.className)}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
