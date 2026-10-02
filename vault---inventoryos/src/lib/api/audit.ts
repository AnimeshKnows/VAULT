import { apiRequest } from './client';
import type { PagedResult } from './catalog';
import type { StockAdjustment } from '../../types';

export interface AuditLogDto {
  id: string;
  userId?: string | null;
  userEmail?: string | null;
  action: string;
  entityName: string;
  entityId: string;
  details?: string | null;
  timestamp: string;
}

interface StockAdjustDetails {
  sku?: string;
  name?: string;
  delta?: number;
  reason?: string;
  previousStock?: number;
  newStock?: number;
}

export function mapAuditToAdjustment(log: AuditLogDto): StockAdjustment {
  let details: StockAdjustDetails = {};
  if (log.details) {
    try {
      details = JSON.parse(log.details) as StockAdjustDetails;
    } catch {
      details = {};
    }
  }
  const delta = details.delta ?? 0;
  return {
    id: log.id,
    adjustmentNumber: log.id.slice(0, 8).toUpperCase(),
    timestamp: new Date(log.timestamp).toLocaleString(),
    sku: details.sku || '—',
    productName: details.name || log.entityName,
    type: delta >= 0 ? 'Inbound Receipt' : 'Damage Write-off',
    delta,
    previousStock: details.previousStock ?? 0,
    newStock: details.newStock ?? 0,
    reason: details.reason || log.action,
    operatorBadge: log.userEmail || 'System',
  };
}

export async function fetchAuditLogs(pageSize = 50): Promise<StockAdjustment[]> {
  const page = await apiRequest<PagedResult<AuditLogDto>>(
    `/api/audit-logs?page=1&pageSize=${pageSize}&action=StockAdjust`
  );
  return page.items.map(mapAuditToAdjustment);
}
