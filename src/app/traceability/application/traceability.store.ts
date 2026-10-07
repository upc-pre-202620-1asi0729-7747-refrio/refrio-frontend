import { Injectable, signal } from '@angular/core';
import { ColdChainCertificate } from '../domain/model/cold-chain-certificate.entity';

/**
 * TraceabilityStore — application state for BC 05: Cold Chain Traceability & Certification.
 */
@Injectable({ providedIn: 'root' })
export class TraceabilityStore {
  certificates = signal<ColdChainCertificate[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.loadMockCertificates();
  }

  private loadMockCertificates(): void {
    this.certificates.set([
      new ColdChainCertificate(
        1, 'BATCH-001', 'Strawberries', 'FK-1023',
        2.1, 5.8, 3.9,
        new Date('2026-10-04'), new Date('2026-10-05'),
        'Lima Central', 'SIG-A1B2C3', 'QR-001', 1.2
      ),
      new ColdChainCertificate(
        2, 'BATCH-002', 'Lettuce', 'FK-1024',
        1.8, 6.2, 4.1,
        new Date('2026-10-04'), new Date('2026-10-05'),
        'North Hub', 'SIG-D4E5F6', 'QR-002', 0.5
      ),
    ]);
  }

  findByQr(qrCode: string): ColdChainCertificate | undefined {
    return this.certificates().find(c => c.qrCode === qrCode);
  }
}
