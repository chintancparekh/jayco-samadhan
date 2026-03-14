// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './shared/auth.service';

const authGuard = () => {
  const auth = inject(AuthService);
  if (auth.isAuth()) return true;
  inject(Router).navigate(['/auth/login']);
  return false;
};

const adminGuard = () => {
  const auth = inject(AuthService);
  return auth.isAuth() && auth.isAdmin();
};

const guestGuard = () => {
  const auth = inject(AuthService);
  if (auth.isAuth()) { inject(Router).navigate(['/dashboard']); return false; }
  return true;
};

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  // Auth pages (no layout)
  {
    path: 'auth',
    children: [
      { path: 'login',    canActivate: [guestGuard], loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent) },
      { path: 'register', canActivate: [guestGuard], loadComponent: () => import('./auth/register.component').then(m => m.RegisterComponent) },
      // Allow /auth/verify even when already logged in so users can verify from dashboard
      { path: 'verify',   loadComponent: () => import('./auth/verify.component').then(m => m.VerifyComponent) },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },

  // Protected pages (with layout)
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    children: [
      { path: 'dashboard',  loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'cases',      loadComponent: () => import('./cases/case-list.component').then(m => m.CaseListComponent) },
      { path: 'cases/new',  loadComponent: () => import('./cases/case-form.component').then(m => m.CaseFormComponent) },
      { path: 'cases/:id',  loadComponent: () => import('./cases/case-detail.component').then(m => m.CaseDetailComponent) },
      { path: 'queries',    loadComponent: () => import('./queries/queries.component').then(m => m.QueriesComponent) },
      { path: 'status',     loadComponent: () => import('./status/status.component').then(m => m.StatusComponent) },
      { path: 'grievances', loadComponent: () => import('./grievances/grievances.component').then(m => m.GrievancesComponent) },
      { path: 'accounts',   canActivate: [adminGuard], loadComponent: () => import('./accounts/accounts.component').then(m => m.AccountsComponent) },
      { path: 'audit',      canActivate: [adminGuard], loadComponent: () => import('./audit/audit.component').then(m => m.AuditComponent) },
    ]
  },

  { path: '**', redirectTo: 'dashboard' }
];
