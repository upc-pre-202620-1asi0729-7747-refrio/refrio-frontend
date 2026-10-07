import { Component, signal, OnInit, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate.pipe';

interface Shipment {
  id: string;
  product: string;
  route: string;
  temperature: string;
  eta: string;
  status: 'In Transit' | 'Delivered' | 'Delayed';
}

interface CategoryData {
  name: string;
  percentage: number;
  color: string;
}

interface Warehouse {
  name: string;
  onTime: number;
  avgTemp: string;
}

interface ChartPoint {
  label: string;
  inventory: number;
  shipped: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TranslatePipe, DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  activeTab = signal<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  tabs: ('Daily' | 'Weekly' | 'Monthly')[] = ['Daily', 'Weekly', 'Monthly'];

  dailyData: ChartPoint[] = [
    { label: 'Apr 12', inventory: 820, shipped: 310 },
    { label: 'Apr 13', inventory: 750, shipped: 420 },
    { label: 'Apr 14', inventory: 900, shipped: 380 },
    { label: 'Apr 15', inventory: 680, shipped: 290 },
    { label: 'Apr 16', inventory: 1050, shipped: 510 },
    { label: 'Apr 17', inventory: 970, shipped: 440 },
    { label: 'Apr 18', inventory: 830, shipped: 360 },
    { label: 'Apr 19', inventory: 1100, shipped: 590 },
    { label: 'Apr 20', inventory: 990, shipped: 480 },
    { label: 'Apr 21', inventory: 860, shipped: 400 },
    { label: 'Apr 22', inventory: 940, shipped: 520 },
    { label: 'Apr 23', inventory: 780, shipped: 350 },
  ];

  weeklyData: ChartPoint[] = [
    { label: 'Wk 1', inventory: 3200, shipped: 1500 },
    { label: 'Wk 2', inventory: 2800, shipped: 1200 },
    { label: 'Wk 3', inventory: 3500, shipped: 1800 },
    { label: 'Wk 4', inventory: 3100, shipped: 1400 },
    { label: 'Wk 5', inventory: 3800, shipped: 1900 },
    { label: 'Wk 6', inventory: 3400, shipped: 1600 },
  ];

  monthlyData: ChartPoint[] = [
    { label: 'Jan', inventory: 12000, shipped: 5500 },
    { label: 'Feb', inventory: 10500, shipped: 4800 },
    { label: 'Mar', inventory: 14000, shipped: 6200 },
    { label: 'Apr', inventory: 13500, shipped: 5900 },
    { label: 'May', inventory: 15000, shipped: 7100 },
    { label: 'Jun', inventory: 14200, shipped: 6800 },
  ];

  currentChartData = computed(() => {
    switch (this.activeTab()) {
      case 'Weekly': return this.weeklyData;
      case 'Monthly': return this.monthlyData;
      default: return this.dailyData;
    }
  });

  get maxValue(): number {
    const data = this.currentChartData();
    let max = 0;
    for (const d of data) {
      if (d.inventory > max) max = d.inventory;
      if (d.shipped > max) max = d.shipped;
    }
    return max > 0 ? max * 1.1 : 100;
  }

  get yAxisLabels(): number[] {
    const max = this.maxValue;
    return [max, max * 0.75, max * 0.5, max * 0.25, 0].map(v => Math.round(v));
  }

  categories: CategoryData[] = [
    { name: 'Fruits',         percentage: 32, color: '#2563eb' },
    { name: 'Vegetables',     percentage: 24, color: '#3b82f6' },
    { name: 'Dairy',          percentage: 18, color: '#60a5fa' },
    { name: 'Frozen',         percentage: 15, color: '#93c5fd' },
    { name: 'Ready-to-ship',  percentage: 11, color: '#bfdbfe' },
  ];

  warehouses: Warehouse[] = [
    { name: 'Lima Central', onTime: 96, avgTemp: '4°C' },
    { name: 'North Hub',    onTime: 91, avgTemp: '6°C' },
    { name: 'South Hub',    onTime: 94, avgTemp: '5°C' },
  ];

  shipments: Shipment[] = [
    { id: 'FK-1023', product: 'Berries',  route: 'Lima → Surco',       temperature: '3°C',  eta: '12:30 PM', status: 'In Transit' },
    { id: 'FK-1024', product: 'Lettuce',  route: 'Callao → Miraflores', temperature: '5°C',  eta: '1:15 PM',  status: 'Delivered'  },
    { id: 'FK-1025', product: 'Dairy',    route: 'Lima → San Isidro',   temperature: '6°C',  eta: '2:40 PM',  status: 'Delayed'    },
    { id: 'FK-1026', product: 'Chicken',  route: 'Surco → Barranco',    temperature: '2°C',  eta: '3:00 PM',  status: 'In Transit' },
  ];

  filterStatus: 'All' | 'Delivered' | 'In Transit' | 'Delayed' = 'All';

  get filteredShipments() {
    if (this.filterStatus === 'All') return this.shipments;
    return this.shipments.filter(s => s.status === this.filterStatus);
  }

  toggleStatusFilter() {
    if (this.filterStatus === 'All') {
      this.filterStatus = 'In Transit';
    } else if (this.filterStatus === 'In Transit') {
      this.filterStatus = 'Delivered';
    } else if (this.filterStatus === 'Delivered') {
      this.filterStatus = 'Delayed';
    } else {
      this.filterStatus = 'All';
    }
  }

  // SVG Chart helpers
  readonly chartWidth = 700;
  readonly chartHeight = 220;

  ngOnInit(): void {}

  setTab(tab: 'Daily' | 'Weekly' | 'Monthly'): void {
    this.activeTab.set(tab);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'In Transit': return 'badge-primary';
      case 'Delivered':  return 'badge-success';
      case 'Delayed':    return 'badge-danger';
      default:           return 'badge-info';
    }
  }

  // Build SVG polyline points for a data series
  getPolylinePoints(key: 'inventory' | 'shipped'): string {
    const padding = { left: 50, right: 20, top: 10, bottom: 40 };
    const w = this.chartWidth - padding.left - padding.right;
    const h = this.chartHeight - padding.top - padding.bottom;
    const data = this.currentChartData();
    const n = data.length;

    return data.map((d, i) => {
      const x = padding.left + (i / (n - 1)) * w;
      const y = padding.top + h - (d[key] / this.maxValue) * h;
      return `${x},${y}`;
    }).join(' ');
  }

  getAreaPoints(key: 'inventory' | 'shipped'): string {
    const padding = { left: 50, right: 20, top: 10, bottom: 40 };
    const w = this.chartWidth - padding.left - padding.right;
    const h = this.chartHeight - padding.top - padding.bottom;
    const data = this.currentChartData();
    const n = data.length;
    const baseY = padding.top + h;

    const linePoints = data.map((d, i) => {
      const x = padding.left + (i / (n - 1)) * w;
      const y = padding.top + h - (d[key] / this.maxValue) * h;
      return `${x},${y}`;
    });

    const firstX = padding.left;
    const lastX = padding.left + w;

    return `${firstX},${baseY} ${linePoints.join(' ')} ${lastX},${baseY}`;
  }

  getXLabel(i: number): number {
    const padding = { left: 50, right: 20 };
    const w = this.chartWidth - padding.left - padding.right;
    return padding.left + (i / (this.currentChartData().length - 1)) * w;
  }

  getYLabelY(val: number): number {
    const padding = { top: 10, bottom: 40 };
    const h = this.chartHeight - padding.top - padding.bottom;
    return padding.top + h - (val / this.maxValue) * h;
  }

  formatLabel(label: string): string {
    return label.replace(' ', '<br>');
  }
}
