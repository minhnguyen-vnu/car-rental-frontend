import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, LoginRequest } from '../../../core/services/auth.service';
import { ValidationUtils } from '../../../shared/utils/validation.utils';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  // Form data
  username: string = '';
  password: string = '';

  // State
  loading: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    // Clear previous error
    this.errorMessage = '';

    // Validate
    const errors = ValidationUtils.validateLogin(this.username, this.password);
    if (errors.length > 0) {
      this.errorMessage = errors[0];
      return;
    }

    // Prepare request
    const request: LoginRequest = {
      username: this.username.trim(),
      password: this.password
    };

    // Call API
    this.loading = true;
    this.authService.login(request).subscribe({
      next: (response) => {
        this.loading = false;
        // Login success -> redirect to vehicles
        this.router.navigate(['/vehicles']);
      },
      error: (error) => {
        this.loading = false;
        // Show error message
        this.errorMessage = error.message || 'Login failed. Please try again.';
      }
    });
  }
}
