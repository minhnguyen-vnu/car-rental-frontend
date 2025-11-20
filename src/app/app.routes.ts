import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  // ================================================================
  // 1. TEST ROUTES – KHÔNG CẦN ĐĂNG NHẬP (để bạn preview giao612 diện)
  // ================================================================
  {
    path: 'test-search',
    loadComponent: () => import('./features/fleet/search/search.component')
      .then(m => m.SearchComponent)
  },
  {
    path: 'test-user',
    loadComponent: () => import('./features/fleet/layout/user-main-layout.component')
      .then(m => m.UserMainLayoutComponent)
  },
  {
    path: 'test-admin',
    loadComponent: () => import('./features/fleet/layout/admin-main-layout.component')
      .then(m => m.AdminMainLayoutComponent)
  },
  {
    path: 'test-payment',
    loadComponent: () => import('./features/payment/charge/charge.component')
      .then(m => m.PaymentChargeComponent)
  },


  // ================================================================
  // 2. PUBLIC ROUTES – AI CŨNG TRUY CẬP ĐƯỢC
  // ================================================================
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

  // Thanh toán – có thể truy cập trực tiếp từ link bên ngoài (email, SMS, QR)
  {
    path: 'payment-charge',
    loadComponent: () => import('./features/payment/charge/charge.component')
      .then(m => m.PaymentChargeComponent)
  },
   {
    path: 'rental/create/:vehicleId',
    // canActivate: [authGuard],
    loadComponent: () => import('./features/rental/create/rental-create.component')
      .then(m => m.RentalCreateComponent),
    data: { title: 'Thuê xe' }
  },
  {
    path: 'vehicle/:id',
    loadComponent: () => import('./features/fleet/layout/vehicle-detail-layout.component')
      .then(m => m.VehicleDetailLayoutComponent),
    data: { mode: 'customer' }
  },
{
    path: 'admin/vehicle/:id',
    // canActivate: [authGuard],
    loadComponent: () => import('./features/fleet/layout/vehicle-detail-layout.component')
      .then(m => m.VehicleDetailLayoutComponent),
    data: { mode: 'admin' }
  },
  {
    path: 'admin/rental/:id',
    // canActivate: [authGuard],
    loadComponent: () => import('./features/rental/rental-detail.component')
      .then(m => m.RentalDetailComponent)
  },


  // ================================================================
  // 3. PROTECTED ROUTES – BẮT BUỘC ĐÃ LOGIN
  // ================================================================
  {
    path: 'search',
    canActivate: [authGuard],
    loadComponent: () => import('./features/fleet/search/search.component')
      .then(m => m.SearchComponent)
  },
 


  // ================================================================
  // 4. ADMIN ROUTES – ĐÃ LOGIN + ROLE ADMIN
  // ================================================================
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./features/fleet/layout/admin-main-layout.component')
      .then(m => m.AdminMainLayoutComponent)
  },
  {
    path: 'admin/vehicle/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/fleet/layout/vehicle-detail-layout.component')
      .then(m => m.VehicleDetailLayoutComponent),
    data: { mode: 'admin' }
  },
  {
    path: 'admin/rental/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/rental/rental-detail.component')
      .then(m => m.RentalDetailComponent)
  },


  // ================================================================
  // 5. DEFAULT & 404
  // ================================================================
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./features/fleet/search/search.component')
      .then(m => m.SearchComponent)
  },
  {
    path: '**',
    redirectTo: 'login'  // chưa login → login, đã login → search (do guard xử lý)
  }
];