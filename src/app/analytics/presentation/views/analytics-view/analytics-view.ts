import { Component } from '@angular/core';
import { AnalyticsStore } from '../../../application/analytics.store';
import { DecimalPipe } from '@angular/common';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-analytics-view',
  standalone: true,
  imports: [DecimalPipe, TranslatePipe],
  templateUrl: './analytics-view.html',
  styleUrl: './analytics-view.css',
})
export class AnalyticsViewComponent {
  constructor(public analyticsStore: AnalyticsStore) {}

  getTrendIcon(trend: string): string {
    if (trend === 'UP') return 'trending_up';
    if (trend === 'DOWN') return 'trending_down';
    return 'trending_flat';
  }

  getTrendClass(trend: string): string {
    if (trend === 'UP') return 'trend-up';
    if (trend === 'DOWN') return 'trend-down';
    return 'trend-flat';
  }
}
