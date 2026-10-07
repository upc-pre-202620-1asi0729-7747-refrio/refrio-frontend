import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { IamStore } from '../../../application/iam.store';
import { SignInCommand } from '../../../domain/model/sign-in.command';
import { TranslationService } from '../../../../shared/services/translation.service';

@Component({
  selector: 'app-sign-in-form',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './sign-in-form.html',
  styleUrl: './sign-in-form.css',
})
export class SignInFormComponent {
  username = signal('');
  password = signal('');
  showPassword = signal(false);

  constructor(
    public iamStore: IamStore,
    public translationService: TranslationService
  ) {}

  onSubmit(): void {
    const command = new SignInCommand(this.username(), this.password());
    this.iamStore.signIn(command);
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }
}
