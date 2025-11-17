import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { StorageService } from '../services/storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storageService = inject(StorageService);
  const router = inject(Router);

  // Lấy token
  const token = storageService.getToken();

  // Clone request và thêm token
  const authReq = token
    ? req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
    : req;

  // Xử lý response
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Nếu lỗi 401 hoặc token invalid -> logout
      if (error.status === 401 || error.error?.status?.code === 1003) {
        storageService.clear();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
