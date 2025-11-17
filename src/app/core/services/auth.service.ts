import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import { Router } from '@angular/router';

// Request models
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  phone: string;
  realName: string;
  password: string;
  // role và status không cần gửi lên (backend tự set USER và ACTIVE)
}

export interface UpdateAccountRequest {
  email?: string;
  phone?: string;
  password?: string;
  realName?: string;
}

// Response models
export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
}

export interface Account {
  id: number;
  username: string;
  email: string;
  phone: string;
  realName: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private apiService: ApiService,
    private storageService: StorageService,
    private router: Router
  ) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('/auth/login', request)
      .pipe(
        tap(response => {
          // Lưu token
          this.storageService.saveToken(response.accessToken);

          // Parse JWT để lấy userId và role
          const decoded = this.decodeToken(response.accessToken);

          this.storageService.saveUser({
            userId: decoded?.sub ? parseInt(decoded.sub, 10) : undefined,
            token: response.accessToken,
            role: decoded?.role
          });
        })
      );
  }

  // Register (không tự động login)
  register(request: RegisterRequest): Observable<Account> {
    return this.apiService.post<Account>('/auth/register', request);
  }

  // Update account (cần authenticated)
  updateAccount(request: UpdateAccountRequest): Observable<Account> {
    return this.apiService.put<Account>('/auth/update', request);
  }

  // Logout
  logout(): void {
    this.storageService.clear();
    this.router.navigate(['/login']);
  }

  // Check logged in
  isLoggedIn(): boolean {
    return this.storageService.isLoggedIn();
  }

  // Get current user from storage
  getCurrentUser() {
    return this.storageService.getUser();
  }

  // Decode JWT (sub = userId string)
  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (e) {
      return null;
    }
  }

  // Get userId from token
  getUserId(): number | null {
    const user = this.storageService.getUser();
    return user?.userId || null;
  }

  // Get role from token
  getRole(): string | null {
    const user = this.storageService.getUser();
    return user?.role || null;
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    return this.getRole() === role;
  }

  // Check if admin
  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }
}
