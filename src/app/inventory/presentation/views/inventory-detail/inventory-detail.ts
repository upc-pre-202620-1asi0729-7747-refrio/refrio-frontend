import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OperationsStore } from '../../../../operations/application/operations.store';
import { IamStore } from '../../../../iam/application/iam.store';
import { eligible, todayKey } from '../../../../operations/domain/operations.rules';

@Component({
  selector: 'app-inventory-detail',
  standalone: true,
  imports: [TranslatePipe, RouterLink, FormsModule],
  templateUrl: './inventory-detail.html',
  styles: [`
    .temperature-reading {
      display: grid;
      gap: 7px;
      margin: 14px 0;
    }
    .temperature-reading label,
    .temperature-reading input {
      font-size: 13px;
      font-weight: 600;
    }
    .temperature-reading input {
      width: 203px;
    }
  `],
})
export class InventoryDetailComponent {
  ops = inject(OperationsStore);
  private iam = inject(IamStore);
  isSupplier = computed(() => this.ops.role() === 'Supervisor');
  supplierName = computed(() => {
    const user = this.iam.currentUser();
    return user?.fullName.trim() || user?.username || '';
  });
  route = inject(ActivatedRoute);
  id = this.route.snapshot.paramMap.get('id') || '';
  product = computed(() => this.ops.products().find((p) => p.id === this.id));
  batches = computed(() => this.ops.batches().filter((b) => b.productId === this.id));
  open = signal(this.route.snapshot.queryParamMap.has('intake'));
  step = signal(0);
  error = signal('');
  success = signal('');
  temperature: number | null = null;
  form = {
    id: '',
    quantity: 1,
    receptionDate: todayKey(),
    expirationDate: '',
    supplier: '',
    location: '',
    notes: '',
  };
  steps = computed(() => [
    this.isSupplier() ? 'OPERATIONS.BATCH_DETAILS' : 'Recepción',
    'Ubicación y control',
    'Confirmación',
  ]);
  eligible = eligible;
  start() {
    this.form = {
      id: 'LOT-' + crypto.randomUUID().slice(0, 8).toUpperCase(),
      quantity: 1,
      receptionDate: todayKey(),
      expirationDate: '',
      supplier: '',
      location: this.product()?.warehouse || '',
      notes: '',
    };
    this.step.set(0);
    this.error.set('');
    this.open.set(true);
  }
  next() {
    this.error.set('');
    if (
      this.step() === 0 &&
      (!this.form.id.trim() ||
        !Number.isSafeInteger(Number(this.form.quantity)) ||
        Number(this.form.quantity) <= 0 ||
        !this.form.receptionDate ||
        !this.form.expirationDate ||
        this.form.expirationDate <= todayKey() ||
        this.form.receptionDate > todayKey())
    ) {
      this.error.set(
        this.isSupplier()
          ? 'OPERATIONS.VALIDATE_BATCH_REGISTRATION'
          : 'Completa un código, cantidad positiva, recepción no futura y vencimiento posterior a hoy.',
      );
      return;
    }
    if (this.step() === 1 && !this.form.location.trim()) {
      this.error.set('OPERATIONS.ENTER_BATCH_LOCATION');
      return;
    }
    if (this.step() === 1 && !this.isSupplier() && !this.form.supplier.trim()) {
      this.error.set('Completa proveedor y ubicación.');
      return;
    }
    this.step.update((s) => s + 1);
  }
  async confirm() {
    try {
      await this.ops.registerBatch({
        ...this.form,
        supplier: this.isSupplier() ? this.supplierName() : this.form.supplier,
        productId: this.id,
        quantity: Number(this.form.quantity),
      });
      this.open.set(false);
      this.success.set(
        this.isSupplier()
          ? 'OPERATIONS.BATCH_REGISTERED'
          : 'Lote recibido. Stock y alertas actualizados.',
      );
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }
  async recordTemperature() {
    try {
      if (
        this.temperature === null ||
        this.temperature === undefined ||
        String(this.temperature).trim() === ''
      )
        throw new Error('Ingresa una temperatura.');
      await this.ops.recordTemperature(this.id, Number(this.temperature));
      this.success.set('Lectura registrada. Consulta las alertas para revisar desviaciones.');
      this.error.set('');
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }
}
