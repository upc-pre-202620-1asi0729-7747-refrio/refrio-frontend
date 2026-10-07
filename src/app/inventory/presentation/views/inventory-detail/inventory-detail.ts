import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { IamStore } from '../../../../iam/application/iam.store';

@Component({
  selector: 'app-inventory-detail',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './inventory-detail.html',
  styleUrl: './inventory-detail.css'
})
export class InventoryDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private iamStore = inject(IamStore);
  private basePath = environment.serverBasePath;

  product = signal<any>(null);
  batches = signal<any[]>([]);
  
  isAddBatchOpen = signal(false);
  newBatch = { product: '', batchNumber: '', quantity: '', receptionDate: '', supplier: '', expirationDate: '', notes: '' };

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.fetchProduct(id);
        this.fetchBatches(id);
      }
    });
  }

  getEndpoint(): string {
    const role = this.iamStore.currentUser()?.role;
    return role === 'Minorista' ? '/bodeguero-inventory' : '/inventory';
  }

  fetchProduct(id: string) {
    this.http.get<any>(`${this.basePath}${this.getEndpoint()}/${id}`).subscribe({
      next: (data) => this.product.set(data),
      error: (err) => console.error('Failed to load product details', err)
    });
  }

  fetchBatches(productId: string) {
    this.http.get<any[]>(`${this.basePath}/batches?productId=${productId}`).subscribe({
      next: (data) => this.batches.set(data),
      error: (err) => console.error('Failed to load batches', err)
    });
  }
  
  openAddBatch() {
    this.newBatch = { product: this.product()?.name || '', batchNumber: '', quantity: '', receptionDate: '', supplier: '', expirationDate: '', notes: '' };
    this.isAddBatchOpen.set(true);
  }

  closeAddBatch() {
    this.isAddBatchOpen.set(false);
  }

  addBatch() {
    if (!this.newBatch.batchNumber) return;
    
    const newRecord = {
      id: this.newBatch.batchNumber,
      productId: this.product()?.id,
      quantity: this.newBatch.quantity,
      weight: 'N/A',
      receptionDate: this.newBatch.receptionDate,
      expirationDate: this.newBatch.expirationDate,
      supplier: this.newBatch.supplier,
      location: 'N/A',
      status: 'Fresh',
      notes: this.newBatch.notes
    };
    
    this.http.post<any>(`${this.basePath}/batches`, newRecord).subscribe({
      next: (saved) => {
        this.batches.update(list => [...list, saved]);
        this.closeAddBatch();
      },
      error: (err) => console.error('Failed to save batch', err)
    });
  }
}
