import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';

/**
 * IamGuard — protects routes that require authentication (JWT token present).
 * Redirects unauthenticated users to the sign-in page.
 */
@Injectable({ providedIn: 'root' })
export class IamGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): boolean {
    const token = localStorage.getItem('refrio_token');
    if (token) {
      return true;
    }
    this.router.navigate(['/sign-in']);
    return false;
  }
}
