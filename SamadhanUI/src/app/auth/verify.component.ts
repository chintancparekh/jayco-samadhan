// src/app/auth/verify.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="auth-simple">
    <div class="auth-box">
      <div class="auth-brand"><span class="logo-icon">⚖</span><span class="logo-text">Samadhan Portal</span></div>
      <h2>Verify Email &amp; Set Password</h2>
      <p class="sub">Enter the token from your registration</p>

      @if (success()) {
        <div class="alert alert-success">{{ success() }}<br><a routerLink="/auth/login">→ Login now</a></div>
      }
      @if (error()) { <div class="alert alert-error">{{ error() }}</div> }

      @if (!success()) {
        <div class="form-group">
          <label class="form-label">Email *</label>
          <input class="form-control" type="email" [(ngModel)]="f.email" placeholder="your@email.com" />
        </div>
        <div class="form-group">
          <label class="form-label">Verification Token *</label>
          <input class="form-control" [(ngModel)]="f.token" placeholder="From registration response" style="letter-spacing:4px;font-weight:700;text-transform:uppercase" />
        </div>
        <div class="form-group">
          <label class="form-label">New Password * (min 8 chars)</label>
          <input class="form-control" type="password" [(ngModel)]="f.password" placeholder="Create strong password" />
        </div>
        <button class="btn btn-primary btn-full" (click)="submit()" [disabled]="loading()">
          @if (loading()) { Verifying… } @else { Verify & Activate Account }
        </button>
        <p class="link-p">Back to <a routerLink="/auth/login">Login</a></p>
      }
    </div>
  </div>
  `,
  styles: [`
    .auth-simple { min-height:100vh; background:var(--bg); display:flex; align-items:center; justify-content:center; padding:1rem; }
    .auth-box { background:white; border-radius:16px; padding:2.25rem; width:100%; max-width:460px; box-shadow:var(--shadow-lg); }
    .auth-brand { display:flex; align-items:center; gap:.5rem; margin-bottom:1.5rem; }
    .logo-icon { font-size:1.6rem; }
    .logo-text { font:700 1.2rem/1 var(--font-display); color:var(--primary-dark); }
    h2 { font:700 1.45rem/1.2 var(--font-display); color:var(--primary-dark); }
    .sub { color:var(--text-secondary); font-size:.9rem; margin:.35rem 0 1.5rem; }
    .btn-full { width:100%; justify-content:center; padding:.75rem; margin-top:.5rem; }
    .link-p { text-align:center; margin-top:1.25rem; font-size:.875rem; color:var(--text-secondary); }
  `]
})
export class VerifyComponent {
  f = { email: '', token: '', password: '' };
  loading = signal(false); success = signal(''); error = signal('');

  constructor(private auth: AuthService, route: ActivatedRoute) {
    route.queryParams.subscribe(p => {
      if (p['email']) this.f.email = p['email'];
      if (p['token']) this.f.token = p['token'];
    });
  }

  submit() {
    this.error.set('');
    if (!this.f.email || !this.f.token || !this.f.password) return this.error.set('All fields required.');
    if (this.f.password.length < 8) return this.error.set('Password must be at least 8 characters.');
    this.loading.set(true);
    this.auth.verify(this.f).subscribe({
      next: r => { this.loading.set(false); if (r.success) this.success.set(r.message); else this.error.set(r.message); },
      error: () => { this.loading.set(false); this.error.set('Verification failed.'); }
    });
  }
}
