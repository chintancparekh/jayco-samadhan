// src/app/cases/case-form.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CaseApiService } from '../shared/api.service';
import { CHECKLIST_LABELS } from '../shared/models';

@Component({
  selector: 'app-case-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="page-header">
    <div><h1>File New Case</h1><p>Submit a new MSME dispute case on Samadhan Portal</p></div>
    <a routerLink="/cases" class="btn btn-ghost">← Back</a>
  </div>

  @if (success()) {
    <div class="alert alert-success">{{ success() }} — <a [routerLink]="['/cases', createdId()]">View Case →</a></div>
  }
  @if (error()) { <div class="alert alert-error">{{ error() }}</div> }

  @if (!success()) {
    <!-- Tabs -->
    <div class="tabs">
      @for (t of tabs; track t.key) {
        <button class="tab-btn" [class.active]="activeTab() === t.key" (click)="activeTab.set(t.key)">
          {{ t.label }}
        </button>
      }
    </div>

    <!-- TAB: BUYER -->
    @if (activeTab() === 'buyer') {
      <div class="card">
        <div class="card-title">🏢 Buyer (Applicant Enterprise)</div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Company Name *</label>
            <input class="form-control" [(ngModel)]="f.buyerName" placeholder="Applicant enterprise name" /></div>
          <div class="form-group"><label class="form-label">GST Number *</label>
            <input class="form-control" [(ngModel)]="f.buyerGst" placeholder="27ABCDE1234F1Z5" /></div>
          <div class="form-group"><label class="form-label">SME Category</label>
            <select class="form-control" [(ngModel)]="f.buyerSme">
              <option value="">Select…</option>
              <option>Micro</option><option>Small</option><option>Medium</option>
            </select>
          </div>
          <div class="form-group"><label class="form-label">Jurisdiction</label>
            <input class="form-control" [(ngModel)]="f.buyerJurisdiction" placeholder="State / District" /></div>
          <div class="form-group"><label class="form-label">Phone *</label>
            <input class="form-control" [(ngModel)]="f.buyerPhone" placeholder="10-digit mobile" /></div>
          <div class="form-group"><label class="form-label">Email *</label>
            <input class="form-control" type="email" [(ngModel)]="f.buyerEmail" placeholder="contact@company.com" /></div>
        </div>
        <div class="tab-nav"><button class="btn btn-primary" (click)="activeTab.set('seller')">Next: Seller →</button></div>
      </div>
    }

    <!-- TAB: SELLER -->
    @if (activeTab() === 'seller') {
      <div class="card">
        <div class="card-title">🏪 Seller (Opponent Enterprise)</div>
        <button class="btn btn-ghost btn-sm" style="margin-bottom:1rem" (click)="copyBuyer()">📋 Copy structure from Buyer</button>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Company Name *</label>
            <input class="form-control" [(ngModel)]="f.sellerName" placeholder="Opponent enterprise name" /></div>
          <div class="form-group"><label class="form-label">GST Number *</label>
            <input class="form-control" [(ngModel)]="f.sellerGst" placeholder="GST Number" /></div>
          <div class="form-group"><label class="form-label">SME Category</label>
            <select class="form-control" [(ngModel)]="f.sellerSme">
              <option value="">Select…</option>
              <option>Micro</option><option>Small</option><option>Medium</option>
            </select>
          </div>
          <div class="form-group"><label class="form-label">Jurisdiction</label>
            <input class="form-control" [(ngModel)]="f.sellerJurisdiction" placeholder="State / District" /></div>
          <div class="form-group"><label class="form-label">Phone *</label>
            <input class="form-control" [(ngModel)]="f.sellerPhone" placeholder="10-digit mobile" /></div>
          <div class="form-group"><label class="form-label">Email *</label>
            <input class="form-control" type="email" [(ngModel)]="f.sellerEmail" placeholder="contact@company.com" /></div>
        </div>
        <div class="tab-nav">
          <button class="btn btn-ghost" (click)="activeTab.set('buyer')">← Buyer</button>
          <button class="btn btn-primary" (click)="activeTab.set('case')">Next: Case Info →</button>
        </div>
      </div>
    }

    <!-- TAB: CASE INFO -->
    @if (activeTab() === 'case') {
      <div class="card">
        <div class="card-title">💰 Case / Financial Information</div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Dispute Amount (₹) *</label>
            <input class="form-control" type="number" [(ngModel)]="f.amount" placeholder="e.g. 500000" min="1" /></div>
          <div class="form-group"><label class="form-label">Currency</label>
            <select class="form-control" [(ngModel)]="f.currency">
              <option value="INR">INR – Indian Rupee</option>
              <option value="USD">USD – US Dollar</option>
            </select>
          </div>
          <div class="form-group col-full"><label class="form-label">CPO / Purchase Order Details</label>
            <textarea class="form-control" [(ngModel)]="f.cpoDetails" placeholder="Purchase order details, invoice references…"></textarea>
          </div>
          <div class="form-group"><label class="form-label">Samadhan App No. (Point 17)</label>
            <input class="form-control" [(ngModel)]="f.samadhanAppNo" placeholder="Online application no." /></div>
        </div>
        <div class="tab-nav">
          <button class="btn btn-ghost" (click)="activeTab.set('seller')">← Seller</button>
          <button class="btn btn-primary" (click)="activeTab.set('checklist')">Next: Checklist →</button>
        </div>
      </div>
    }

    <!-- TAB: CHECKLIST (Image 5 – 17 Particulars) -->
    @if (activeTab() === 'checklist') {
      <div class="card">
        <div class="card-title">✅ Document Checklist — 17 Particulars</div>
        <p style="color:var(--text-secondary);font-size:.875rem;margin-bottom:1.25rem">
          As per MSME Facilitation Council requirements. Mark each document submitted.
        </p>
        <div class="checklist-grid">
          @for (lbl of labels; track $index) {
            <label class="check-item">
              <input type="checkbox" [(ngModel)]="cl[$index]" />
              <span class="check-num">{{ $index + 1 }}.</span>
              <span class="check-text">{{ lbl }}</span>
            </label>
          }
        </div>

        <div class="checklist-summary">
          <span class="cl-count">{{ completedCount() }} / 17 documents confirmed</span>
          <div class="cl-bar"><div class="cl-bar-fill" [style.width.%]="(completedCount()/17)*100"></div></div>
        </div>

        <div class="tab-nav">
          <button class="btn btn-ghost" (click)="activeTab.set('case')">← Case Info</button>
          <button class="btn btn-accent" (click)="submit()" [disabled]="submitting()">
            @if (submitting()) { ⏳ Submitting… } @else { 📁 Submit Case }
          </button>
        </div>
      </div>
    }
  }
  `,
  styles: [`
    .tab-nav { display:flex; justify-content:flex-end; gap:.75rem; margin-top:1.5rem; padding-top:1.25rem; border-top:1px solid var(--border); }
    .checklist-summary { margin-top:1.25rem; padding:1rem; background:var(--surface2); border-radius:var(--radius-sm); border:1px solid var(--border); }
    .cl-count { font:600 .875rem/1 var(--font-body); color:var(--primary); display:block; margin-bottom:.6rem; }
    .cl-bar { height:8px; background:var(--border); border-radius:4px; overflow:hidden; }
    .cl-bar-fill { height:100%; background:linear-gradient(90deg,var(--primary-light),var(--success)); border-radius:4px; transition:width .3s; }
  `]
})
export class CaseFormComponent {
  activeTab = signal<string>('buyer');
  submitting = signal(false);
  success = signal(''); error = signal(''); createdId = signal(0);

  tabs = [
    { key: 'buyer',     label: '1. Buyer Details' },
    { key: 'seller',    label: '2. Seller Details' },
    { key: 'case',      label: '3. Case Info' },
    { key: 'checklist', label: '4. Checklist (17)' },
  ];

  labels = CHECKLIST_LABELS;
  cl = new Array(17).fill(false);

  f = {
    buyerName: '', buyerGst: '', buyerSme: '', buyerJurisdiction: '', buyerPhone: '', buyerEmail: '',
    sellerName: '', sellerGst: '', sellerSme: '', sellerJurisdiction: '', sellerPhone: '', sellerEmail: '',
    amount: null as number | null, currency: 'INR', cpoDetails: '', samadhanAppNo: ''
  };

  completedCount() { return this.cl.filter(Boolean).length; }

  copyBuyer() {
    this.f.sellerSme          = this.f.buyerSme;
    this.f.sellerJurisdiction = this.f.buyerJurisdiction;
  }

  constructor(private api: CaseApiService, private router: Router) {}

  submit() {
    this.error.set('');
    if (!this.f.buyerName || !this.f.buyerGst || !this.f.buyerPhone || !this.f.buyerEmail)
      return void this.error.set('Buyer fields: Name, GST, Phone, Email are required.');
    if (!this.f.sellerName || !this.f.sellerGst || !this.f.sellerPhone || !this.f.sellerEmail)
      return void this.error.set('Seller fields: Name, GST, Phone, Email are required.');
    if (!this.f.amount || this.f.amount <= 0)
      return void this.error.set('Dispute amount is required.');

    this.submitting.set(true);

    const body = {
      ...this.f,
      cL1: this.cl[0],  cL2: this.cl[1],  cL3: this.cl[2],  cL4: this.cl[3],
      cL5: this.cl[4],  cL6: this.cl[5],  cL7: this.cl[6],  cL8: this.cl[7],
      cL9: this.cl[8],  cL10: this.cl[9], cL11: this.cl[10], cL12: this.cl[11],
      cL13: this.cl[12], cL14: this.cl[13], cL15: this.cl[14], cL16: this.cl[15], cL17: this.cl[16]
    };

    this.api.create(body).subscribe({
      next: r => {
        this.submitting.set(false);
        if (r.success && r.data) {
          this.success.set(`Case ${r.data.caseNo} filed successfully!`);
          this.createdId.set(r.data.id);
        } else {
          this.error.set(r.message);
        }
      },
      error: () => { this.submitting.set(false); this.error.set('Submission failed. Try again.'); }
    });
  }
}
