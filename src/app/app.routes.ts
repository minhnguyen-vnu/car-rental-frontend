// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  // ==================== TEST KHÔNG CẦN LOGIN ====================
  {
    path: 'test-search',
    loadComponent: () => import('./features/fleet/search/search.component')
                 .then(m => m.SearchComponent)
  },
  {
    path: 'test-admin',
    loadComponent: () => import('./features/fleet/layouts/admin-main-layout/admin-main-layout.component')
                 .then(m => m.AdminMainLayoutComponent)
  },

  // ==================== PUBLIC ROUTES ====================
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component')
                 .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component')
                 .then(m => m.RegisterComponent)
  },

  // ==================== ADMIN PROTECTED AREA ====================
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./features/fleet/layouts/admin-main-layout/admin-main-layout.component')
                 .then(m => m.AdminMainLayoutComponent),
    children: [
      // Các tab con sẽ được xử lý trong layout, không cần route ở đây
    ]
  },

  // Chi tiết xe (admin) – có nút Sửa/Xóa
  {
    path: 'admin/vehicle/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/fleet/layouts/vehicle-detail-layout/vehicle-detail-layout.component')
                 .then(m => m.VehicleDetailLayoutComponent),
    data: { mode: 'admin' }
  },

  // ==================== CUSTOMER AREA (sau này mở rộng) ====================
  {
    path: 'search',
    loadComponent: () => import('./features/fleet/search/search.component')
                 .then(m => m.SearchComponent)
  },
