export type Audience = 'Supervisor' | 'Minorista';
export interface Product {
  id: string;
  name: string;
  category: string;
  stock: string;
  temp: string;
  exp: string;
  warehouse: string;
  status?: string;
  sourceProductId?: string;
}
export interface Batch {
  id: string;
  productId: string;
  quantity: number;
  expirationDate: string;
  receptionDate: string;
  supplier: string;
  location: string;
  status: string;
  audience: Audience;
  notes?: string;
  weight?: string;
}
export interface Allocation {
  batchId: string;
  productId: string;
  quantity: number;
}
export type ShipmentStatus =
  'Preparing' | 'In Transit' | 'Delayed' | 'Awaiting Receipt' | 'Delivered' | 'Rejected';
export interface Shipment {
  id: string;
  product: string;
  route: string;
  temperature: string;
  eta: string;
  status: ShipmentStatus;
  driver: string;
  vehicle: string;
  clientId?: string;
  clientName?: string;
  recipientId?: string;
  allocations?: Allocation[];
  createdAt?: string;
  timeline?: { status: ShipmentStatus; at: string }[];
  receipt?: {
    decision: string;
    notes: string;
    at: string;
    actor: string;
    quantities: Allocation[];
  };
  batchNumber?: string;
}
export interface Incident {
  id: string;
  status: 'IN_REVIEW' | 'ACTION_RECORDED' | 'RESOLVED';
  actor: string;
  cause: string;
  action: string;
  decision: 'inspect' | 'hold';
  openedAt: string;
  updatedAt: string;
  verification?: string;
}
export interface Loss {
  id: string;
  batchId: string;
  productId: string;
  quantity: number;
  cause: string;
  at: string;
  audience: Audience;
}
export interface Telemetry {
  id: string;
  productId: string;
  audience: Audience;
  value: number;
  at: string;
}
export interface Client {
  id: string;
  name: string;
  district?: string;
  recipientId?: string;
}
export function todayKey(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
export function validDate(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
export function requireUnits(value: number): void {
  if (!Number.isSafeInteger(value) || value <= 0)
    throw new Error('Ingresa una cantidad entera mayor que cero.');
}
export function eligible(batch: Batch, today = todayKey()): boolean {
  return (
    batch.quantity > 0 &&
    validDate(batch.expirationDate) &&
    batch.expirationDate > today &&
    !/inmovilizado|bloqueado|descartado|vencido|hold/i.test(batch.status)
  );
}
export function planFefo(
  batches: Batch[],
  productId: string,
  quantity: number,
  today = todayKey(),
): Allocation[] {
  requireUnits(quantity);
  let remaining = quantity;
  const plan: Allocation[] = [];
  const candidates = batches
    .filter((b) => b.audience === 'Supervisor' && b.productId === productId && eligible(b, today))
    .sort((a, b) => a.expirationDate.localeCompare(b.expirationDate) || a.id.localeCompare(b.id));
  for (const batch of candidates) {
    const units = Math.min(remaining, batch.quantity);
    if (units > 0) plan.push({ batchId: batch.id, productId, quantity: units });
    remaining -= units;
    if (!remaining) break;
  }
  if (remaining)
    throw new Error(
      `Stock apto insuficiente: faltan ${remaining} unidades. Registra un lote o reduce la cantidad.`,
    );
  return plan;
}
export function validatePicking(expected: Allocation[], scanned: string[]): void {
  const ids = [...new Set(expected.map((a) => a.batchId))];
  if (ids.length !== scanned.length || ids.some((id, i) => scanned[i] !== id)) {
    throw new Error('El código no coincide con la secuencia FEFO. Verifica los lotes y su orden.');
  }
}
export function nextStatus(current: ShipmentStatus): ShipmentStatus | null {
  return current === 'Preparing'
    ? 'In Transit'
    : current === 'In Transit' || current === 'Delayed'
      ? 'Awaiting Receipt'
      : null;
}
export function validateReceipt(
  shipment: Shipment,
  quantities: Allocation[],
  decision: string,
  notes: string,
): void {
  if (shipment.status !== 'Awaiting Receipt' || shipment.receipt)
    throw new Error('Este envío no está pendiente de recepción.');
  if (!['accepted', 'observed', 'rejected'].includes(decision))
    throw new Error('Selecciona una decisión de recepción.');
  const expected = shipment.allocations ?? [];
  if (!expected.length || quantities.length !== expected.length)
    throw new Error('Falta el detalle de cantidades por lote.');
  expected.forEach((a, i) => {
    const actual = quantities[i];
    if (
      actual.batchId !== a.batchId ||
      actual.productId !== a.productId ||
      !Number.isSafeInteger(actual.quantity) ||
      actual.quantity < 0 ||
      actual.quantity > a.quantity
    ) {
      throw new Error('La cantidad recibida debe estar entre cero y la cantidad enviada por lote.');
    }
    if (decision === 'accepted' && actual.quantity !== a.quantity)
      throw new Error('Para cantidades parciales selecciona Aceptar con observaciones.');
    if (decision === 'rejected' && actual.quantity !== 0)
      throw new Error('Un rechazo no incorpora unidades al inventario.');
  });
  if (decision !== 'accepted' && !notes.trim())
    throw new Error('Describe el motivo de la observación o rechazo.');
  if (decision === 'observed' && !quantities.some((a) => a.quantity > 0))
    throw new Error('Si no recibiste unidades, selecciona Rechazar.');
}
export const statusLabels: Record<ShipmentStatus, string> = {
  Preparing: 'En preparación',
  'In Transit': 'En tránsito',
  Delayed: 'Retrasado',
  'Awaiting Receipt': 'Pendiente de recepción',
  Delivered: 'Recibido',
  Rejected: 'Rechazado',
};
