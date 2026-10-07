import { Routes } from '@angular/router';
import { SignInFormComponent } from './views/sign-in-form/sign-in-form';
import { SignUpFormComponent } from './views/sign-up-form/sign-up-form';

export const iamRoutes: Routes = [
  { path: 'sign-in', component: SignInFormComponent },
  { path: 'sign-up', component: SignUpFormComponent },
];
