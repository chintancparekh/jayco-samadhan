// src/app/dashboard/dashboard.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardApiService } from '../shared/api.service';
import { DashboardStats } from '../shared/models';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  @if (auth.user() && !auth.user()!.isEmailVerified) {
    <div class="alert alert-warning" style="margin-bottom:1rem">
      Your email is not verified yet. Some actions may be restricted.
      Please check your inbox for the verification email, or
      <a routerLink="/auth/verify" [queryParams]="{ email: auth.user()!.email }">click here to verify now</a>.
    </div>
  }
  <div class="page-header">
    <div>
      <h1>Dashboard</h1>
      <p>Overview of MSME dispute cases — Samadhan Portal</p>
    </div>
    <a routerLink="/cases/new" class="btn btn-accent">+ File New Case</a>
  </div>

  @if (loading()) {
    <div class="loading"><div class="spinner"></div><p>Loading dashboard…</p></div>
  }

  @if (stats()) {
    <!-- Stat Cards (Image 4) -->
    <div class="stats-grid">
      <div class="stat-card" style="border-color:#2E86C1">
        <div class="stat-label">Total Cases</div>
        <div class="stat-value">{{ stats()!.totalCases }}</div>
      </div>
      <div class="stat-card" style="border-color:#E67E22">
        <div class="stat-label">Active Cases</div>
        <div class="stat-value">{{ stats()!.activeCases }}</div>
      </div>
      <div class="stat-card" style="border-color:#8E44AD">
        <div class="stat-label">In Process</div>
        <div class="stat-value">{{ stats()!.inProcess }}</div>
      </div>
      <div class="stat-card" style="border-color:#E74C3C">
        <div class="stat-label">Total Queries</div>
        <div class="stat-value">{{ stats()!.totalQueries }}</div>
      </div>
      <div class="stat-card" style="border-color:#1E8449">
        <div class="stat-label">Settled</div>
        <div class="stat-value">{{ stats()!.settled }}</div>
      </div>
      <div class="stat-card" style="border-color:#1B4F72">
        <div class="stat-label">Total Amount</div>
        <div class="stat-value" style="font-size:1.4rem">₹{{ formatAmt(stats()!.totalAmount) }}</div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="charts-row">
      <!-- Monthly Bar Chart (Image 3) -->
      <div class="card chart-card">
        <div class="card-title">📈 Monthly Case Trend</div>
        @if (stats()!.monthly.length > 0) {
          <div class="bar-chart">
            @for (m of stats()!.monthly; track m.month) {
              <div class="bar-group">
                <div class="bar-wrap">
                  <div class="bar-fill" [style.height.%]="barPct(m.count)" [title]="m.count + ' cases'">
                    <span class="bar-val">{{ m.count }}</span>
                  </div>
                </div>
                <div class="bar-lbl">{{ m.month }}</div>
              </div>
            }
          </div>
        } @else {
          <div class="empty-state"><p>No data yet</p></div>
        }
      </div>

      <!-- Status Donut -->
      <div class="card chart-card">
        <div class="card-title">🥧 Status Breakdown</div>
        <div class="donut-chart">
          @for (s of stats()!.statusChart; track s.status) {
            <div class="donut-item">
              <div class="donut-dot" [style.background]="statusColor(s.status)"></div>
              <span class="donut-label">{{ s.status }}</span>
              <span class="donut-val">{{ s.count }}</span>
              <div class="donut-bar">
                <div class="donut-bar-fill" [style.width.%]="(s.count / stats()!.totalCases) * 100" [style.background]="statusColor(s.status)"></div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="card">
      <div class="card-title">⚡ Quick Actions</div>
      <div class="quick-actions">
        <a routerLink="/cases/new" class="qa-item">
          <div class="qa-icon" style="background:#EAF2FF;color:#1B4F72">➕</div>
          <span>File New Case</span>
        </a>
        <a routerLink="/cases" class="qa-item">
          <div class="qa-icon" style="background:#EAFAF1;color:#1D6A3A">📁</div>
          <span>View All Cases</span>
        </a>
        <a routerLink="/queries" class="qa-item">
          <div class="qa-icon" style="background:#FEF9E7;color:#9A7D0A">❓</div>
          <span>My Queries</span>
        </a>
        <a routerLink="/status" class="qa-item">
          <div class="qa-icon" style="background:#F9EBEA;color:#C0392B">📊</div>
          <span>Track Status</span>
        </a>
        <a routerLink="/grievances" class="qa-item">
          <div class="qa-icon" style="background:#F5EEF8;color:#7D3C98">📝</div>
          <span>Grievances</span>
        </a>
      </div>
    </div>
  }
  `,
  styles: [`
    .charts-row { display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }

    /* Bar chart */
    .bar-chart { display: flex; align-items: flex-end; gap: .75rem; height: 160px; padding: .5rem 0 0; }
    .bar-group { display: flex; flex-direction: column; align-items: center; gap: .25rem; flex: 1; }
    .bar-wrap  { flex: 1; width: 100%; display: flex; align-items: flex-end; }
    .bar-fill  {
      width: 100%; background: linear-gradient(180deg, var(--primary-light), var(--primary-dark));
      border-radius: 4px 4px 0 0; min-height: 4px; position: relative;
      display: flex; align-items: flex-start; justify-content: center;
      transition: height .4s;
    }
    .bar-val { position: absolute; top: -20px; font: 700 .75rem/1 var(--font-body); color: var(--primary); }
    .bar-lbl  { font-size: .72rem; color: var(--text-muted); white-space: nowrap; }

    /* Donut / bar breakdown */
    .donut-chart { display: flex; flex-direction: column; gap: .75rem; }
    .donut-item  { display: flex; align-items: center; gap: .6rem; }
    .donut-dot   { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .donut-label { font-size: .82rem; flex: 1; color: var(--text-secondary); }
    .donut-val   { font: 700 .875rem/1 var(--font-body); min-width: 24px; text-align: right; }
    .donut-bar   { width: 80px; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
    .donut-bar-fill { height: 100%; border-radius: 3px; transition: width .4s; }

    /* Quick actions */
    .quick-actions { display: flex; gap: .75rem; flex-wrap: wrap; }
    .qa-item {
      display: flex; flex-direction: column; align-items: center; gap: .5rem;
      padding: 1rem 1.25rem; border-radius: var(--radius-sm);
      border: 1.5px solid var(--border); text-decoration: none;
      color: var(--text-primary); transition: all .18s; text-align: center;
      min-width: 90px;
    }
    .qa-item:hover { border-color: var(--primary-light); box-shadow: 0 0 0 3px rgba(46,134,193,.12); transform: translateY(-1px); }
    .qa-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }
    .qa-item span { font: 600 .8rem/1.2 var(--font-body); }
  `]
})
export class DashboardComponent implements OnInit {
  stats = signal<DashboardStats | null>(null);
  loading = signal(true);
  private maxCount = 1;

  constructor(private api: DashboardApiService, public auth: AuthService) {}

  ngOnInit() {
    this.api.stats().subscribe({
      next: r => {
        this.loading.set(false);
        if (r.success && r.data) {
          this.stats.set(r.data);
          this.maxCount = Math.max(...r.data.monthly.map(m => m.count), 1);
        }
      },
      error: () => this.loading.set(false)
    });
  }

  barPct(count: number) { return Math.max((count / this.maxCount) * 100, 3); }

  formatAmt(n: number) {
    if (n >= 10000000) return (n/10000000).toFixed(1) + 'Cr';
    if (n >= 100000)   return (n/100000).toFixed(1)   + 'L';
    return n.toLocaleString('en-IN');
  }

  statusColor(s: string) {
    const map: Record<string,string> = {
      Pending:'#D4AC0D', InProcess:'#2E86C1', Settled:'#1E8449', Closed:'#626567'
    };
    return map[s] ?? '#888';
  }
}
