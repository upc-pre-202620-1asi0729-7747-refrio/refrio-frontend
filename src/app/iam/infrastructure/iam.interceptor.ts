import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * IamInterceptor — attaches the JWT Bearer token to every outgoing HTTP request.
 * Skips authentication endpoints to avoid token loops.
 */
@Injectable()
export class IamInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem('refrio_token');
    const isAuthEndpoint =
      req.url.includes('/sign-in') || req.url.includes('/sign-up');

    if (token && !isAuthEndpoint) {
      const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
      return next.handle(authReq);
    }

    return next.handle(req);
  }
}
