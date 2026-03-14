// src/app/queries/queries.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { QueryApiService } from '../shared/api.service';
import { CaseQuery } from '../shared/models';

@Component({
  selector: 'app-queries',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <div class="page-header"><div><h1>My Queries</h1><p>All queries you've raised on Samadhan Portal</p></div></div>
  @if (loading()) { <div class="loading"><div class="spinner"></div></div> }
  <div class="card">
    @if (!loading()) {
      @if (queries().length === 0) {
        <div class="empty-state"><div class="icon">❓</div><p>No queries raised yet.</p></div>
      }
      @for (q of queries(); track q.id) {
        <div class="q-item">
          <div class="q-top">
            <div>
              <span class="badge" [ngClass]="q.status === 'Open' ? 'badge-open' : 'badge-replied'">{{ q.status }}</span>
              <span class="q-case-link"><a [routerLink]="['/cases', q.caseId]">Case #{{ q.caseId }}</a></span>
            </div>
            <span class="q-date">{{ q.raisedAt | date:'dd MMM yyyy' }}</span>
          </div>
          <p class="q-text">{{ q.text }}</p>
          @if (q.reply) {
            <div class="q-reply"><strong>Admin Reply:</strong> {{ q.reply }}</div>
          }
        </div>
      }
    }
  </div>
  `,
  styles: [`
    .q-item { padding:1rem 0; border-bottom:1px solid var(--border); }
    .q-item:last-child { border:none; }
    .q-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:.5rem; gap:.75rem; }
    .q-case-link { margin-left:.75rem; font-size:.82rem; color:var(--primary-light); }
    .q-date { font-size:.8rem; color:var(--text-muted); }
    .q-text { font-size:.9rem; color:var(--text-primary); }
    .q-reply { background:#EAF2FF; border-left:3px solid var(--info); padding:.5rem .75rem; border-radius:0 6px 6px 0; font-size:.875rem; margin-top:.5rem; }
  `]
})
export class QueriesComponent implements OnInit {
  queries = signal<CaseQuery[]>([]); loading = signal(true);
  constructor(private api: QueryApiService) {}
  ngOnInit() {
    this.api.mine().subscribe({ next: r => { this.loading.set(false); if (r.success) this.queries.set(r.data ?? []); }, error: () => this.loading.set(false) });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS (Image 3)
// ─────────────────────────────────────────────────────────────────────────────
import { FormsModule } from '@angular/forms';
import { CaseApiService } from '../shared/api.service';
import { CaseListItem } from '../shared/models';

@Component({
  selector: 'app-status',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="page-header"><div><h1>Case Status</h1><p>Track pending &amp; active cases</p></div></div>
  <div class="card" style="margin-bottom:1rem">
    <div style="display:flex;gap:1rem;flex-wrap:wrap">
      @for (s of statuses; track s) {
        <button class="btn" [ngClass]="filter() === s ? 'btn-primary' : 'btn-ghost'" (click)="setFilter(s)">
          {{ s }}
        </button>
      }
    </div>
  </div>
  <div class="card">
    @if (loading()) { <div class="loading"><div class="spinner"></div></div> }
    @if (!loading()) {
      <div class="table-wrap">
        <table>
          <thead><tr><th>Case No.</th><th>Buyer</th><th>Amount</th><th>Filed</th><th>Current Status</th><th>Status</th><th></th></tr></thead>
          <tbody>
            @for (c of cases(); track c.id) {
              <tr>
                <td><strong>{{ c.caseNo }}</strong></td>
                <td>{{ c.buyerName }}</td>
                <td>₹{{ c.amount | number }}</td>
                <td>{{ c.filedAt | date:'dd/MM/yyyy' }}</td>
                <td><span style="font-size:.82rem;color:var(--text-secondary)">{{ c.currentStatus }}</span></td>
                <td><span class="badge" [ngClass]="bc(c.status)">{{ c.status }}</span></td>
                <td><a [routerLink]="['/cases', c.id]" class="btn btn-ghost btn-sm">View →</a></td>
              </tr>
            }
            @if (cases().length === 0) {
              <tr><td colspan="7"><div class="empty-state"><p>No cases for this filter.</p></div></td></tr>
            }
          </tbody>
        </table>
      </div>
    }
  </div>
  `
})
export class StatusComponent implements OnInit {
  cases = signal<CaseListItem[]>([]); loading = signal(true);
  filter = signal('All');
  statuses = ['All', 'Pending', 'InProcess', 'Settled', 'Closed'];

  constructor(private api: CaseApiService) {}
  ngOnInit() { this.load(); }
  setFilter(s: string) { this.filter.set(s); this.load(); }
  load() {
    this.loading.set(true);
    const f = this.filter() === 'All' ? undefined : this.filter();
    this.api.list(f, 1, 50).subscribe({ next: r => { this.loading.set(false); if (r.success) this.cases.set(r.data ?? []); }, error: () => this.loading.set(false) });
  }
  bc(s: string) { return { 'badge-pending': s==='Pending', 'badge-inprocess': s==='InProcess', 'badge-settled': s==='Settled', 'badge-closed': s==='Closed' }; }
}

// ─────────────────────────────────────────────────────────────────────────────
// GRIEVANCES
// ─────────────────────────────────────────────────────────────────────────────
import { GrievanceApiService } from '../shared/api.service';
import { Grievance } from '../shared/models';

@Component({
  selector: 'app-grievances',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="page-header"><div><h1>Grievances</h1><p>Submit and track your grievances</p></div></div>
  <div class="card" style="margin-bottom:1rem;max-width:600px">
    <div class="card-title">📝 Submit New Grievance</div>
    @if (ok()) { <div class="alert alert-success">{{ ok() }}</div> }
    <div class="form-group"><label class="form-label">Subject *</label>
      <input class="form-control" [(ngModel)]="sub" placeholder="Brief subject" /></div>
    <div class="form-group"><label class="form-label">Description *</label>
      <textarea class="form-control" [(ngModel)]="desc" rows="4" placeholder="Describe your grievance…"></textarea></div>
    <button class="btn btn-primary" (click)="submit()" [disabled]="!sub || !desc">Submit</button>
  </div>
  <div class="card">
    <div class="card-title">Your Grievances</div>
    @for (g of list(); track g.id) {
      <div style="padding:.85rem 0;border-bottom:1px solid var(--border)">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong>{{ g.subject }}</strong>
          <span class="badge badge-open">{{ g.status }}</span>
        </div>
        <p style="font-size:.875rem;color:var(--text-secondary);margin-top:.3rem">{{ g.description }}</p>
        <small style="color:var(--text-muted)">{{ g.createdAt | date:'dd MMM yyyy' }}</small>
      </div>
    }
    @if (list().length === 0) { <div class="empty-state"><p>No grievances submitted.</p></div> }
  </div>
  `
})
export class GrievancesComponent implements OnInit {
  list = signal<Grievance[]>([]); sub = ''; desc = ''; ok = signal('');
  constructor(private api: GrievanceApiService) {}
  ngOnInit() { this.api.list().subscribe({ next: r => { if (r.success) this.list.set(r.data ?? []); } }); }
  submit() {
    this.api.create(this.sub, this.desc).subscribe({ next: r => {
      if (r.success && r.data) { this.list.update(l => [r.data!, ...l]); this.sub = ''; this.desc = ''; this.ok.set('Grievance submitted!'); setTimeout(() => this.ok.set(''), 3000); }
    }});
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ACCOUNTS (Admin)
// ─────────────────────────────────────────────────────────────────────────────
import { UserApiService } from '../shared/api.service';
import { UserItem } from '../shared/models';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="page-header"><div><h1>Accounts</h1><p>Manage user roles and access</p></div></div>
  <div class="card">
    @if (loading()) { <div class="loading"><div class="spinner"></div></div> }
    @if (!loading()) {
      <div class="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>GST</th><th>Role</th><th>Verified</th><th>Active</th><th>Actions</th></tr></thead>
          <tbody>
            @for (u of users(); track u.id) {
              <tr>
                <td>{{ u.name }}</td>
                <td style="font-size:.82rem">{{ u.email }}</td>
                <td style="font-size:.82rem">{{ u.gstNo || '—' }}</td>
                <td>
                  <select class="form-control" style="padding:.3rem .6rem;font-size:.82rem" [(ngModel)]="u.role" (change)="updateRole(u)">
                    <option>Admin</option><option>InvestigatorLayer</option><option>Lawyer</option>
                    <option>INAdmin</option><option>ExternalUser</option>
                  </select>
                </td>
                <td style="text-align:center">{{ u.isEmailVerified ? '✅' : '❌' }}</td>
                <td style="text-align:center">{{ u.isActive ? '✅' : '❌' }}</td>
                <td><button class="btn btn-ghost btn-sm" (click)="toggle(u)">{{ u.isActive ? 'Deactivate' : 'Activate' }}</button></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  </div>
  `
})
export class AccountsComponent implements OnInit {
  users = signal<UserItem[]>([]); loading = signal(true);
  constructor(private api: UserApiService) {}
  ngOnInit() { this.api.list().subscribe({ next: r => { this.loading.set(false); if (r.success) this.users.set(r.data ?? []); }, error: () => this.loading.set(false) }); }
  updateRole(u: UserItem) { this.api.updateRole(u.id, u.role).subscribe(); }
  toggle(u: UserItem) { this.api.toggle(u.id).subscribe({ next: () => this.users.update(l => l.map(x => x.id === u.id ? { ...x, isActive: !x.isActive } : x)) }); }
}

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT (Admin – Image 2)
// ─────────────────────────────────────────────────────────────────────────────
import { AuditApiService } from '../shared/api.service';
import { AuditLog } from '../shared/models';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="page-header"><div><h1>Audit Logs</h1><p>Complete system audit trail — LogId, UserId, EventType, RefNo, Status</p></div></div>
  <div class="card">
    @if (loading()) { <div class="loading"><div class="spinner"></div></div> }
    @if (!loading()) {
      <div class="table-wrap">
        <table>
          <thead><tr><th>#</th><th>Timestamp</th><th>User</th><th>Event</th><th>Ref No.</th><th>Status</th><th>Details</th></tr></thead>
          <tbody>
            @for (a of logs(); track a.id) {
              <tr>
                <td style="color:var(--text-muted);font-size:.8rem">{{ a.id }}</td>
                <td style="font-size:.8rem">{{ a.timestamp | date:'dd/MM/yy HH:mm' }}</td>
                <td style="font-size:.82rem">{{ a.userEmail }}</td>
                <td><span class="ev-badge">{{ a.eventType }}</span></td>
                <td style="font-size:.82rem;color:var(--text-secondary)">{{ a.refNo || '—' }}</td>
                <td>
                  <span style="font-weight:700" [style.color]="a.status === 'Success' ? 'var(--success)' : 'var(--danger)'">{{ a.status }}</span>
                </td>
                <td style="font-size:.8rem;color:var(--text-muted)">{{ a.details || '—' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <div class="pagination">
        <button class="btn btn-ghost btn-sm" (click)="prev()" [disabled]="page() === 1">← Prev</button>
        <span>Page {{ page() }}</span>
        <button class="btn btn-ghost btn-sm" (click)="next()">Next →</button>
      </div>
    }
  </div>
  `,
  styles: [`
    .ev-badge { background:var(--surface2); border:1px solid var(--border2); padding:.2rem .55rem; border-radius:5px; font:600 .76rem/1 var(--font-body); color:var(--primary); }
  `]
})
export class AuditComponent implements OnInit {
  logs = signal<AuditLog[]>([]); loading = signal(true); page = signal(1);
  constructor(private api: AuditApiService) {}
  ngOnInit() { this.load(); }
  load() {
    this.loading.set(true);
    this.api.list(this.page()).subscribe({ next: r => { this.loading.set(false); if (r.success) this.logs.set(r.data ?? []); }, error: () => this.loading.set(false) });
  }
  prev() { if (this.page() > 1) { this.page.update(p => p-1); this.load(); } }
  next() { this.page.update(p => p+1); this.load(); }
}
