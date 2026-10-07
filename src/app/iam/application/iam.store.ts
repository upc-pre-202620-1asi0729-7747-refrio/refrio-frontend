import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../domain/model/user.entity';
import { IamService } from '../infrastructure/iam.service';
import { SignInCommand } from '../domain/model/sign-in.command';
import { SignUpCommand } from '../domain/model/sign-up.command';
import { SignInRequest } from '../infrastructure/sign-in.request';
import { SignUpRequest } from '../infrastructure/sign-up.request';
import { SignInAssembler } from '../infrastructure/sign-in-assembler';

/**
 * IamStore — application state for BC 01: IAM.
 * Manages current user, authentication status, and loading/error states.
 */
@Injectable({ providedIn: 'root' })
export class IamStore {
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(
    private iamService: IamService,
    private assembler: SignInAssembler,
    private router: Router
  ) {
    this.checkStoredSession();
  }

  private checkStoredSession(): void {
    const token = localStorage.getItem('refrio_token');
    if (token) {
      this.isAuthenticated.set(true);
      this.loadCurrentUser();
    }
  }

  signIn(command: SignInCommand): void {
    this.isLoading.set(true);
    this.error.set(null);
    const request = new SignInRequest(command.username, command.password);
    this.iamService.signIn(request).subscribe({
      next: (response) => {
        localStorage.setItem('refrio_token', response.token);
        this.isAuthenticated.set(true);
        this.loadCurrentUser();
        if (response.token === 'mock-jwt-token-bodega') {
          this.router.navigate(['/bodeguero-dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Invalid credentials');
        this.isLoading.set(false);
      },
    });
  }

  signUp(command: SignUpCommand): void {
    this.isLoading.set(true);
    this.error.set(null);
    const request = new SignUpRequest(
      command.username,
      command.email,
      command.password,
      command.firstName,
      command.lastName,
      command.role,
      command.subscriptionPlan,
      command.sede
    );
    this.iamService.signUp(request).subscribe({
      next: () => {
        this.router.navigate(['/sign-in']);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Registration failed');
        this.isLoading.set(false);
      },
    });
  }

  loadCurrentUser(): void {
    this.iamService.getCurrentUser().subscribe({
      next: (response) => {
        const user = this.assembler.toEntityFromResponse(response);
        this.currentUser.set(user);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  signOut(): void {
    localStorage.removeItem('refrio_token');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/sign-in']);
  }
}
