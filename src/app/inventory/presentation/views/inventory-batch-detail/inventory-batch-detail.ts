import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-inventory-batch-detail',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './inventory-batch-detail.html',
  styleUrl: './inventory-batch-detail.css'
})
export class InventoryBatchDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private basePath = environment.serverBasePath;

  productId = signal<string>('');
  batch = signal<any>(null);
  product = signal<any>(null);
  
  dispatchQuantity: number = 0;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const pId = params.get('id');
      const bId = params.get('batchId');
      if (pId && bId) {
        this.productId.set(pId);
        this.fetchBatch(bId);
        // También podemos obtener el producto (opcional, si es necesario mostrar el nombre del producto)
        // Para simplificar, confiaremos en los datos del batch
      }
    });
  }

  fetchBatch(batchId: string) {
    this.http.get<any>(`${this.basePath}/batches/${batchId}`).subscribe({
      next: (data) => {
        this.batch.set(data);
        this.dispatchQuantity = Number(data.quantity) || 0;
      },
      error: (err) => console.error('Failed to load batch', err)
    });
  }

  decrease() {
    if (this.dispatchQuantity > 0) this.dispatchQuantity--;
  }

  increase() {
    const max = Number(this.batch()?.quantity) || 0;
    if (this.dispatchQuantity < max) this.dispatchQuantity++;
  }

  dispatchAll() {
    this.dispatchQuantity = Number(this.batch()?.quantity) || 0;
  }
}
