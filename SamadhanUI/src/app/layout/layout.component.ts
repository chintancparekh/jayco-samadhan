// src/app/layout/layout.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../shared/auth.service';

interface NavItem { icon: string; label: string; route: string; adminOnly?: boolean; exact?: boolean; }

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
  <div class="app-shell">
    <!-- SIDEBAR -->
    <aside class="sidebar" [class.collapsed]="collapsed()">
      <div class="sidebar-head">
        <div class="sidebar-logo">
          <div class="logo-mark">&#x2696;</div>
          @if (!collapsed()) {
            <div class="logo-words">
              <span class="logo-primary">Samadhan</span>
              <span class="logo-secondary">Portal</span>
            </div>
          }
        </div>
        <button class="collapse-btn" (click)="toggleSidebar()">
          {{ collapsed() ? '>' : '<' }}
        </button>
      </div>

      @if (!collapsed()) {
        <div class="user-chip">
          <div class="avatar">{{ initials() }}</div>
          <div class="user-info-text">
            <span class="uname">{{ auth.user()?.name }}</span>
            <span class="urole">{{ auth.user()?.role }}</span>
          </div>
        </div>
      }

      <nav class="nav">
        @for (item of navItems; track item.route) {
          @if (!item.adminOnly || auth.isAdmin()) {
            <a class="nav-link"
               [routerLink]="item.route"
               routerLinkActive="nav-active"
               [routerLinkActiveOptions]="{exact: !!item.exact}"
               [title]="item.label">
              <span class="nav-icon">{{ item.icon }}</span>
              @if (!collapsed()) {
                <span class="nav-label">{{ item.label }}</span>
              }
            </a>
          }
        }
      </nav>

      <button class="logout-btn" (click)="auth.logout()">
        <span>&#x1F6AA;</span>
        @if (!collapsed()) { <span>Sign Out</span> }
      </button>
    </aside>

    <!-- MAIN -->
    <div class="main-area">
      <header class="topbar">
        <div class="topbar-left">
          <div class="page-breadcrumb">Samadhan Portal</div>
        </div>
        <div class="topbar-right">
          <span class="topbar-date">{{ now | date:'EEE, dd MMM yyyy' }}</span>
          <div class="topbar-avatar">{{ initials() }}</div>
        </div>
      </header>

      <div class="page-body">
        <router-outlet />
      </div>
    </div>
  </div>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-w); background: var(--primary-dark); color: white;
      position: fixed; top: 0; left: 0; height: 100vh;
      display: flex; flex-direction: column; transition: width .25s;
      z-index: 100; overflow: hidden;
    }
    .sidebar.collapsed { width: 64px; }

    .sidebar-head {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1.1rem 1rem; border-bottom: 1px solid rgba(255,255,255,.1); min-height: 64px;
    }
    .sidebar-logo { display: flex; align-items: center; gap: .6rem; overflow: hidden; }
    .logo-mark { font-size: 1.5rem; flex-shrink: 0; }
    .logo-words { display: flex; flex-direction: column; overflow: hidden; }
    .logo-primary  { font: 700 1.05rem/1 var(--font-display); white-space: nowrap; }
    .logo-secondary { font-size: .7rem; color: rgba(255,255,255,.55); text-transform: uppercase; letter-spacing: 1.5px; }

    .collapse-btn {
      background: rgba(255,255,255,.12); border: none; color: white;
      border-radius: 6px; padding: .3rem .55rem; cursor: pointer; font-size: .85rem; flex-shrink: 0;
    }
    .collapse-btn:hover { background: rgba(255,255,255,.2); }

    .user-chip {
      display: flex; align-items: center; gap: .75rem;
      padding: .85rem 1rem; border-bottom: 1px solid rgba(255,255,255,.1);
      overflow: hidden;
    }
    .avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: rgba(255,255,255,.2); display: flex; align-items: center;
      justify-content: center; font: 700 .9rem/1 var(--font-body); flex-shrink: 0;
    }
    .user-info-text { overflow: hidden; }
    .uname { display: block; font: 600 .875rem/1.2 var(--font-body); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .urole { display: block; font-size: .72rem; color: rgba(255,255,255,.55); margin-top: .2rem; }

    .nav { flex: 1; padding: .75rem 0; overflow-y: auto; }
    .nav-link {
      display: flex; align-items: center; gap: .75rem;
      padding: .7rem 1rem; color: rgba(255,255,255,.72); text-decoration: none;
      border-left: 3px solid transparent; transition: all .18s; white-space: nowrap;
    }
    .nav-link:hover { color: white; background: rgba(255,255,255,.1); }
    .nav-active { color: white !important; background: rgba(255,255,255,.15) !important; border-left-color: var(--accent) !important; }
    .nav-icon  { font-size: 1.1rem; width: 20px; text-align: center; flex-shrink: 0; }
    .nav-label { font: 500 .875rem/1 var(--font-body); }

    .logout-btn {
      display: flex; align-items: center; gap: .75rem;
      margin: .75rem; padding: .65rem .85rem;
      background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15);
      color: rgba(255,255,255,.8); border-radius: var(--radius-sm); cursor: pointer;
      font: 500 .875rem/1 var(--font-body); transition: all .18s;
    }
    .logout-btn:hover { background: rgba(192,57,43,.4); color: white; }

    .topbar {
      height: var(--header-h); background: white; border-bottom: 1px solid var(--border);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 1.75rem; position: sticky; top: 0; z-index: 50; box-shadow: 0 1px 3px rgba(0,0,0,.06);
    }
    .page-breadcrumb { font: 600 .875rem/1 var(--font-body); color: var(--text-secondary); }
    .topbar-right { display: flex; align-items: center; gap: 1rem; }
    .topbar-date { font-size: .82rem; color: var(--text-muted); }
    .topbar-avatar {
      width: 34px; height: 34px; border-radius: 50%; background: var(--primary);
      color: white; display: flex; align-items: center; justify-content: center;
      font: 700 .8rem/1 var(--font-body);
    }
  `]
})
export class LayoutComponent {
  collapsed = signal(false);
  now = new Date();

  navItems: NavItem[] = [
    { icon: '🏠', label: 'Dashboard',  route: '/dashboard',  exact: true },
    { icon: '📁', label: 'Cases',      route: '/cases',       exact: true },
    { icon: '➕', label: 'Add Case',   route: '/cases/new' },
    { icon: '❓', label: 'Queries',    route: '/queries' },
    { icon: '📊', label: 'Status',     route: '/status' },
    { icon: '📝', label: 'Grievances', route: '/grievances' },
    { icon: '👥', label: 'Accounts',   route: '/accounts', adminOnly: true },
    { icon: '🔍', label: 'Audit Logs', route: '/audit',    adminOnly: true },
  ];

  toggleSidebar() {
    this.collapsed.set(!this.collapsed());
  }

  initials() {
    const n = this.auth.user()?.name ?? '';
    return n.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  }

  constructor(public auth: AuthService) {}
}