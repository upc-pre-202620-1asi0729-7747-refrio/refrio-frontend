import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OperationsStore } from '../../../../operations/application/operations.store';
import { eligible, todayKey } from '../../../../operations/domain/operations.rules';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [TranslatePipe, FormsModule, RouterLink],
  templateUrl: './inventory-list.html',
})
export class InventoryListComponent {
  ops = inject(OperationsStore);
  router = inject(Router);
  search = signal('');
  modal = signal(false);
  error = signal('');
  editing = '';
  form = { name: '', category: '', warehouse: '', temp: '' };
  filtered = computed(() =>
    this.ops
      .products()
      .filter((p) => p.name.toLowerCase().includes(this.search().toLowerCase())),
  );
  expiring = computed(() =>
    this.ops
      .batches()
      .filter(
        (b) => eligible(b) && Date.parse(b.expirationDate) - Date.parse(todayKey()) <= 7 * 86400000,
      ),
  );
  open(product?: any) {
    this.editing = product?.id || '';
    this.form = product ? { ...product } : { name: '', category: '', warehouse: '', temp: '' };
    this.error.set('');
    this.modal.set(true);
  }
  async save() {
    try {
      const id = await this.ops.saveProduct(this.form, this.editing || undefined);
      this.modal.set(false);
      if (!this.editing) this.router.navigate(['/inventory', id], { queryParams: { intake: 1 } });
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }
}
