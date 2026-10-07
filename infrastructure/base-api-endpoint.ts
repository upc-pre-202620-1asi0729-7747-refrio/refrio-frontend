import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * BaseApiEndpoint — typed base class for all API endpoint resources.
 * Each bounded context endpoint should extend this class.
 */
export class BaseApiEndpoint<T> {
  protected http: HttpClient = inject(HttpClient);
  protected serverBasePath: string = environment.serverBasePath;
}
