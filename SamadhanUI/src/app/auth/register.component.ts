// src/app/auth/register.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="auth-simple">
    <div class="auth-box">
      <div class="auth-brand">
        <span class="logo-icon">⚖</span>
        <span class="logo-text">Samadhan Portal</span>
      </div>
      <h2>Create Account</h2>
      <p class="sub">Register as a new MSME enterprise user</p>

      @if (success()) {
        <div class="alert alert-success">
          {{ success() }}
          <br><a routerLink="/auth/verify">→ Go to email verification</a>
        </div>
      }
      @if (error()) {
        <div class="alert alert-error">{{ error() }}</div>
      }

      @if (!success()) {
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Full Name *</label>
            <input class="form-control" [(ngModel)]="f.name" placeholder="Your full name" />
          </div>
          <div class="form-group">
            <label class="form-label">Mobile No *</label>
            <input class="form-control" [(ngModel)]="f.mobileNo" placeholder="10-digit number" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Email Address *</label>
          <input class="form-control" type="email" [(ngModel)]="f.email" placeholder="your@email.com" />
        </div>
        <div class="form-group">
          <label class="form-label">GST Number *</label>
          <input class="form-control" [(ngModel)]="f.gstNo" placeholder="e.g. 27ABCDE1234F1Z5" />
        </div>
        <button class="btn btn-primary btn-full" (click)="submit()" [disabled]="loading()">
          @if (loading()) { Processing… } @else { Register }
        </button>
        <p class="auth-link-text">Already have an account? <a routerLink="/auth/login">Login</a></p>
      }
    </div>
  </div>
  `,
  styles: [`
    .auth-simple { min-height:100vh; background:var(--bg); display:flex; align-items:center; justify-content:center; padding:1rem; }
    .auth-box { background:white; border-radius:16px; padding:2.25rem; width:100%; max-width:520px; box-shadow:var(--shadow-lg); }
    .auth-brand { display:flex; align-items:center; gap:.5rem; margin-bottom:1.5rem; }
    .logo-icon { font-size:1.6rem; }
    .logo-text { font: 700 1.2rem/1 var(--font-display); color:var(--primary-dark); }
    h2 { font: 700 1.5rem/1 var(--font-display); color:var(--primary-dark); }
    .sub { color:var(--text-secondary); font-size:.9rem; margin:.3rem 0 1.5rem; }
    .btn-full { width:100%; justify-content:center; padding:.75rem; font-size:.95rem; margin-top:.5rem; }
    .auth-link-text { text-align:center; margin-top:1.25rem; font-size:.875rem; color:var(--text-secondary); }
  `]
})
export class RegisterComponent {
  f = { name: '', email: '', gstNo: '', mobileNo: '' };
  loading = signal(false);
  success = signal('');
  error   = signal('');

  constructor(private auth: AuthService) {}

  submit() {
    this.error.set('');
    if (!this.f.name || !this.f.email || !this.f.gstNo || !this.f.mobileNo)
      return this.error.set('All fields are required.');

    this.loading.set(true);
    this.auth.register(this.f).subscribe({
      next: res => {
        this.loading.set(false);
        console.log('✅ Register response:', res);
        if (res.success) {
          this.success.set(res.message);
        } else {
          this.error.set(res.message);
        }
      },
      error: err => {
        this.loading.set(false);
        console.error('❌ Register error:', err);
        this.error.set('Registration failed. Is the API running?');
      }
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// VERIFY COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="auth-simple">
    <div class="auth-box">
      <div class="auth-brand">
        <span class="logo-icon">⚖</span>
        <span class="logo-text">Samadhan Portal</span>
      </div>
      <h2>Verify Email &amp; Set Password</h2>
      <p class="sub">Enter the token from your registration</p>

      @if (success()) {
        <div class="alert alert-success">
          {{ success() }}
          <br><a routerLink="/auth/login">→ Login now</a>
        </div>
      }
      @if (error()) {
        <div class="alert alert-error">{{ error() }}</div>
      }

      @if (!success()) {
        <div class="form-group">
          <label class="form-label">Email *</label>
          <input class="form-control" type="email"
                 [(ngModel)]="f.email" placeholder="your@email.com" />
        </div>
        <div class="form-group">
          <label class="form-label">Verification Token *</label>
          <input class="form-control"
                 [(ngModel)]="f.token"
                 placeholder="8-character token"
                 style="text-transform:uppercase;letter-spacing:3px;font-weight:700"
                 (input)="f.token = f.token.toUpperCase()" />
        </div>
        <div class="form-group">
          <label class="form-label">New Password * (min 8 characters)</label>
          <input class="form-control" type="password"
                 [(ngModel)]="f.password" placeholder="Create a strong password" />
        </div>
        <button class="btn btn-primary btn-full" (click)="submit()" [disabled]="loading()">
          @if (loading()) { Verifying… } @else { Verify &amp; Activate Account }
        </button>
        <p class="auth-link-text">Back to <a routerLink="/auth/login">Login</a></p>
      }
    </div>
  </div>
  `,
  styles: [`
    .auth-simple { min-height:100vh; background:var(--bg); display:flex; align-items:center; justify-content:center; padding:1rem; }
    .auth-box { background:white; border-radius:16px; padding:2.25rem; width:100%; max-width:480px; box-shadow:var(--shadow-lg); }
    .auth-brand { display:flex; align-items:center; gap:.5rem; margin-bottom:1.5rem; }
    .logo-icon { font-size:1.6rem; }
    .logo-text { font: 700 1.2rem/1 var(--font-display); color:var(--primary-dark); }
    h2 { font: 700 1.5rem/1 var(--font-display); color:var(--primary-dark); }
    .sub { color:var(--text-secondary); font-size:.9rem; margin:.3rem 0 1.5rem; }
    .btn-full { width:100%; justify-content:center; padding:.75rem; margin-top:.5rem; }
    .auth-link-text { text-align:center; margin-top:1.25rem; font-size:.875rem; color:var(--text-secondary); }
  `]
})
export class VerifyComponent {
  f = { email: '', token: '', password: '' };
  loading = signal(false);
  success = signal('');
  error   = signal('');

  constructor(private auth: AuthService, route: ActivatedRoute) {
    route.queryParams.subscribe(p => {
      if (p['email']) this.f.email = p['email'];
      if (p['token']) this.f.token = p['token'].toUpperCase();
    });
  }

  submit() {
    this.error.set('');

    if (!this.f.email || !this.f.token || !this.f.password)
      return this.error.set('All fields are required.');

    if (this.f.password.length < 8)
      return this.error.set('Password must be at least 8 characters.');

    // Token uppercase trim
    this.f.token = this.f.token.trim().toUpperCase();
    this.f.email = this.f.email.trim().toLowerCase();

    console.log('📤 Verify payload:', this.f);

    this.loading.set(true);
    this.auth.verify(this.f).subscribe({
      next: res => {
        this.loading.set(false);
        console.log('✅ Verify response:', res);
        if (res.success) {
          this.success.set(res.message);
        } else {
          this.error.set(res.message); // ← API নো exact message
        }
      },
      error: err => {
        this.loading.set(false);
        console.error('❌ Verify HTTP error:', err);
        this.error.set(err?.message ?? 'Verification failed. Try again.');
      }
    });
  }
}