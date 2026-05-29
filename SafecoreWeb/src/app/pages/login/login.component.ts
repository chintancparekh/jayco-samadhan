import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  loading: boolean = false;
  error: string = '';
  success: string = '';

  constructor(private apiService: ApiService) { }

  login() {
    if (!this.email || !this.password) {
      this.error = 'Please fill in all fields';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const loginData = {
      email: this.email,
      password: this.password
    };

    this.apiService.login(loginData).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.success = 'Login successful!';
        console.log('Login response:', response);
        // Store token if returned
        if (response.token) {
          localStorage.setItem('authToken', response.token);
        }
      },
      error: (error: any) => {
        this.loading = false;
        this.error = error.error?.message || 'Login failed. Please try again.';
        console.error('Login error:', error);
      }
    });
  }
}
