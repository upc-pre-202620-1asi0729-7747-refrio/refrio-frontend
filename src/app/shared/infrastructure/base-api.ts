import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * BaseApi — provides HttpClient and base server URL for all infrastructure services.
 */
export class BaseApi {
  protected http: HttpClient = inject(HttpClient);
  protected serverBasePath: string = environment.serverBasePath;
}
