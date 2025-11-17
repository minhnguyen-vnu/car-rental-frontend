import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Public routes
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },

  // Default route
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },

  // 404
  {
    path: '**',
    redirectTo: '/login'
  }
];
