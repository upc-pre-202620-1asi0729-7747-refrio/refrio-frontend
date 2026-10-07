import { BaseEntity } from '../../../shared/domain/model/base-entity';

/**
 * ColdChainCertificate — domain entity for BC 05: Cold Chain Traceability & Certification.
 * Represents a verifiable PDF cold certificate for a batch or shipment.
 */
export class ColdChainCertificate extends BaseEntity {
  batchCode: string;
  productName: string;
  shipmentId: string;
  minTemp: number;
  maxTemp: number;
  avgTemp: number;
  startDate: Date;
  endDate: Date;
  warehouseName: string;
  digitalSignature: string;
  qrCode: string;
  pdfUrl?: string;
  losses: number; // kg of product lost (mermas)

  constructor(
    id: number,
    batchCode: string,
    productName: string,
    shipmentId: string,
    minTemp: number,
    maxTemp: number,
    avgTemp: number,
    startDate: Date,
    endDate: Date,
    warehouseName: string,
    digitalSignature: string,
    qrCode: string,
    losses: number = 0,
    pdfUrl?: string
  ) {
    super(id);
    this.batchCode = batchCode;
    this.productName = productName;
    this.shipmentId = shipmentId;
    this.minTemp = minTemp;
    this.maxTemp = maxTemp;
    this.avgTemp = avgTemp;
    this.startDate = startDate;
    this.endDate = endDate;
    this.warehouseName = warehouseName;
    this.digitalSignature = digitalSignature;
    this.qrCode = qrCode;
    this.losses = losses;
    this.pdfUrl = pdfUrl;
  }

  get isCompliant(): boolean {
    return this.maxTemp <= 8; // generic safe threshold for perishables
  }
}
