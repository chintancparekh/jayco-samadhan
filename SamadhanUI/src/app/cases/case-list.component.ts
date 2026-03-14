// src/app/cases/case-list.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CaseApiService } from '../shared/api.service';
import { CaseListItem } from '../shared/models';

@Component({
  selector: 'app-case-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="page-header">
    <div><h1>Cases</h1><p>All MSME dispute cases filed on Samadhan Portal</p></div>
    <a routerLink="/cases/new" class="btn btn-primary">+ New Case</a>
  </div>

  <!-- Filters -->
  <div class="card" style="margin-bottom:1rem">
    <div class="filter-bar">
      <div class="form-group" style="margin:0;flex:1;max-width:320px">
        <input class="form-control" [(ngModel)]="search" placeholder="🔍  Search case no, buyer, seller…" />
      </div>
      <div class="form-group" style="margin:0">
        <select class="form-control" [(ngModel)]="statusFilter" (change)="load()">
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="InProcess">In Process</option>
          <option value="Settled">Settled</option>
          <option value="Closed">Closed</option>
        </select>
      </div>
    </div>
  </div>

  <div class="card">
    @if (loading()) { <div class="loading"><div class="spinner"></div></div> }

    @if (!loading()) {
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Case No.</th>
              <th>Buyer</th>
              <th>Seller</th>
              <th>Amount</th>
              <th>Filed Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            @for (c of filtered(); track c.id) {
              <tr>
                <td><a [routerLink]="['/cases', c.id]" style="font-weight:700;color:var(--primary)">{{ c.caseNo }}</a></td>
                <td>{{ c.buyerName }}</td>
                <td>{{ c.sellerName }}</td>
                <td style="font-weight:600">₹{{ c.amount | number }}</td>
                <td>{{ c.filedAt | date:'dd/MM/yyyy' }}</td>
                <td><span class="badge" [ngClass]="badgeCls(c.status)">{{ c.status }}</span></td>
                <td><a [routerLink]="['/cases', c.id]" class="btn btn-ghost btn-sm">View →</a></td>
              </tr>
            }
            @if (filtered().length === 0) {
              <tr><td colspan="7"><div class="empty-state"><div class="icon">📂</div><p>No cases found</p></div></td></tr>
            }
          </tbody>
        </table>
      </div>

      <div class="pagination">
        <button class="btn btn-ghost btn-sm" (click)="prev()" [disabled]="page() === 1">← Prev</button>
        <span>Page {{ page() }}</span>
        <button class="btn btn-ghost btn-sm" (click)="next()" [disabled]="cases().length < pageSize">Next →</button>
      </div>
    }
  </div>
  `,
  styles: [`
    .filter-bar { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }
  `]
})
export class CaseListComponent implements OnInit {
  cases  = signal<CaseListItem[]>([]);
  loading = signal(true);
  page   = signal(1);
  pageSize = 20;
  search = ''; statusFilter = '';

  filtered() {
    if (!this.search) return this.cases();
    const t = this.search.toLowerCase();
    return this.cases().filter(c =>
      c.caseNo.toLowerCase().includes(t) ||
      c.buyerName.toLowerCase().includes(t) ||
      c.sellerName.toLowerCase().includes(t));
  }

  constructor(private api: CaseApiService) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.api.list(this.statusFilter || undefined, this.page(), this.pageSize).subscribe({
      next: r => { this.loading.set(false); if (r.success) this.cases.set(r.data ?? []); },
      error: () => this.loading.set(false)
    });
  }

  prev() { if (this.page() > 1) { this.page.update(p => p - 1); this.load(); } }
  next() { this.page.update(p => p + 1); this.load(); }

  badgeCls(s: string) {
    return { 'badge-pending': s==='Pending', 'badge-inprocess': s==='InProcess', 'badge-settled': s==='Settled', 'badge-closed': s==='Closed' };
  }
}
