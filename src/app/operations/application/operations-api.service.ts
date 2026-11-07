import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IamStore } from '../../iam/application/iam.store';
import type { OperationsDatabase } from '../domain/operations-database';

function emptyDatabase(): OperationsDatabase {
  return {
    inventory: [],
    'bodeguero-inventory': [],
    batches: [],
    shipments: [],
    clients: [],
    incidents: [],
    losses: [],
    telemetry: [],
    events: [],
  };
}

@Injectable({ providedIn: 'root' })
export class OperationsApiService {
  private readonly http = inject(HttpClient);
  private readonly iam = inject(IamStore);
  private readonly endpoint = environment.serverBasePath + '/operations';
  readonly data = signal(emptyDatabase());
  readonly error = signal('');
  readonly loading = signal(true);
  readonly saving = signal(false);
  private version = 0;

  constructor() {
    effect(() => {
      const user = this.iam.currentUser();
      this.version++;
      this.data.set(emptyDatabase());
      this.error.set('');
      this.loading.set(!!user);
      if (user) untracked(() => void this.refresh());
    });
    const timer = setInterval(() => void this.refresh(), 5000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  private async refresh(): Promise<void> {
    if (!this.iam.currentUser() || this.saving()) return;
    const version = ++this.version;
    try {
      const data = await firstValueFrom(this.http.get<OperationsDatabase>(this.endpoint));
      if (version === this.version) {
        this.data.set(data);
        this.error.set('');
      }
    } catch {
      if (version === this.version)
        this.error.set('No se pudo consultar la API. Comprueba que npm run api esté activo.');
    } finally {
      if (version === this.version) this.loading.set(false);
    }
  }

  async execute<T>(command: string, args: unknown[]): Promise<T> {
    if (this.loading()) throw new Error('Espera a que se carguen los datos.');
    if (this.saving()) throw new Error('Hay una operación en curso.');
    this.saving.set(true);
    const version = ++this.version;
    try {
      const response = await firstValueFrom(
        this.http.post<{ result: T; data: OperationsDatabase }>(this.endpoint + '/' + command, {
          args,
        }),
      );
      if (version === this.version) {
        this.data.set(response.data);
        this.error.set('');
      }
      return response.result;
    } catch (error) {
      throw new Error(
        error instanceof HttpErrorResponse && error.error?.message
          ? error.error.message
          : 'La API no confirmó el guardado. Consulta el estado antes de reintentar.',
      );
    } finally {
      this.saving.set(false);
    }
  }
}
