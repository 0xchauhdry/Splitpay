import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { canActivate } from 'src/services/auth/auth.guard';
import { PageNotFoundComponent } from '../shared/components/page-not-found/page-not-found.component';

export const ROUTES: Routes = [
  { path: '', redirectTo : 'home', pathMatch : 'full' },
  { path: 'home',
    canActivate: [canActivate],
    loadChildren: () => import('./home/home.routes').then(m => m.HOME_ROUTES) },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: '**', component: PageNotFoundComponent },
];
