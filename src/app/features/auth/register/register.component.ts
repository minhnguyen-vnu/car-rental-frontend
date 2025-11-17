import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, RegisterRequest } from '../../../core/services/auth.service';
import { ValidationUtils } from '../../../shared/utils/validation.utils';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  // Form data
  username: string = '';
  email: string = '';
  phone: string = '';
  realName: string = '';
  password: string = '';
  confirmPassword: string = '';

  // State
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    // Clear messages
    this.errorMessage = '';
    this.successMessage = '';

    // Validate confirm password
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    // Validate form
    const errors = ValidationUtils.validateRegister({
      username: this.username,
      email: this.email,
      phone: this.phone,
      password: this.password,
      realName: this.realName
    });

    if (errors.length > 0) {
      this.errorMessage = errors[0];
      return;
    }

    // Prepare request
    const request: RegisterRequest = {
      username: this.username.trim(),
      email: this.email.trim(),
      phone: this.phone.trim(),
      realName: this.realName.trim(),
      password: this.password
    };

    // Call API
    this.loading = true;
    this.authService.register(request).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Registration successful! Redirecting to login...';

        // Redirect to login after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Registration failed. Please try again.';
      }
    });
  }
}
