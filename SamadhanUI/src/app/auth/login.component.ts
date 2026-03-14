// src/app/auth/login.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="auth-page">
    <div class="auth-left">
      <div class="brand">
        <div class="brand-icon">⚖</div>
        <h1 class="brand-name">Samadhan</h1>
        <p class="brand-tagline">MSME Dispute Resolution Portal</p>
      </div>
      <div class="auth-illustration">
        <div class="stat-pill"><span>15+</span> Cases Resolved Today</div>
        <div class="stat-pill"><span>₹2.4Cr</span> Amount Settled</div>
        <div class="stat-pill"><span>98%</span> Resolution Rate</div>
      </div>
      <p class="auth-footer-text">Government of India — Ministry of MSME</p>
    </div>

    <div class="auth-right">
      <div class="auth-card">
        <div class="auth-card-header">
          <h2>Welcome back</h2>
          <p>Sign in to your Samadhan account</p>
        </div>

        @if (error()) {
          <div class="alert alert-error">{{ error() }}</div>
        }

        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input class="form-control" type="email" [(ngModel)]="email"
            placeholder="you@example.com" autocomplete="email" />
        </div>

        <div class="form-group">
          <label class="form-label">Password</label>
          <div class="pass-wrap">
            <input class="form-control" [type]="showPass ? 'text' : 'password'"
              [(ngModel)]="password" placeholder="••••••••" autocomplete="current-password" />
            <button type="button" class="pass-toggle" (click)="showPass = !showPass">
              {{ showPass ? '🙈' : '👁' }}
            </button>
          </div>
        </div>

        <!-- Captcha (Image 1) -->
        <div class="captcha-row">
          <div class="captcha-box">
            <span class="captcha-chars">{{ captcha }}</span>
            <button type="button" class="captcha-refresh" (click)="genCaptcha()">↻</button>
          </div>
          <input class="form-control captcha-input" type="text" [(ngModel)]="captchaInput"
            placeholder="Enter captcha" maxlength="6" />
        </div>

        <button class="btn btn-primary btn-full" (click)="submit()" [disabled]="loading()">
          @if (loading()) { <span class="spinner-sm"></span> Signing in… }
          @else { Sign In }
        </button>

        <div class="auth-links">
          <a routerLink="/auth/register">New user? Register</a>
          <a routerLink="/auth/verify">Verify Email</a>
        </div>

        <div class="demo-creds">
          <p>Demo Accounts:</p>
          <button class="btn btn-ghost btn-sm" (click)="fillAdmin()">Admin</button>
          <button class="btn btn-ghost btn-sm" (click)="fillBuyer()">Buyer</button>
          <button class="btn btn-ghost btn-sm" (click)="fillSeller()">Seller</button>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .auth-page { display: flex; min-height: 100vh; font-family: var(--font-body); }

    .auth-left {
      flex: 1; background: linear-gradient(160deg, var(--primary-dark) 0%, var(--primary) 55%, var(--primary-light) 100%);
      display: flex; flex-direction: column; justify-content: center; align-items: flex-start;
      padding: 3rem 3.5rem; color: white; position: relative; overflow: hidden;
    }
    .auth-left::before {
      content: ''; position: absolute; inset: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='1' fill='rgba(255,255,255,.08)'/%3E%3C/svg%3E");
    }
    .brand { margin-bottom: 3rem; position: relative; }
    .brand-icon { font-size: 3rem; margin-bottom: .5rem; }
    .brand-name { font: 700 2.8rem/1 var(--font-display); color: #fff; letter-spacing: -1px; }
    .brand-tagline { color: rgba(255,255,255,.75); font-size: 1rem; margin-top: .5rem; }

    .auth-illustration { display: flex; flex-direction: column; gap: .75rem; position: relative; }
    .stat-pill {
      background: rgba(255,255,255,.15); backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,.2); border-radius: 999px;
      padding: .6rem 1.25rem; color: white; font-size: .9rem; width: fit-content;
    }
    .stat-pill span { font-weight: 700; margin-right: .3rem; }
    .auth-footer-text { position: absolute; bottom: 2rem; left: 3.5rem; font-size: .8rem; color: rgba(255,255,255,.5); }

    .auth-right {
      width: 480px; display: flex; align-items: center; justify-content: center;
      background: var(--bg); padding: 2rem;
    }
    .auth-card { width: 100%; background: white; border-radius: 16px; padding: 2.25rem; box-shadow: var(--shadow-lg); }
    .auth-card-header { margin-bottom: 1.75rem; }
    .auth-card-header h2 { font: 700 1.6rem/1 var(--font-display); color: var(--primary-dark); }
    .auth-card-header p  { color: var(--text-secondary); font-size: .9rem; margin-top: .3rem; }

    .pass-wrap { position: relative; }
    .pass-toggle { position: absolute; right: .75rem; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 1.1rem; }

    .captcha-row { display: flex; gap: .75rem; align-items: stretch; margin-bottom: 1.1rem; }
    .captcha-box {
      flex-shrink: 0; display: flex; align-items: center; gap: .5rem;
      background: #F0F4F8; border: 1.5px dashed var(--border2); border-radius: var(--radius-sm);
      padding: .5rem .85rem;
    }
    .captcha-chars { font: 700 1.4rem/1 monospace; letter-spacing: 6px; color: var(--primary-dark); user-select: none; }
    .captcha-refresh { background: none; border: none; cursor: pointer; font-size: 1.1rem; color: var(--text-secondary); }
    .captcha-input { flex: 1; }

    .btn-full { width: 100%; justify-content: center; padding: .75rem; font-size: 1rem; border-radius: var(--radius-sm); margin-top: .25rem; }
    .spinner-sm { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.4); border-top-color: white; border-radius: 50%; animation: spin .6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .auth-links { display: flex; justify-content: space-between; margin-top: 1.25rem; font-size: .875rem; }
    .auth-links a { color: var(--primary-light); }

    .demo-creds { margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px solid var(--border); }
    .demo-creds p { font-size: .78rem; color: var(--text-muted); margin-bottom: .6rem; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; }
    .demo-creds { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; }
    .demo-creds p { width: 100%; margin-bottom: 0; }

    @media(max-width: 768px) { .auth-left { display: none; } .auth-right { width: 100%; } }
  `]
})
export class LoginComponent {
  email = ''; password = ''; captchaInput = ''; showPass = false;
  captcha = ''; loading = signal(false); error = signal('');

  constructor(private auth: AuthService, private router: Router) { this.genCaptcha(); }

  genCaptcha() {
    const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    this.captcha = Array.from({length: 6}, () => c[Math.floor(Math.random()*c.length)]).join('');
    this.captchaInput = '';
  }

  fillAdmin()  { this.email = 'admin@samadhan.gov.in';  this.password = 'Admin@123'; }
  fillBuyer()  { this.email = 'buyer@msme.com';   this.password = 'Buyer@123'; }
  fillSeller() { this.email = 'seller@msme.com';  this.password = 'Seller@123'; }

  submit() {
    this.error.set('');
    if (!this.email || !this.password) return this.error.set('Please fill in all fields.');
    if (this.captchaInput.toUpperCase() !== this.captcha) {
      this.error.set('Invalid captcha. Please try again.');
      return void this.genCaptcha();
    }
    this.loading.set(true);
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: res => {
        this.loading.set(false);
        if (res.success) this.router.navigate(['/dashboard']);
        else { this.error.set(res.message); this.genCaptcha(); }
      },
      error: () => { this.loading.set(false); this.error.set('Login failed. Check your credentials.'); this.genCaptcha(); }
    });
  }
}
