import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { IamStore } from '../../../application/iam.store';
import { SignUpCommand } from '../../../domain/model/sign-up.command';
import type { UserRole, SubscriptionPlan } from '../../../domain/model/user.entity';
import { TranslationService } from '../../../../shared/services/translation.service';

@Component({
  selector: 'app-sign-up-form',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './sign-up-form.html',
  styleUrl: './sign-up-form.css',
})
export class SignUpFormComponent {
  username = signal('');
  email = signal('');
  password = signal('');
  firstName = signal('');
  lastName = signal('');
  role = signal<UserRole>('Operario');
  subscriptionPlan = signal<SubscriptionPlan>('Basico');
  sede = signal('');
  showPassword = signal(false);

  roles: UserRole[] = ['Supervisor', 'Operario', 'Minorista'];
  plans: SubscriptionPlan[] = ['Basico', 'Profesional', 'Empresarial'];

  constructor(
    public iamStore: IamStore,
    public translationService: TranslationService
  ) {}

  onSubmit(): void {
    const command = new SignUpCommand(
      this.username(),
      this.email(),
      this.password(),
      this.firstName(),
      this.lastName(),
      this.role(),
      this.subscriptionPlan(),
      this.sede()
    );
    this.iamStore.signUp(command);
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }
}
