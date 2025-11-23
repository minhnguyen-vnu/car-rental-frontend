import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { StorageService } from '../services/storage.service';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const storageService = inject(StorageService);
  const router = inject(Router);

  // 1. Kiểm tra đã login chưa (giữ nguyên logic cũ của bạn)
  if (!storageService.isLoggedIn()) {
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  // 2. Lấy user từ StorageService (giả sử bạn có method getCurrentUser())
  const user = storageService.getUser();
  if (!user || !user.role) {
    // Dữ liệu user bị lỗi → bắt đăng nhập lại cho an toàn
    storageService.clear();
    router.navigate(['/login']);
    return false;
  }

  // 3. Tìm expectedRole từ route hiện tại + tất cả các parent (rất quan trọng!)
  let expectedRole: string | undefined;

  let currentRoute: ActivatedRouteSnapshot | null = route;
  while (currentRoute) {
    if (currentRoute.data['expectedRole']) {
      expectedRole = currentRoute.data['expectedRole'] as string;
      break;
    }
    currentRoute = currentRoute.parent;
  }

  // 4. Nếu route yêu cầu role cụ thể mà user không đủ quyền → chặn
  if (expectedRole && user.role !== expectedRole) {
    alert('Bạn không có quyền truy cập trang này!');

    // Redirect về đúng khu vực của user
    if (user.role === 'ADMIN') {
      router.navigate(['/admin']);
    } else if (user.role === 'USER') {
      router.navigate(['/user']);
    } else {
      router.navigate(['/login']);
    }
    return false;
  }

  // 5. Đã login + đủ quyền → cho qua
  return true;
};