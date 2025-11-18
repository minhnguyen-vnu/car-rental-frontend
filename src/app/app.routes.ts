import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [

   // truy cập http://localhost:4200/test-search
     {
  path: 'test-admin',
  loadComponent: () => import('./features/fleet/layout/admin-main-layout.component')
               .then(m => m.AdminMainLayoutComponent)
},
{
  path: 'test-search',                    
  loadComponent: () => import('./features/fleet/search/search.component')
                       .then(m => m.SearchComponent)
},
{
  path: 'admin/vehicle/:id',
  loadComponent: () => import('./features/fleet/layout/vehicle-detail-layout.component')
               .then(m => m.VehicleDetailLayoutComponent),
  data: { mode: 'admin' }
},

  // Public
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
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
  },

{
  path: 'admin',
  canActivate: [authGuard],
  loadComponent: () => import('./features/fleet/layout/admin-main-layout.component')
               .then(m => m.AdminMainLayoutComponent)
},
// {
//   path: 'admin/vehicle/:id',
//   canActivate: [authGuard],
//   loadComponent: () => import('./features/fleet/layout/vehicle-detail-layout.component')
//                .then(m => m.VehicleDetailLayoutComponent),
//   data: { mode: 'admin' }
// }
];