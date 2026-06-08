import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthorizationService } from '../../services/authorization.service';
import { AuthService } from '../../services/auth.service';
import { ProviderDashboard, AuthorizationRequest, Notification } from '../../models/models';

@Component({
  selector: 'app-provider-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="animate-fade">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <div class="page-title">Welcome back, {{ firstName }} 👋</div>
          <div class="page-subtitle">{{ today }} · {{ user?.organization }}</div>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-outline" (click)="loadDashboard()">
            <span class="material-icons" style="font-size:16px" [class.spin]="loading">refresh</span>
            Refresh
          </button>
          <a [routerLink]="['/provider/new-request']" class="btn btn-primary">
            <span class="material-icons" style="font-size:16px">add</span>
            New Request
          </a>
        </div>
      </div>

      <!-- KPI Metrics -->
      <div class="grid-4" style="margin-bottom:24px">
        <div class="metric-card warning">
          <div class="metric-icon warning"><span class="material-icons">edit_note</span></div>
          <div class="metric-value">{{ dashboard?.draftsPendingReview || 0 }}</div>
          <div class="metric-label">Drafts Pending Review</div>
          <div class="metric-delta neutral">
            <span class="material-icons" style="font-size:14px">info</span>
            AI validation in progress
          </div>
        </div>
        <div class="metric-card primary">
          <div class="metric-icon primary"><span class="material-icons">hourglass_empty</span></div>
          <div class="metric-value">{{ dashboard?.awaitingPayerResponse || 0 }}</div>
          <div class="metric-label">Awaiting Payer Response</div>
          <div class="metric-delta neutral"><span class="material-icons" style="font-size:14px">schedule</span>Avg 14 min turnaround</div>
        </div>
        <div class="metric-card success">
          <div class="metric-icon success"><span class="material-icons">smart_toy</span></div>
          <div class="metric-value">{{ dashboard?.aiPreApprovedRate || 0 }}%</div>
          <div class="metric-label">AI Pre-Approved Rate</div>
          <div class="metric-delta up"><span class="material-icons" style="font-size:14px">trending_up</span>+2.1% this week</div>
        </div>
        <div class="metric-card danger">
          <div class="metric-icon danger"><span class="material-icons">warning</span></div>
          <div class="metric-value">{{ dashboard?.actionNeeded || 0 }}</div>
          <div class="metric-label">Action Required 🚨</div>
          <div class="metric-delta down" *ngIf="(dashboard?.actionNeeded || 0) > 0">
            <span class="material-icons" style="font-size:14px">priority_high</span>
            Immediate attention needed
          </div>
        </div>
      </div>

      <div class="dashboard-grid">
        <!-- Worklist Table -->
        <div class="card" style="grid-column:1/3">
          <div class="flex items-center justify-between" style="margin-bottom:16px">
            <div>
              <div class="text-lg font-semibold">Active Cases Worklist</div>
              <div class="text-sm text-muted">Real-time prior authorization tracking</div>
            </div>
            <a [routerLink]="['/provider/cases']" class="btn btn-outline btn-sm">View All</a>
          </div>
          <div *ngIf="loading" class="flex justify-center" style="padding:40px">
            <div class="spinner" style="width:32px;height:32px"></div>
          </div>
          <div *ngIf="!loading && dashboard?.recentCases?.length === 0" class="empty-state">
            <span class="material-icons">inbox</span>
            <p>No active cases. <a [routerLink]="['/provider/new-request']">Create your first request</a></p>
          </div>
          <div *ngIf="!loading && dashboard?.recentCases?.length" style="overflow-x:auto">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Case ID / Patient</th>
                  <th>Procedure</th>
                  <th>Payer</th>
                  <th>FHIR Status</th>
                  <th>AI Risk Score</th>
                  <th>Urgency</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let case of dashboard?.recentCases">
                  <td>
                    <div class="font-mono text-sm" style="color:var(--primary)">{{ case.caseId }}</div>
                    <div class="font-semibold" style="color:var(--text-primary)">{{ case.patientName }}</div>
                  </td>
                  <td>
                    <div style="color:var(--text-primary)">{{ case.procedureCode }}</div>
                    <div class="text-xs text-muted">{{ case.procedureDescription }}</div>
                  </td>
                  <td>{{ case.payerName }}</td>
                  <td>
                    <span class="badge" [ngClass]="getFhirBadgeClass(case.fhirStatus)">
                      {{ case.fhirStatus | titlecase }}
                    </span>
                  </td>
                  <td>
                    <div class="risk-indicator" [ngClass]="'risk-' + (case.aiRiskLevel || 'GREEN').toLowerCase()">
                      <div class="status-dot" [ngClass]="getRiskDotClass(case.aiRiskLevel)"></div>
                      <span>{{ case.aiRiskScore }}%</span>
                    </div>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="getUrgencyClass(case.urgencyLevel)">{{ case.urgencyLevel }}</span>
                  </td>
                  <td>
                    <div class="flex gap-1">
                      <a [routerLink]="['/provider/cases', case.caseId]" class="btn btn-ghost btn-sm btn-icon" title="View">
                        <span class="material-icons" style="font-size:16px">visibility</span>
                      </a>
                      <button *ngIf="case.kanbanStatus === 'DRAFT_AI_REVIEW'" class="btn btn-primary btn-sm"
                        (click)="submitCase(case.caseId)">Submit</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Notification Panel -->
        <div class="card">
          <div class="flex items-center justify-between" style="margin-bottom:16px">
            <div class="text-lg font-semibold">Notification Feed</div>
            <a [routerLink]="['/provider/notifications']" class="btn btn-ghost btn-sm">See all</a>
          </div>
          <div *ngFor="let notif of dashboard?.recentNotifications?.slice(0, 5)" class="alert"
            [ngClass]="getNotifClass(notif.alertType)" style="cursor:pointer"
            [routerLink]="[notif.actionUrl || '/provider/notifications']">
            <span class="material-icons alert-icon">{{ getNotifIcon(notif.alertType) }}</span>
            <div class="alert-content">
              <div class="alert-title">{{ notif.title }}</div>
              <div class="alert-message">{{ notif.message }}</div>
            </div>
            <span class="badge badge-danger" *ngIf="!notif.read" style="font-size:9px;padding:1px 5px">NEW</span>
          </div>
          <div *ngIf="!dashboard?.recentNotifications?.length" class="empty-state">
            <span class="material-icons">notifications_none</span>
            <p>No notifications</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-grid { display:grid; grid-template-columns:1fr 320px; gap:20px; }
    .risk-indicator { display:flex; align-items:center; gap:6px; font-size:13px; font-weight:600; }
    .risk-green { color:#10b981; }
    .risk-yellow { color:#f59e0b; }
    .risk-red { color:#ef4444; }
    .empty-state { display:flex; flex-direction:column; align-items:center; padding:40px; color:var(--text-muted); text-align:center;
      .material-icons { font-size:40px; margin-bottom:8px; opacity:0.4; }
      p { font-size:13px; } a { color:var(--primary); text-decoration:none; }
    }
    @media (max-width:1100px) { .dashboard-grid { grid-template-columns:1fr; } }
  `]
})
export class ProviderDashboardComponent implements OnInit {
  dashboard: ProviderDashboard | null = null;
  loading = true;
  today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  constructor(private authSvc: AuthorizationService, private authService: AuthService, private router: Router) {}

  get user() { return this.authService.currentUser; }
  get firstName() {
    const name = this.authService.currentUser?.fullName || this.authService.currentUser?.username || '';
    return name.split(' ')[0];
  }

  ngOnInit() { this.loadDashboard(); }

  loadDashboard() {
    this.loading = true;
    this.authSvc.getProviderDashboard().subscribe({
      next: res => { if (res.success) this.dashboard = res.data!; this.loading = false; },
      error: () => this.loading = false
    });
  }

  submitCase(caseId: string | undefined) {
    if (!caseId) return;
    this.authSvc.submitRequest(caseId).subscribe(() => this.loadDashboard());
  }

  getFhirBadgeClass(status?: string) {
    const map: Record<string, string> = {
      'DRAFT': 'badge-neutral', 'SUBMITTED': 'badge-info', 'IN_PROGRESS': 'badge-secondary',
      'APPROVED': 'badge-success', 'REJECTED': 'badge-danger', 'REQUESTED': 'badge-warning',
      'COMPLETED': 'badge-success', 'CANCELLED': 'badge-neutral'
    };
    return map[status || ''] || 'badge-neutral';
  }

  getRiskDotClass(level?: string) {
    return level === 'GREEN' ? 'green' : level === 'YELLOW' ? 'yellow' : 'red';
  }

  getUrgencyClass(u?: string) {
    return u === 'CRITICAL' ? 'badge-danger' : u === 'HIGH' ? 'badge-warning' : u === 'MEDIUM' ? 'badge-info' : 'badge-neutral';
  }

  getNotifClass(type?: string) {
    return type === 'CRITICAL' ? 'alert-critical' : type === 'WARNING' ? 'alert-warning' :
      type === 'SUCCESS' ? 'alert-success' : type === 'AI_INSIGHT' ? 'alert-ai' : 'alert-info';
  }

  getNotifIcon(type?: string) {
    return type === 'CRITICAL' ? 'error' : type === 'WARNING' ? 'warning' :
      type === 'SUCCESS' ? 'check_circle' : type === 'AI_INSIGHT' ? 'auto_awesome' : 'info';
  }
}
