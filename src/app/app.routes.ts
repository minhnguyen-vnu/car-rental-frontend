import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Public routes
  {
    path: 'login',
    loadComponent: () => import('./features/fleet/search/search.component').then(m => m.SearchComponent)
  },

  // Protected route - Search Vehicle
  {
    path: 'search',
    canActivate: [authGuard],
    loadComponent: () => import('./features/fleet/search/search.component').then(m => m.SearchComponent)
  },

  // Default route (sau khi login thì chuyển về search)
  {
    path: '',
    redirectTo: '/search',
    pathMatch: 'full',
    canActivate: [authGuard]   // bảo vệ luôn cả redirect
  },

  // 404 - vẫn giữ login để người chưa đăng nhập không bị lạc
  {
    path: '**',
    redirectTo: '/login'
  }
];