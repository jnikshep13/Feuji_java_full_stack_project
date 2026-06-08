import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthorizationService } from '../../services/authorization.service';
import { AuthService } from '../../services/auth.service';
import { PayerDashboard, AuthorizationRequest } from '../../models/models';

@Component({
  selector: 'app-payer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="animate-fade">
      <div class="page-header">
        <div>
          <div class="page-title">Payer Review Dashboard</div>
          <div class="page-subtitle">{{ today }} · {{ user?.organization }}</div>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-outline" (click)="loadDashboard()">
            <span class="material-icons" style="font-size:16px">refresh</span>Refresh
          </button>
          <a [routerLink]="['/payer/cases']" class="btn btn-primary">
            <span class="material-icons" style="font-size:16px">pending_actions</span>Review Queue
          </a>
        </div>
      </div>

      <!-- KPIs -->
      <div class="grid-4" style="margin-bottom:24px">
        <div class="metric-card primary">
          <div class="metric-icon primary"><span class="material-icons">inbox</span></div>
          <div class="metric-value">{{ dashboard?.incomingRequestsToday || 0 }}</div>
          <div class="metric-label">Incoming Today</div>
          <div class="metric-delta neutral"><span class="material-icons" style="font-size:14px">schedule</span>Updated live</div>
        </div>
        <div class="metric-card success">
          <div class="metric-icon success"><span class="material-icons">smart_toy</span></div>
          <div class="metric-value">{{ dashboard?.autoAdjudicated || 0 }}</div>
          <div class="metric-label">Auto-Adjudicated (AI)</div>
          <div class="metric-delta up"><span class="material-icons" style="font-size:14px">bolt</span>Processed in seconds</div>
        </div>
        <div class="metric-card warning">
          <div class="metric-icon warning"><span class="material-icons">rate_review</span></div>
          <div class="metric-value">{{ dashboard?.manualReviewQueue || 0 }}</div>
          <div class="metric-label">Manual Review Queue</div>
          <div class="metric-delta neutral"><span class="material-icons" style="font-size:14px">person</span>Needs human review</div>
        </div>
        <div class="metric-card secondary">
          <div class="metric-icon secondary"><span class="material-icons">timer</span></div>
          <div class="metric-value">14m</div>
          <div class="metric-label">Avg Turnaround</div>
          <div class="metric-delta up"><span class="material-icons" style="font-size:14px">trending_down</span>-3m vs last week</div>
        </div>
      </div>

      <!-- AI Efficiency Banner -->
      <div class="ai-efficiency-banner" style="margin-bottom:24px">
        <div class="flex items-center gap-3">
          <div class="ai-eff-icon"><span class="material-icons">auto_awesome</span></div>
          <div>
            <div style="font-size:14px;font-weight:700;color:#818cf8">AI Copilot Performance Today</div>
            <div style="font-size:13px;color:var(--text-secondary)">AI Copilot saved an estimated <strong style="color:#818cf8">3 hours</strong> of administrative back-and-forth by catching <strong style="color:#818cf8">{{ (dashboard?.autoAdjudicated || 0) }}</strong> pre-validated requests before they reached manual review.</div>
          </div>
          <div style="margin-left:auto;text-align:right">
            <div style="font-size:24px;font-weight:800;color:#10b981">{{ autoAdjRate }}%</div>
            <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em">Auto-adjudication rate</div>
          </div>
        </div>
      </div>

      <!-- Split-screen review queue -->
      <div class="payer-split">
        <!-- Left: Queue List -->
        <div class="card queue-panel">
          <div class="flex items-center justify-between" style="margin-bottom:16px">
            <div>
              <div class="text-lg font-semibold">Manual Review Queue</div>
              <div class="text-sm text-muted">{{ dashboard?.manualReviewQueue || 0 }} cases need attention</div>
            </div>
            <a [routerLink]="['/payer/cases']" class="btn btn-outline btn-sm">Full Queue</a>
          </div>
          <div *ngIf="loading" class="flex justify-center" style="padding:30px">
            <div class="spinner"></div>
          </div>
          <div *ngFor="let c of dashboard?.manualReviewCases?.slice(0, 8)" class="queue-item"
            [class.selected]="selectedCase?.caseId === c.caseId" (click)="selectCase(c)">
            <div class="qi-top">
              <span class="font-mono text-sm" style="color:var(--primary)">{{ c.caseId }}</span>
              <span class="badge" [ngClass]="getUrgency(c.urgencyLevel)">{{ c.urgencyLevel }}</span>
            </div>
            <div class="qi-patient">{{ c.patientName }}</div>
            <div class="qi-proc">{{ c.procedureCode }} · {{ c.procedureDescription }}</div>
            <div class="qi-payer">{{ c.providerOrganization }}</div>
            <div class="qi-bottom">
              <span class="badge" [ngClass]="getBadge(c.fhirStatus)">{{ c.fhirStatus }}</span>
              <div class="risk-mini" [ngClass]="'risk-mini-' + (c.aiRiskLevel||'GREEN').toLowerCase()">
                <div class="status-dot" [ngClass]="c.aiRiskLevel==='GREEN'?'green':c.aiRiskLevel==='YELLOW'?'yellow':'red'"></div>
                {{ c.aiRiskScore }}%
              </div>
            </div>
          </div>
          <div *ngIf="!loading && !dashboard?.manualReviewCases?.length" style="text-align:center;padding:30px;color:var(--text-muted)">
            <span class="material-icons" style="font-size:36px;display:block;opacity:0.3">done_all</span>
            <p style="font-size:13px">All clear! No manual review needed.</p>
          </div>
        </div>

        <!-- Right: Case Viewer -->
        <div class="case-viewer" *ngIf="selectedCase">
          <div class="card" style="height:100%">
            <div class="flex items-center justify-between" style="margin-bottom:16px">
              <div>
                <div class="font-mono text-sm" style="color:var(--primary)">{{ selectedCase.caseId }}</div>
                <div class="text-lg font-semibold">{{ selectedCase.patientName }}</div>
              </div>
              <div class="flex gap-2">
                <a [routerLink]="['/payer/cases', selectedCase.caseId]" class="btn btn-outline btn-sm">
                  <span class="material-icons" style="font-size:14px">open_in_new</span>Full View
                </a>
              </div>
            </div>

            <!-- AI Summary -->
            <div class="ai-summary-box" style="margin-bottom:16px">
              <div class="ai-summary-label"><span class="material-icons" style="font-size:14px">psychology</span>AI Clinical Summary</div>
              <p>{{ (selectedCase.clinicalNotes || '').slice(0, 200) }}{{ (selectedCase.clinicalNotes || '').length > 200 ? '...' : '' }}</p>
            </div>

            <!-- FHIR Fields -->
            <div class="fhir-resource" style="margin-bottom:16px">
              <div class="fhir-header"><span class="material-icons" style="font-size:13px">code</span>FHIR Resource Inspector</div>
              <div class="fhir-row"><span class="fhir-key">procedure.code</span><span class="fhir-value font-mono">{{ selectedCase.procedureCode }}</span></div>
              <div class="fhir-row"><span class="fhir-key">diagnosis.icd10</span><span class="fhir-value font-mono text-sm">{{ selectedCase.icd10Codes }}</span></div>
              <div class="fhir-row"><span class="fhir-key">provider.npi</span><span class="fhir-value font-mono text-sm">{{ selectedCase.providerNpi }}</span></div>
              <div class="fhir-row"><span class="fhir-key">status</span><span class="fhir-value">{{ selectedCase.fhirStatus }}</span></div>
              <div class="fhir-row"><span class="fhir-key">aiRiskScore</span>
                <span class="fhir-value" [ngClass]="'risk-' + (selectedCase.aiRiskLevel||'GREEN').toLowerCase()">{{ selectedCase.aiRiskScore }}% ({{ selectedCase.aiRiskLevel }})</span>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="flex gap-2">
              <button class="btn btn-outline flex-1" (click)="quickClarify()">
                <span class="material-icons" style="font-size:15px">chat</span>Request Clarification
              </button>
              <button class="btn btn-danger flex-1" (click)="quickReject()">
                <span class="material-icons" style="font-size:15px">cancel</span>Reject
              </button>
              <button class="btn btn-success flex-1" (click)="quickApprove()">
                <span class="material-icons" style="font-size:15px">check_circle</span>Approve
              </button>
            </div>
          </div>
        </div>
        <div class="case-viewer-placeholder" *ngIf="!selectedCase">
          <div class="placeholder-content">
            <span class="material-icons">touch_app</span>
            <p>Select a case from the queue to review</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ai-efficiency-banner { background:linear-gradient(135deg,rgba(99,102,241,0.12),rgba(14,165,233,0.08)); border:1px solid rgba(99,102,241,0.25); border-radius:var(--radius-lg); padding:20px; }
    .ai-eff-icon { width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg,#6366f1,#0ea5e9); display:flex; align-items:center; justify-content:center; flex-shrink:0; .material-icons { color:white; font-size:24px; } }

    .payer-split { display:grid; grid-template-columns:320px 1fr; gap:16px; align-items:start; }
    .queue-panel { padding:16px; max-height:600px; overflow-y:auto; }
    .queue-item { background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius-md); padding:12px; margin-bottom:8px; cursor:pointer; transition:all var(--transition);
      &:hover { border-color:var(--primary); }
      &.selected { border-color:var(--primary); background:rgba(14,165,233,0.06); }
    }
    .qi-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:4px; }
    .qi-patient { font-size:14px; font-weight:700; color:var(--text-primary); }
    .qi-proc { font-size:12px; color:var(--text-muted); margin-top:2px; }
    .qi-payer { font-size:11px; color:var(--text-secondary); margin-top:2px; }
    .qi-bottom { display:flex; align-items:center; justify-content:space-between; margin-top:8px; }
    .risk-mini { display:flex; align-items:center; gap:4px; font-size:12px; font-weight:700; }
    .risk-mini-green { color:#10b981; }
    .risk-mini-yellow { color:#f59e0b; }
    .risk-mini-red { color:#ef4444; }

    .case-viewer { }
    .case-viewer-placeholder { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-lg); display:flex; align-items:center; justify-content:center; min-height:400px; }
    .placeholder-content { text-align:center; color:var(--text-muted); .material-icons { font-size:48px; display:block; margin-bottom:12px; opacity:0.3; } p { font-size:13px; } }

    .ai-summary-box { background:rgba(99,102,241,0.06); border:1px solid rgba(99,102,241,0.2); border-radius:var(--radius-md); padding:14px; }
    .ai-summary-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:#818cf8; display:flex; align-items:center; gap:6px; margin-bottom:8px; }
    .ai-summary-box p { font-size:13px; color:var(--text-secondary); line-height:1.6; }
    .risk-green { color:#10b981; }
    .risk-yellow { color:#f59e0b; }
    .risk-red { color:#ef4444; }
    @media (max-width:900px) { .payer-split { grid-template-columns:1fr; } }
  `]
})
export class PayerDashboardComponent implements OnInit {
  dashboard: PayerDashboard | null = null;
  loading = true;
  selectedCase: AuthorizationRequest | null = null;
  today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  constructor(private svc: AuthorizationService, private authService: AuthService) {}
  get user() { return this.authService.currentUser; }
  get autoAdjRate() {
    const t = this.dashboard?.incomingRequestsToday || 1;
    const a = this.dashboard?.autoAdjudicated || 0;
    return Math.round(a * 100 / t);
  }

  ngOnInit() { this.loadDashboard(); }

  loadDashboard() {
    this.loading = true;
    this.svc.getPayerDashboard().subscribe({
      next: r => { if (r.success) this.dashboard = r.data!; this.loading = false; },
      error: () => this.loading = false
    });
  }

  selectCase(c: AuthorizationRequest) { this.selectedCase = c; }

  quickApprove() {
    if (!this.selectedCase?.caseId) return;
    this.svc.reviewRequest(this.selectedCase.caseId, 'APPROVED', 'Approved by payer reviewer').subscribe(() => this.loadDashboard());
  }

  quickReject() {
    if (!this.selectedCase?.caseId) return;
    this.svc.reviewRequest(this.selectedCase.caseId, 'REJECTED', 'Does not meet medical necessity criteria').subscribe(() => this.loadDashboard());
  }

  quickClarify() {
    if (!this.selectedCase?.caseId) return;
    this.svc.requestClarification(this.selectedCase.caseId).subscribe(() => this.loadDashboard());
  }

  getBadge(s?: string) { const m: any = { DRAFT:'badge-neutral',SUBMITTED:'badge-info',IN_PROGRESS:'badge-secondary',APPROVED:'badge-success',REJECTED:'badge-danger',REQUESTED:'badge-warning' }; return m[s||'']||'badge-neutral'; }
  getUrgency(u?: string) { return u==='CRITICAL'?'badge-danger':u==='HIGH'?'badge-warning':u==='MEDIUM'?'badge-info':'badge-neutral'; }
}
