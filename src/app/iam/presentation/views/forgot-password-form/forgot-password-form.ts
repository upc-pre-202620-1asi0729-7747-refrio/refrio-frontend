import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../shared/services/translation.service';

@Component({
  selector: 'app-forgot-password-form',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './forgot-password-form.html',
  styleUrl: './forgot-password-form.css'
})
export class ForgotPasswordFormComponent {
  email = signal('');
  isSubmitting = signal(false);

  constructor(public translationService: TranslationService) {}

  onSubmit() {
    if (!this.email()) return;
    this.isSubmitting.set(true);
    setTimeout(() => {
      this.isSubmitting.set(false);
      alert('Reset link sent to ' + this.email());
    }, 1500);
  }
}
