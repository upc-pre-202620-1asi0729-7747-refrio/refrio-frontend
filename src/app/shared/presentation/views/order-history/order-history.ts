import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { OperationsStore } from '../../../../operations/application/operations.store';
import { statusLabels } from '../../../../operations/domain/operations.rules';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [TranslatePipe, RouterLink, FormsModule, DatePipe],
  templateUrl: './order-history.html',
})
export class OrderHistoryComponent {
  ops = inject(OperationsStore);
  labels = statusLabels;
  filter = signal('ALL');
  get filtered() {
    return this.ops
      .shipments()
      .filter((s) => this.filter() === 'ALL' || s.status === this.filter());
  }
}
