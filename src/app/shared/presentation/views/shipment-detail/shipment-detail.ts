import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface Shipment {
  id: string;
  product: string;
  route: string;
  temperature: string;
  eta: string;
  status: string;
  driver: string;
  vehicle: string;
  batchNumber?: string;
}

@Component({
  selector: 'app-shipment-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './shipment-detail.html',
  styleUrl: './shipment-detail.css',
})
export class ShipmentDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private basePath = environment.serverBasePath;

  shipment = signal<Shipment | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.http.get<Shipment[]>(`${this.basePath}/shipments`).subscribe({
        next: (data) => {
          const found = data.find(s => s.id === id);
          if (found) {
            this.shipment.set(found);
          } else {
             this.shipment.set({
               id,
               product: 'Producto Desconocido',
               route: 'Ruta Desconocida',
               temperature: '0°C',
               eta: '00:00 AM',
               status: 'In Transit',
               driver: 'Sin asignar',
               vehicle: 'Sin vehículo'
             });
          }
        }
      });
    }
  }

  get origin(): string {
    return this.shipment()?.route?.split(' → ')?.[0] || 'Almacén Origen';
  }

  get destination(): string {
    return this.shipment()?.route?.split(' → ')?.[1] || 'Punto Destino';
  }

  get licensePlate(): string {
    const vehicle = this.shipment()?.vehicle;
    if (vehicle && vehicle.startsWith('REF-')) {
      const num = vehicle.split('-')[1];
      return `ABC-${num}`;
    }
    // Para los nuevos que dicen Pending
    if (this.shipment()?.id) {
      const idNum = this.shipment()?.id?.split('-')[1] || '000';
      return `XYZ-${idNum.substring(0, 3)}`;
    }
    return 'ABC-123';
  }

  get storeManager(): string {
    const dest = this.destination;
    if (dest.includes('Surco')) return `Sr. Manuel Paredes`;
    if (dest.includes('Miraflores')) return `Sra. Carmen Rojas`;
    if (dest.includes('San Isidro')) return `Sr. Luis Castro`;
    if (dest.includes('Chorrillos')) return `Sra. Rosa Mendieta`;
    return `Encargado Local`;
  }
}
