import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  // ==================================================================
  // 1. PUBLIC ROUTES – Ai cũng vào được (không cần login)
  // ==================================================================
  { path: 'login',    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },

  // Trang kết quả thanh toán – cổng thanh toán redirect về
  {
    path: 'payment-success',
    loadComponent: () => import('./features/payment/result.component').then(m => m.PaymentResultComponent),
    data: { success: true }
  },
  {
    path: 'payment-fail',
    loadComponent: () => import('./features/payment/result.component').then(m => m.PaymentResultComponent),
    data: { success: false }
  },

  // Trang nạp tiền (có thể truy cập từ link bên ngoài)
  { path: 'payment-charge', loadComponent: () => import('./features/payment/charge/charge.component').then(m => m.PaymentChargeComponent) },

  // Chi tiết xe công khai (khách vãng lai xem được)
  {
    path: 'vehicle/:id',
    loadComponent: () => import('./features/fleet/layout/vehicle-detail-layout.component').then(m => m.VehicleDetailLayoutComponent),
    data: { mode: 'customer' }
  },

  // Tạo hợp đồng thuê xe (có thể truy cập từ link xe công khai)
  {
    path: 'rental/create/:vehicleId',
    loadComponent: () => import('./features/rental/create/rental-create.component').then(m => m.RentalCreateComponent),
    data: { title: 'Thuê xe' }
  },


  // ==================================================================
  // 2. USER ROUTES – Chỉ USER đã login mới được vào
  // ==================================================================
  {
    path: '',
    canActivate: [authGuard],
    data: { expectedRole: 'USER' },                     // ← Quan trọng!
    children: [
      { path: '', redirectTo: 'user', pathMatch: 'full' },
      { path: 'search',   loadComponent: () => import('./features/fleet/search/search.component').then(m => m.SearchComponent) },
      { path: 'user',     loadComponent: () => import('./features/fleet/layout/user-main-layout.component').then(m => m.UserMainLayoutComponent) },

      // Các trang chi tiết khi đã login (USER)
      {
        path: 'rental/:id',
        loadComponent: () => import('./features/rental/rental-detail.component').then(m => m.RentalDetailComponent)
      },
    ]
  },


  // ==================================================================
  // 3. ADMIN ROUTES – Chỉ ADMIN mới được vào
  // ==================================================================
  {
    path: 'admin',
    canActivate: [authGuard],
    data: { expectedRole: 'ADMIN' },                    // ← Quan trọng!
    children: [
      {
        path: '',
        loadComponent: () => import('./features/fleet/layout/admin-main-layout.component').then(m => m.AdminMainLayoutComponent)
      },
      {
        path: 'vehicle/:id',
        loadComponent: () => import('./features/fleet/layout/vehicle-detail-layout.component').then(m => m.VehicleDetailLayoutComponent),
        data: { mode: 'admin' }
      },
      {
        path: 'rental/:id',
        loadComponent: () => import('./features/rental/rental-detail.component').then(m => m.RentalDetailComponent)
      },
      // Thêm các trang admin khác ở đây sau này...
    ]
  },


  // ==================================================================
  // 4. FALLBACK
  // ==================================================================
  { path: 'login',    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) }, // đã có ở trên, giữ lại để chắc chắn
  { path: '**',       redirectTo: '' } // sẽ bị guard đẩy về login nếu chưa đăng nhập
];