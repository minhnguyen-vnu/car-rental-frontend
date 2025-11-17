import { Injectable } from '@angular/core';
import { RequestContext } from '../../shared/models/request-context.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_info';

  constructor() {}

  // Token methods
  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // User info methods
  saveUser(user: RequestContext): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUser(): RequestContext | null {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  removeUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  // Clear all
  clear(): void {
    this.removeToken();
    this.removeUser();
  }

  // Check if logged in
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
