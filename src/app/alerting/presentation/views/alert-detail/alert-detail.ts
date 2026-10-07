import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-alert-detail',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './alert-detail.html',
  styleUrl: './alert-detail.css'
})
export class AlertDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  
  alertId = signal<string>('');
  alertData = signal<any>(null);

  ngOnInit() {
    this.alertId.set(this.route.snapshot.paramMap.get('id') || '');
    if (this.alertId()) {
      this.http.get<any[]>(`${environment.serverBasePath}/alerts`).subscribe({
        next: (data) => {
          const found = data.find(a => a.id === this.alertId());
          if (found) this.alertData.set(found);
        }
      });
    }
  }

  getSeverityClass(severity: string): string {
    switch(severity) {
      case 'Critical': return 'badge-danger';
      case 'Medium': return 'badge-warning';
      default: return 'badge-info';
    }
  }
}
