import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [

   // truy cập http://localhost:4200/test-search
{
  path: 'test-search',                    
  loadComponent: () => import('./features/fleet/search/search.component')
                       .then(m => m.SearchComponent)
},

  // Public
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },

  // Protected
  {
    path: 'search',
    canActivate: [authGuard],
    loadComponent: () => import('./features/fleet/search/search.component').then(m => m.SearchComponent)
  },

  // Default: chưa login → login, đã login → search
  {
    path: '',
    canActivate: [authGuard], 
    loadComponent: () => import('./features/fleet/search/search.component').then(m => m.SearchComponent)
  },

  // 404
  {
    path: '**',
    redirectTo: '/login'
  }
];