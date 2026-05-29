import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  loading: boolean = false;
  error: string = '';
  success: string = '';

  constructor(private apiService: ApiService) { }

  register() {
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      this.error = 'Please fill in all fields';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const registerData = {
      name: this.name,
      email: this.email,
      password: this.password
    };

    this.apiService.register(registerData).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.success = 'Registration successful! You can now login.';
        console.log('Register response:', response);
        // Reset form
        this.name = '';
        this.email = '';
        this.password = '';
        this.confirmPassword = '';
      },
      error: (error: any) => {
        this.loading = false;
        this.error = error.error?.message || 'Registration failed. Please try again.';
        console.error('Register error:', error);
      }
    });
  }
}
