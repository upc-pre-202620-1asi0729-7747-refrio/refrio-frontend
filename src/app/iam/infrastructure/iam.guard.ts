import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';
import { IamStore } from '../application/iam.store';
import { IamService } from './iam.service';
import { SignInAssembler } from './sign-in-assembler';

@Injectable({ providedIn: 'root' })
export class IamGuard implements CanActivate {
  constructor(
    private router: Router,
    private iam: IamStore,
    private service: IamService,
    private assembler: SignInAssembler,
  ) {}
  canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): boolean | UrlTree | Observable<boolean | UrlTree> {
    if (!localStorage.getItem('refrio_token')) return this.router.createUrlTree(['/sign-in']);
    if (this.iam.currentUser()) return true;
    // Resolve the profile before creating views that depend on the user's role.
    return this.service.getCurrentUser().pipe(
      map((response) => {
        this.iam.currentUser.set(this.assembler.toEntityFromResponse(response));
        this.iam.isAuthenticated.set(true);
        return true;
      }),
      catchError(() => {
        this.iam.signOut();
        return of(this.router.createUrlTree(['/sign-in']));
      }),
    );
  }
}
