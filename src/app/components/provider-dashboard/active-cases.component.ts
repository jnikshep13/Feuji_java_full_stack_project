import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthorizationService } from '../../services/authorization.service';
import { AuthorizationRequest } from '../../models/models';

@Component({
  selector: 'app-active-cases',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="animate-fade">
      <div class="page-header">
        <div>
          <div class="page-title">Active Cases</div>
          <div class="page-subtitle">All your prior authorization requests</div>
        </div>
        <a [routerLink]="['/provider/new-request']" class="btn btn-primary">
          <span class="material-icons" style="font-size:16px">add</span>New Request
        </a>
      </div>

      <!-- Filters -->
      <div class="card" style="margin-bottom:20px">
        <div class="flex gap-3 items-center flex-wrap">
          <input type="text" [(ngModel)]="search" placeholder="Search patient, case ID..." style="max-width:260px" (input)="applyFilter()">
          <select [(ngModel)]="statusFilter" style="max-width:180px" (change)="applyFilter()">
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="REQUESTED">Info Requested</option>
          </select>
          <select [(ngModel)]="urgencyFilter" style="max-width:160px" (change)="applyFilter()">
            <option value="">All Urgency</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <button class="btn btn-outline btn-sm" (click)="resetFilters()">
            <span class="material-icons" style="font-size:15px">clear</span>Reset
          </button>
          <span class="text-muted text-sm" style="margin-left:auto">{{ filtered.length }} cases</span>
        </div>
      </div>

      <div class="card">
        <div *ngIf="loading" class="flex justify-center" style="padding:40px">
          <div class="spinner" style="width:36px;height:36px"></div>
        </div>
        <div *ngIf="!loading && filtered.length === 0" style="text-align:center;padding:40px;color:var(--text-muted)">
          <span class="material-icons" style="font-size:48px;display:block;margin-bottom:12px;opacity:0.3">search_off</span>
          No cases match your filters
        </div>
        <div *ngIf="!loading && filtered.length > 0" style="overflow-x:auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Patient</th>
                <th>Procedure</th>
                <th>Payer</th>
                <th>FHIR Status</th>
                <th>AI Score</th>
                <th>Urgency</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of filtered">
                <td><span class="font-mono text-sm" style="color:var(--primary)">{{ c.caseId }}</span></td>
                <td>
                  <div class="font-semibold" style="color:var(--text-primary)">{{ c.patientName }}</div>
                  <div class="text-xs text-muted">DOB: {{ c.patientDob }}</div>
                </td>
                <td>
                  <div style="color:var(--text-primary)">{{ c.procedureCode }}</div>
                  <div class="text-xs text-muted">{{ c.procedureDescription }}</div>
                </td>
                <td>{{ c.payerName }}</td>
                <td><span class="badge" [ngClass]="getBadge(c.fhirStatus)">{{ c.fhirStatus }}</span></td>
                <td>
                  <div class="flex items-center gap-1" [ngClass]="'risk-' + (c.aiRiskLevel||'GREEN').toLowerCase()">
                    <div class="status-dot" [ngClass]="c.aiRiskLevel==='GREEN'?'green':c.aiRiskLevel==='YELLOW'?'yellow':'red'"></div>
                    <span class="font-semibold">{{ c.aiRiskScore }}%</span>
                  </div>
                </td>
                <td><span class="badge" [ngClass]="getUrgency(c.urgencyLevel)">{{ c.urgencyLevel }}</span></td>
                <td class="text-xs text-muted">{{ c.createdAt | date:'MMM d, y' }}</td>
                <td>
                  <div class="flex gap-1">
                    <a [routerLink]="['/provider/cases', c.caseId]" class="btn btn-ghost btn-sm btn-icon" title="View Details">
                      <span class="material-icons" style="font-size:16px">visibility</span>
                    </a>
                    <button *ngIf="c.kanbanStatus === 'DRAFT_AI_REVIEW'" class="btn btn-primary btn-sm" (click)="submit(c.caseId)">
                      Submit
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`.risk-green{color:#10b981}.risk-yellow{color:#f59e0b}.risk-red{color:#ef4444}`]
})
export class ActiveCasesComponent implements OnInit {
  cases: AuthorizationRequest[] = [];
  filtered: AuthorizationRequest[] = [];
  loading = true;
  search = '';
  statusFilter = '';
  urgencyFilter = '';

  constructor(private svc: AuthorizationService) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.svc.getProviderCases().subscribe({ next: r => { if (r.success) { this.cases = r.data!; this.applyFilter(); } this.loading = false; }, error: () => this.loading = false });
  }

  applyFilter() {
    this.filtered = this.cases.filter(c =>
      (!this.search || c.patientName?.toLowerCase().includes(this.search.toLowerCase()) || c.caseId?.includes(this.search)) &&
      (!this.statusFilter || c.fhirStatus === this.statusFilter) &&
      (!this.urgencyFilter || c.urgencyLevel === this.urgencyFilter)
    );
  }

  resetFilters() { this.search = ''; this.statusFilter = ''; this.urgencyFilter = ''; this.applyFilter(); }

  submit(id?: string) { if (id) this.svc.submitRequest(id).subscribe(() => this.load()); }

  getBadge(s?: string) { const m: any = { DRAFT:'badge-neutral',SUBMITTED:'badge-info',IN_PROGRESS:'badge-secondary',APPROVED:'badge-success',REJECTED:'badge-danger',REQUESTED:'badge-warning' }; return m[s||'']||'badge-neutral'; }
  getUrgency(u?: string) { return u==='CRITICAL'?'badge-danger':u==='HIGH'?'badge-warning':u==='MEDIUM'?'badge-info':'badge-neutral'; }
}
