import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthorizationService } from '../../services/authorization.service';
import { AuthService } from '../../services/auth.service';
import { AuthorizationRequest, KanbanStatus } from '../../models/models';

@Component({
  selector: 'app-status-tracking',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="animate-fade">
      <div class="page-header">
        <div>
          <div class="page-title">Status Tracking Board</div>
          <div class="page-subtitle">Visual Kanban — FHIR-based workflow tracking</div>
        </div>
        <button class="btn btn-outline" (click)="load()">
          <span class="material-icons" style="font-size:16px" [class.spin]="loading">refresh</span>Refresh
        </button>
      </div>

      <!-- Summary -->
      <div class="status-summary" style="margin-bottom:20px">
        <div *ngFor="let col of columns" class="sum-item" [style.borderColor]="col.color">
          <div class="sum-count" [style.color]="col.color">{{ getCount(col.status) }}</div>
          <div class="sum-label">{{ col.label }}</div>
        </div>
      </div>

      <div *ngIf="loading" class="flex justify-center" style="padding:60px">
        <div class="spinner" style="width:36px;height:36px"></div>
      </div>

      <div class="kanban-board" *ngIf="!loading">
        <div class="kanban-col" *ngFor="let col of columns">
          <div class="kanban-header" [style.borderBottom]="'2px solid ' + col.color">
            <span class="kanban-title" [style.color]="col.color">{{ col.label }}</span>
            <span class="kanban-count">{{ getCount(col.status) }}</span>
          </div>
          <div class="kanban-items">
            <div *ngFor="let c of getCards(col.status)"
              class="kanban-card" [routerLink]="[isProvider ? '/provider/cases' : '/payer/cases', c.caseId]">
              <div class="kanban-case-id">{{ c.caseId }}</div>
              <div class="kanban-patient">{{ c.patientName }}</div>
              <div class="kanban-procedure">{{ c.procedureCode }} · {{ c.procedureDescription }}</div>
              <div class="kanban-payer">
                <span class="material-icons" style="font-size:12px;color:var(--text-muted)">business</span>
                {{ c.payerName }}
              </div>
              <div class="kanban-risk">
                <div class="status-dot" [ngClass]="c.aiRiskLevel==='GREEN'?'green':c.aiRiskLevel==='YELLOW'?'yellow':'red'"></div>
                <span style="font-size:11px;font-weight:700" [ngClass]="'risk-' + (c.aiRiskLevel||'GREEN').toLowerCase()">{{ c.aiRiskScore }}%</span>
                <span class="badge" [ngClass]="getUrgency(c.urgencyLevel)" style="margin-left:auto">{{ c.urgencyLevel }}</span>
              </div>
              <!-- Expiry warning -->
              <div *ngIf="isExpiringSoon(c)" class="expiry-warn">
                <span class="material-icons" style="font-size:13px">schedule</span>
                Expires soon
              </div>
            </div>
            <div *ngIf="getCount(col.status) === 0" class="kanban-empty">
              <span class="material-icons">{{ col.emptyIcon }}</span>
              <span>{{ col.emptyText }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .status-summary { display:flex; gap:12px; overflow-x:auto; }
    .sum-item { flex:1; min-width:100px; background:var(--bg-card); border:1px solid; border-radius:var(--radius-md); padding:14px; text-align:center; }
    .sum-count { font-size:26px; font-weight:800; font-variant-numeric:tabular-nums; }
    .sum-label { font-size:11px; color:var(--text-muted); font-weight:600; text-transform:uppercase; letter-spacing:0.06em; margin-top:2px; }
    .kanban-empty { display:flex; flex-direction:column; align-items:center; padding:20px; color:var(--text-muted); font-size:12px; gap:6px; .material-icons { font-size:24px; opacity:0.3; } }
    .expiry-warn { display:flex; align-items:center; gap:4px; font-size:11px; color:#f59e0b; margin-top:6px; padding-top:6px; border-top:1px solid rgba(245,158,11,0.2); }
    .risk-green { color:#10b981; }
    .risk-yellow { color:#f59e0b; }
    .risk-red { color:#ef4444; }
  `]
})
export class StatusTrackingComponent implements OnInit {
  cases: AuthorizationRequest[] = [];
  loading = true;

  columns = [
    { status: 'DRAFT_AI_REVIEW' as KanbanStatus, label: 'Draft / AI Review', color: '#94a3b8', emptyIcon: 'edit_note', emptyText: 'No drafts' },
    { status: 'TRANSMITTED' as KanbanStatus, label: 'Transmitted', color: '#0ea5e9', emptyIcon: 'send', emptyText: 'None transmitted' },
    { status: 'PAYER_REVIEW' as KanbanStatus, label: 'Payer Review', color: '#6366f1', emptyIcon: 'rate_review', emptyText: 'None in review' },
    { status: 'INFO_REQUESTED' as KanbanStatus, label: 'Info Requested 🟡', color: '#f59e0b', emptyIcon: 'help_outline', emptyText: 'No holds' },
    { status: 'FINALIZED' as KanbanStatus, label: 'Finalized 🟢', color: '#10b981', emptyIcon: 'check_circle', emptyText: 'None finalized' },
  ];

  constructor(private svc: AuthorizationService, private authService: AuthService) {}
  get isProvider() { return this.authService.isProvider; }

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.svc.getKanbanBoard().subscribe({
      next: r => { if (r.success) this.cases = r.data!; this.loading = false; },
      error: () => this.loading = false
    });
  }

  getCards(status: KanbanStatus) { return this.cases.filter(c => c.kanbanStatus === status); }
  getCount(status: KanbanStatus) { return this.cases.filter(c => c.kanbanStatus === status).length; }
  isExpiringSoon(c: AuthorizationRequest) {
    if (!c.expiryDate) return false;
    const days = (new Date(c.expiryDate).getTime() - Date.now()) / 86400000;
    return days < 7 && days > 0;
  }
  getUrgency(u?: string) { return u==='CRITICAL'?'badge-danger':u==='HIGH'?'badge-warning':u==='MEDIUM'?'badge-info':'badge-neutral'; }
}
