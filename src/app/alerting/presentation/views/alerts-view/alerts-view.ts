import { Component, signal, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-alerts-view',
  standalone: true,
  imports: [TranslatePipe, RouterLink],
  templateUrl: './alerts-view.html',
  styleUrl: './alerts-view.css',
})
export class AlertsViewComponent implements OnInit {
  private http = inject(HttpClient);
  private basePath = environment.serverBasePath;
  
  alerts = signal<any[]>([]);

  ngOnInit() {
    this.fetchAlerts();
  }

  fetchAlerts() {
    this.http.get<any[]>(`${this.basePath}/alerts`).subscribe({
      next: (data) => this.alerts.set(data),
      error: (err) => console.error('Failed to load alerts', err)
    });
  }

  getSeverityClass(severity: string): string {
    switch (severity) {
      case 'Critical': return 'badge-danger';
      case 'Medium':   return 'badge-warning';
      case 'Low':      return 'badge-primary';
      default:         return 'badge-info';
    }
  }


}
