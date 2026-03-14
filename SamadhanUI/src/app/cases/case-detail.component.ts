// src/app/cases/case-detail.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CaseApiService, QueryApiService } from '../shared/api.service';
import { AuthService } from '../shared/auth.service';
import { CaseDetail, CaseQuery, CHECKLIST_LABELS } from '../shared/models';

@Component({
  selector: 'app-case-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  @if (loading()) { <div class="loading"><div class="spinner"></div></div> }

  @if (c()) {
    <div class="page-header">
      <div>
        <h1>{{ c()!.caseNo }}</h1>
        <p>Invoice: {{ c()!.invoiceNo }} &nbsp;·&nbsp; Filed: {{ c()!.filedAt | date:'dd MMM yyyy' }}</p>
      </div>
      <div style="display:flex;gap:.75rem;align-items:center">
        <span class="badge badge-lg" [ngClass]="badgeCls(c()!.status)">{{ c()!.status }}</span>
        <a routerLink="/cases" class="btn btn-ghost btn-sm">← All Cases</a>
      </div>
    </div>

    @if (msg()) { <div class="alert alert-success">{{ msg() }}</div> }

    <!-- Tabs -->
    <div class="tabs">
      @for (t of tabs; track t) {
        <button class="tab-btn" [class.active]="tab() === t" (click)="tab.set(t)">{{ t }}</button>
      }
      @if (auth.isAdmin()) {
        <button class="tab-btn" [class.active]="tab() === 'Update Status'" (click)="tab.set('Update Status')">Update Status</button>
      }
    </div>

    <!-- Case Info -->
    @if (tab() === 'Case Info') {
      <div class="two-col">
        <div class="card">
          <div class="card-title">🏢 Buyer</div>
          <div class="info-list">
            <div class="info-row"><span>Name</span><strong>{{ c()!.buyerName }}</strong></div>
            <div class="info-row"><span>GST</span><strong>{{ c()!.buyerGst }}</strong></div>
            <div class="info-row"><span>SME</span><strong>{{ c()!.buyerSme || '—' }}</strong></div>
            <div class="info-row"><span>Jurisdiction</span><strong>{{ c()!.buyerJurisdiction || '—' }}</strong></div>
            <div class="info-row"><span>Phone</span><strong>{{ c()!.buyerPhone }}</strong></div>
            <div class="info-row"><span>Email</span><strong>{{ c()!.buyerEmail }}</strong></div>
          </div>
        </div>
        <div class="card">
          <div class="card-title">🏪 Seller</div>
          <div class="info-list">
            <div class="info-row"><span>Name</span><strong>{{ c()!.sellerName }}</strong></div>
            <div class="info-row"><span>GST</span><strong>{{ c()!.sellerGst }}</strong></div>
            <div class="info-row"><span>SME</span><strong>{{ c()!.sellerSme || '—' }}</strong></div>
            <div class="info-row"><span>Jurisdiction</span><strong>{{ c()!.sellerJurisdiction || '—' }}</strong></div>
            <div class="info-row"><span>Phone</span><strong>{{ c()!.sellerPhone }}</strong></div>
            <div class="info-row"><span>Email</span><strong>{{ c()!.sellerEmail }}</strong></div>
          </div>
        </div>
      </div>
      <div class="card" style="margin-top:1rem">
        <div class="card-title">💰 Financial &amp; CPO</div>
        <div class="info-list three-col">
          <div class="info-row"><span>Amount</span><strong>₹{{ c()!.amount | number }} {{ c()!.currency }}</strong></div>
          <div class="info-row"><span>Samadhan App No.</span><strong>{{ c()!.samadhanAppNo || '—' }}</strong></div>
          <div class="info-row"><span>CPO Details</span><strong>{{ c()!.cpoDetails || '—' }}</strong></div>
        </div>
      </div>
    }

    <!-- Checklist (Image 5) -->
    @if (tab() === 'Checklist') {
      <div class="card">
        <div class="card-title">✅ Document Checklist — 17 Particulars</div>
        <div style="margin-bottom:1rem">
          <span class="cl-badge">{{ c()!.checklist.completedCount }} / 17 confirmed</span>
        </div>
        <div class="checklist-grid">
          @for (lbl of labels; track $index) {
            <div class="check-item" [style.opacity]="clVal($index) ? '1' : '.65'">
              <span style="font-size:1.1rem">{{ clVal($index) ? '✅' : '❌' }}</span>
              <span class="check-num">{{ $index + 1 }}.</span>
              <span class="check-text">{{ lbl }}</span>
            </div>
          }
        </div>
      </div>
    }

    <!-- Queries (Image 2) -->
    @if (tab() === 'Queries') {
      <div class="card">
        <div class="card-title">💬 Queries &amp; Communication</div>

        <div class="query-form">
          <textarea class="form-control" [(ngModel)]="newQ" rows="3" placeholder="Type your query about this case…"></textarea>
          <div class="form-row" style="margin-top:.5rem">
            <input class="form-control" [(ngModel)]="phoneNote" placeholder="📞 Phone note (optional)" />
            <input class="form-control" [(ngModel)]="emailNote" placeholder="📧 Email note (optional)" />
          </div>
          <button class="btn btn-primary btn-sm" style="margin-top:.75rem" (click)="addQuery()" [disabled]="!newQ.trim()">
            Submit Query
          </button>
        </div>

        <div class="query-list">
          @for (q of c()!.queries; track q.id) {
            <div class="query-card">
              <div class="query-header">
                <span class="badge" [ngClass]="q.status === 'Open' ? 'badge-open' : 'badge-replied'">{{ q.status }}</span>
                <span style="font-size:.8rem;color:var(--text-muted)">{{ q.raisedAt | date:'dd MMM yyyy, hh:mm a' }}</span>
              </div>
              <p class="query-text">{{ q.text }}</p>
              @if (q.phoneNote) { <div class="comm-note phone">📞 {{ q.phoneNote }}</div> }
              @if (q.emailNote) { <div class="comm-note email">📧 {{ q.emailNote }}</div> }

              @if (q.reply) {
                <div class="query-reply">
                  <strong>Reply:</strong> {{ q.reply }}
                  <span style="font-size:.78rem;color:var(--text-muted);margin-left:.5rem">{{ q.repliedAt | date:'dd/MM/yyyy' }}</span>
                </div>
              }
              @if (!q.reply && auth.isAdmin()) {
                <div class="reply-row">
                  <input class="form-control" [(ngModel)]="replyMap[q.id]" placeholder="Write reply…" />
                  <button class="btn btn-primary btn-sm" (click)="reply(q)" [disabled]="!replyMap[q.id]">Reply</button>
                </div>
              }
            </div>
          }
          @if (c()!.queries.length === 0) {
            <div class="empty-state"><div class="icon">💬</div><p>No queries yet. Be the first to raise one.</p></div>
          }
        </div>
      </div>
    }

    <!-- History -->
    @if (tab() === 'History') {
      <div class="card">
        <div class="card-title">📊 Status History</div>
        <div class="timeline">
          @for (h of c()!.history; track h.changedAt) {
            <div class="tl-item">
              <div class="tl-dot"></div>
              <div class="tl-body">
                <span class="badge" [ngClass]="badgeCls(h.status)">{{ h.status }}</span>
                @if (h.remarks) { <p>{{ h.remarks }}</p> }
                <small>{{ h.changedAt | date:'dd MMM yyyy, hh:mm a' }}</small>
              </div>
            </div>
          }
        </div>
      </div>
    }

    <!-- Update Status (Admin) -->
    @if (tab() === 'Update Status' && auth.isAdmin()) {
      <div class="card" style="max-width:520px">
        <div class="card-title">🔄 Update Case Status</div>
        <div class="form-group">
          <label class="form-label">New Status</label>
          <select class="form-control" [(ngModel)]="newStatus">
            <option value="Pending">Pending</option>
            <option value="InProcess">In Process</option>
            <option value="Settled">Settled</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Remarks</label>
          <textarea class="form-control" [(ngModel)]="statusRemark" rows="3" placeholder="Add remarks…"></textarea>
        </div>
        <button class="btn btn-primary" (click)="updateStatus()" [disabled]="!newStatus">Update Status</button>
      </div>
    }
  }
  `,
  styles: [`
    .two-col { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
    .badge-lg { font-size:.9rem; padding:.4rem 1rem; }
    .info-list { display:flex; flex-direction:column; gap:0; }
    .info-row { display:flex; justify-content:space-between; align-items:baseline; padding:.5rem 0; border-bottom:1px solid var(--border); font-size:.875rem; }
    .info-row:last-child { border:none; }
    .info-row span { color:var(--text-secondary); }
    .info-row strong { color:var(--text-primary); text-align:right; max-width:60%; word-break:break-all; }
    .three-col { display:grid; grid-template-columns:1fr 1fr 1fr; gap:0; }
    .cl-badge { background:var(--primary); color:white; padding:.3rem .9rem; border-radius:999px; font:600 .82rem/1 var(--font-body); }
    .query-form { background:var(--surface2); border-radius:var(--radius-sm); padding:1rem; margin-bottom:1.25rem; border:1px solid var(--border); }
    .query-list { display:flex; flex-direction:column; gap:.75rem; }
    .query-card { border:1px solid var(--border); border-radius:var(--radius-sm); padding:1rem; }
    .query-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:.5rem; }
    .query-text { font-size:.9rem; color:var(--text-primary); margin:.4rem 0; }
    .comm-note { font-size:.82rem; padding:.3rem .7rem; border-radius:4px; margin:.25rem 0; }
    .comm-note.phone { background:#F0FFF4; color:#276749; border-left:3px solid var(--success); }
    .comm-note.email { background:#EAF2FF; color:#1A5276; border-left:3px solid var(--info); }
    .query-reply { background:#EBF8FF; border-left:3px solid var(--info); padding:.5rem .75rem; border-radius:0 6px 6px 0; font-size:.875rem; margin-top:.5rem; }
    .reply-row { display:flex; gap:.5rem; margin-top:.75rem; }
    .reply-row input { flex:1; }
  `]
})
export class CaseDetailComponent implements OnInit {
  c = signal<CaseDetail | null>(null);
  loading = signal(true);
  msg = signal('');
  tab = signal<string>('Case Info');
  tabs = ['Case Info', 'Checklist', 'Queries', 'History'];
  labels = CHECKLIST_LABELS;

  newQ = ''; phoneNote = ''; emailNote = '';
  newStatus = ''; statusRemark = '';
  replyMap: Record<number, string> = {};

  constructor(
    private route: ActivatedRoute,
    private caseApi: CaseApiService,
    private queryApi: QueryApiService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    this.caseApi.get(id).subscribe({
      next: r => { this.loading.set(false); if (r.success && r.data) this.c.set(r.data); },
      error: () => this.loading.set(false)
    });
  }

  clVal(i: number) {
    const keys = ['cL1','cL2','cL3','cL4','cL5','cL6','cL7','cL8','cL9','cL10','cL11','cL12','cL13','cL14','cL15','cL16','cL17'] as const;
    return (this.c()!.checklist as any)[keys[i]];
  }

  addQuery() {
    if (!this.newQ.trim() || !this.c()) return;
    this.queryApi.create({ caseId: this.c()!.id, text: this.newQ, phoneNote: this.phoneNote || null, emailNote: this.emailNote || null }).subscribe({
      next: r => {
        if (r.success && r.data) {
          this.c.update(c => c ? { ...c, queries: [r.data!, ...c.queries] } : c);
          this.newQ = ''; this.phoneNote = ''; this.emailNote = '';
        }
      }
    });
  }

  reply(q: CaseQuery) {
    const text = this.replyMap[q.id];
    if (!text) return;
    this.queryApi.reply(q.id, text).subscribe({
      next: r => {
        if (r.success) {
          this.c.update(c => c ? {
            ...c,
            queries: c.queries.map(x => x.id === q.id ? { ...x, reply: text, status: 'Replied' } : x)
          } : c);
          delete this.replyMap[q.id];
          this.msg.set('Reply added.'); setTimeout(() => this.msg.set(''), 3000);
        }
      }
    });
  }

  updateStatus() {
    if (!this.c() || !this.newStatus) return;
    this.caseApi.updateStatus(this.c()!.id, this.newStatus, this.statusRemark).subscribe({
      next: r => {
        if (r.success) {
          this.c.update(c => c ? { ...c, status: this.newStatus } : c);
          this.msg.set('Status updated to ' + this.newStatus);
          setTimeout(() => this.msg.set(''), 3000);
        }
      }
    });
  }

  badgeCls(s: string) {
    return { 'badge-pending': s==='Pending', 'badge-inprocess': s==='InProcess', 'badge-settled': s==='Settled', 'badge-closed': s==='Closed' };
  }
}
