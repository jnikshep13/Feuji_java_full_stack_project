import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthorizationService } from '../../services/authorization.service';
import { CommunicationService } from '../../services/communication.service';
import { AuthService } from '../../services/auth.service';
import { AuthorizationRequest, Communication } from '../../models/models';

@Component({
  selector: 'app-case-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="animate-fade" *ngIf="caseData">
      <!-- Header -->
      <div class="page-header">
        <div class="flex items-center gap-3">
          <button class="btn btn-ghost btn-icon" onclick="history.back()">
            <span class="material-icons">arrow_back</span>
          </button>
          <div>
            <div class="flex items-center gap-2">
              <div class="page-title font-mono" style="color:var(--primary)">{{ caseData.caseId }}</div>
              <span class="badge" [ngClass]="getBadge(caseData.fhirStatus)">{{ caseData.fhirStatus }}</span>
              <span class="badge" [ngClass]="getUrgency(caseData.urgencyLevel)">{{ caseData.urgencyLevel }}</span>
            </div>
            <div class="page-subtitle">{{ caseData.patientName }} · {{ caseData.procedureDescription }}</div>
          </div>
        </div>
        <!-- Payer Actions -->
        <div class="flex gap-2" *ngIf="isPayer">
          <button class="btn btn-outline" (click)="requestClarification()" [disabled]="actioning">
            <span class="material-icons" style="font-size:16px">chat</span> Request Clarification
          </button>
          <button class="btn btn-danger" (click)="review('REJECTED')" [disabled]="actioning">
            <span class="material-icons" style="font-size:16px">cancel</span> Reject
          </button>
          <button class="btn btn-success" (click)="review('APPROVED')" [disabled]="actioning">
            <span class="material-icons" style="font-size:16px">check_circle</span> Approve
          </button>
        </div>
        <div class="flex gap-2" *ngIf="!isPayer && caseData.kanbanStatus === 'DRAFT_AI_REVIEW'">
          <button class="btn btn-primary" (click)="submitCase()" [disabled]="actioning">
            <span class="material-icons" style="font-size:16px">send</span>Submit Request
          </button>
        </div>
      </div>

      <div class="detail-layout">
        <!-- Left: Case Info -->
        <div class="detail-main">
          <!-- AI Risk -->
          <div class="card ai-risk-card" [ngClass]="'risk-card-' + (caseData.aiRiskLevel || 'GREEN').toLowerCase()">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-12">
                <div>
                  <div class="risk-score-big">{{ caseData.aiRiskScore }}%</div>
                  <div class="risk-score-label">AI Approval Probability</div>
                </div>
                <div class="risk-badge-big" [ngClass]="'risk-badge-' + (caseData.aiRiskLevel||'GREEN').toLowerCase()">
                  {{ caseData.aiRiskLevel === 'GREEN' ? '✅ Green' : caseData.aiRiskLevel === 'YELLOW' ? '⚠️ Yellow' : '🚨 Red' }}
                </div>
              </div>
              <div class="risk-bar" style="width:200px">
                <div class="risk-fill" [ngClass]="(caseData.aiRiskLevel||'GREEN').toLowerCase()" [style.width.%]="caseData.aiRiskScore"></div>
              </div>
            </div>
            <div *ngIf="caseData.aiIssues" class="ai-issue-list">
              <div *ngFor="let issue of getIssues()" class="flex items-center gap-2" style="font-size:13px;padding:3px 0">
                <span class="material-icons" style="font-size:15px;color:#ef4444">error_outline</span>{{ issue }}
              </div>
            </div>
          </div>

          <!-- Patient & Provider -->
          <div class="grid-2">
            <div class="card">
              <div class="card-label"><span class="material-icons" style="font-size:16px">person</span>Patient</div>
              <div class="fhir-resource" style="margin-top:12px">
                <div class="fhir-header"><span class="material-icons" style="font-size:13px">code</span>FHIR Patient Resource</div>
                <div class="fhir-row"><span class="fhir-key">name</span><span class="fhir-value">{{ caseData.patientName }}</span></div>
                <div class="fhir-row"><span class="fhir-key">birthDate</span><span class="fhir-value">{{ caseData.patientDob }}</span></div>
                <div class="fhir-row"><span class="fhir-key">id</span><span class="fhir-value font-mono text-sm">{{ caseData.patientId }}</span></div>
                <div class="fhir-row"><span class="fhir-key">insuranceId</span><span class="fhir-value font-mono text-sm">{{ caseData.patientInsuranceId }}</span></div>
              </div>
            </div>
            <div class="card">
              <div class="card-label"><span class="material-icons" style="font-size:16px">local_hospital</span>Provider</div>
              <div class="fhir-resource" style="margin-top:12px">
                <div class="fhir-header"><span class="material-icons" style="font-size:13px">code</span>FHIR Practitioner Resource</div>
                <div class="fhir-row"><span class="fhir-key">name</span><span class="fhir-value">{{ caseData.providerName }}</span></div>
                <div class="fhir-row"><span class="fhir-key">npi</span><span class="fhir-value font-mono text-sm">{{ caseData.providerNpi }}</span></div>
                <div class="fhir-row"><span class="fhir-key">organization</span><span class="fhir-value">{{ caseData.providerOrganization }}</span></div>
              </div>
            </div>
          </div>

          <!-- Procedure & Payer -->
          <div class="grid-2">
            <div class="card">
              <div class="card-label"><span class="material-icons" style="font-size:16px">medical_services</span>Procedure</div>
              <div class="fhir-resource" style="margin-top:12px">
                <div class="fhir-header"><span class="material-icons" style="font-size:13px">code</span>FHIR Claim Resource</div>
                <div class="fhir-row"><span class="fhir-key">cptCode</span><span class="fhir-value font-mono">{{ caseData.procedureCode }}</span></div>
                <div class="fhir-row"><span class="fhir-key">description</span><span class="fhir-value">{{ caseData.procedureDescription }}</span></div>
                <div class="fhir-row"><span class="fhir-key">icd10</span><span class="fhir-value font-mono text-sm">{{ caseData.icd10Codes }}</span></div>
              </div>
            </div>
            <div class="card">
              <div class="card-label"><span class="material-icons" style="font-size:16px">business</span>Payer / Coverage</div>
              <div class="fhir-resource" style="margin-top:12px">
                <div class="fhir-header"><span class="material-icons" style="font-size:13px">code</span>FHIR Coverage Resource</div>
                <div class="fhir-row"><span class="fhir-key">payor</span><span class="fhir-value">{{ caseData.payerName }}</span></div>
                <div class="fhir-row"><span class="fhir-key">payerId</span><span class="fhir-value font-mono text-sm">{{ caseData.payerId }}</span></div>
                <div class="fhir-row"><span class="fhir-key">fhirStatus</span><span class="fhir-value">{{ caseData.fhirStatus }}</span></div>
              </div>
            </div>
          </div>

          <!-- Clinical Notes -->
          <div class="card">
            <div class="card-label"><span class="material-icons" style="font-size:16px">description</span>Clinical Notes & Justification</div>
            <div class="clinical-notes">{{ caseData.clinicalNotes }}</div>
            <div *ngIf="caseData.attachments" style="margin-top:12px">
              <div class="text-xs text-muted font-bold" style="margin-bottom:8px;text-transform:uppercase;letter-spacing:0.06em">Attachments</div>
              <div class="flex gap-2 flex-wrap">
                <div *ngFor="let att of getAttachments()" class="attachment-pill">
                  <span class="material-icons" style="font-size:14px">attach_file</span>
                  {{ att }}
                </div>
              </div>
            </div>
          </div>

          <!-- Decision (if finalized) -->
          <div *ngIf="caseData.decision" class="card" [ngClass]="caseData.decision === 'APPROVED' ? 'card-approved' : 'card-rejected'">
            <div class="flex items-center gap-3">
              <span class="material-icons" style="font-size:28px" [style.color]="caseData.decision === 'APPROVED' ? '#10b981' : '#ef4444'">
                {{ caseData.decision === 'APPROVED' ? 'check_circle' : 'cancel' }}
              </span>
              <div>
                <div style="font-size:18px;font-weight:700" [style.color]="caseData.decision === 'APPROVED' ? '#10b981' : '#ef4444'">
                  {{ caseData.decision === 'APPROVED' ? 'Authorization Approved' : 'Authorization Rejected' }}
                </div>
                <div class="text-sm text-muted">By {{ caseData.reviewerName }} · {{ caseData.reviewedAt | date:'MMM d, y h:mm a' }}</div>
                <div *ngIf="caseData.decisionReason" style="font-size:13px;margin-top:6px">{{ caseData.decisionReason }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Chat & Timeline -->
        <div class="detail-side">
          <!-- Chat Window -->
          <div class="chat-window">
            <div class="chat-header">
              <span class="material-icons" style="font-size:18px;color:var(--primary)">chat</span>
              Bidirectional Communication
              <span class="badge badge-info" style="margin-left:auto">FHIR Communication</span>
            </div>
            <div class="chat-messages" #chatScroll>
              <div *ngIf="messages.length === 0" style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px">
                <span class="material-icons" style="display:block;font-size:32px;margin-bottom:8px;opacity:0.3">chat_bubble_outline</span>
                No messages yet
              </div>
              <div *ngFor="let msg of messages" class="message-bubble"
                [ngClass]="msg.senderId === currentUserId ? 'sent' : 'received'">
                <div class="msg-sender">{{ msg.senderName }} ({{ msg.senderRole }})</div>
                {{ msg.message }}
                <div class="msg-time">{{ msg.sentAt | date:'MMM d, h:mm a' }}</div>
              </div>
            </div>
            <div class="chat-input-row">
              <input type="text" [(ngModel)]="newMessage" placeholder="Type a message..." (keyup.enter)="sendMessage()">
              <button class="btn btn-primary btn-sm btn-icon" (click)="sendMessage()" [disabled]="!newMessage.trim()">
                <span class="material-icons" style="font-size:16px">send</span>
              </button>
            </div>
          </div>

          <!-- Timeline -->
          <div class="card" style="margin-top:16px">
            <div class="card-label"><span class="material-icons" style="font-size:16px">timeline</span>Case Timeline</div>
            <div class="timeline" style="margin-top:12px">
              <div class="timeline-item">
                <div class="tl-dot tl-success"></div>
                <div class="tl-content">
                  <div class="tl-title">Case Created</div>
                  <div class="tl-time">{{ caseData.createdAt | date:'MMM d, y h:mm a' }}</div>
                </div>
              </div>
              <div class="timeline-item" *ngIf="caseData.submittedAt">
                <div class="tl-dot tl-primary"></div>
                <div class="tl-content">
                  <div class="tl-title">Submitted to {{ caseData.payerName }}</div>
                  <div class="tl-time">{{ caseData.submittedAt | date:'MMM d, y h:mm a' }}</div>
                </div>
              </div>
              <div class="timeline-item" *ngIf="caseData.reviewedAt">
                <div class="tl-dot" [ngClass]="caseData.decision === 'APPROVED' ? 'tl-success' : 'tl-danger'"></div>
                <div class="tl-content">
                  <div class="tl-title">Decision: {{ caseData.decision }}</div>
                  <div class="tl-time">{{ caseData.reviewedAt | date:'MMM d, y h:mm a' }}</div>
                </div>
              </div>
              <div class="timeline-item" *ngIf="caseData.expiryDate">
                <div class="tl-dot tl-warning"></div>
                <div class="tl-content">
                  <div class="tl-title">Authorization Expires</div>
                  <div class="tl-time">{{ caseData.expiryDate | date:'MMM d, y' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Review Modal -->
      <div class="modal-overlay" *ngIf="showReviewModal" (click)="showReviewModal=false">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <span class="material-icons" [style.color]="reviewDecision === 'APPROVED' ? '#10b981' : '#ef4444'">
              {{ reviewDecision === 'APPROVED' ? 'check_circle' : 'cancel' }}
            </span>
            <div>{{ reviewDecision === 'APPROVED' ? 'Approve Authorization' : 'Reject Authorization' }}</div>
          </div>
          <div class="input-group" style="margin-top:16px">
            <label>{{ reviewDecision === 'REJECTED' ? 'Rejection Reason *' : 'Approval Notes' }}</label>
            <textarea [(ngModel)]="reviewReason" rows="3" placeholder="Enter your notes..."></textarea>
          </div>
          <div class="flex gap-2 justify-center" style="margin-top:16px">
            <button class="btn btn-outline" (click)="showReviewModal=false">Cancel</button>
            <button class="btn" [ngClass]="reviewDecision === 'APPROVED' ? 'btn-success' : 'btn-danger'"
              (click)="confirmReview()" [disabled]="actioning">
              Confirm {{ reviewDecision | titlecase }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div *ngIf="loading" class="flex justify-center" style="padding:80px">
      <div class="spinner" style="width:40px;height:40px"></div>
    </div>
  `,
  styles: [`
    .detail-layout { display:grid; grid-template-columns:1fr 360px; gap:20px; align-items:start; }
    .detail-main { display:flex; flex-direction:column; gap:16px; }
    .detail-side { position:sticky; top:0; display:flex; flex-direction:column; }
    .card-label { display:flex; align-items:center; gap:8px; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:var(--text-muted); margin-bottom:4px; .material-icons { color:var(--primary); } }
    .ai-risk-card { border-left:4px solid; }
    .risk-card-green { border-left-color:#10b981 !important; }
    .risk-card-yellow { border-left-color:#f59e0b !important; }
    .risk-card-red { border-left-color:#ef4444 !important; }
    .risk-score-big { font-size:32px; font-weight:800; font-variant-numeric:tabular-nums; }
    .risk-score-label { font-size:12px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.06em; }
    .risk-badge-big { padding:6px 14px; border-radius:var(--radius-md); font-size:13px; font-weight:700; }
    .risk-badge-green { background:rgba(16,185,129,0.15); color:#10b981; }
    .risk-badge-yellow { background:rgba(245,158,11,0.15); color:#f59e0b; }
    .risk-badge-red { background:rgba(239,68,68,0.15); color:#ef4444; }
    .ai-issue-list { margin-top:14px; padding-top:14px; border-top:1px solid var(--border); }
    .clinical-notes { font-size:13px; color:var(--text-secondary); line-height:1.7; background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius-sm); padding:14px; margin-top:12px; white-space:pre-wrap; }
    .attachment-pill { display:flex; align-items:center; gap:4px; background:rgba(14,165,233,0.1); border:1px solid rgba(14,165,233,0.2); border-radius:20px; padding:4px 12px; font-size:12px; color:var(--primary); }
    .card-approved { border:1px solid rgba(16,185,129,0.3) !important; background:rgba(16,185,129,0.05) !important; }
    .card-rejected { border:1px solid rgba(239,68,68,0.3) !important; background:rgba(239,68,68,0.05) !important; }
    .timeline { display:flex; flex-direction:column; gap:0; }
    .timeline-item { display:flex; gap:12px; padding-bottom:16px; position:relative;
      &::before { content:''; position:absolute; left:6px; top:18px; bottom:0; width:1px; background:var(--border); }
      &:last-child::before { display:none; }
    }
    .tl-dot { width:14px; height:14px; border-radius:50%; flex-shrink:0; margin-top:3px; }
    .tl-success { background:#10b981; box-shadow:0 0 8px rgba(16,185,129,0.5); }
    .tl-primary { background:var(--primary); box-shadow:0 0 8px rgba(14,165,233,0.5); }
    .tl-danger { background:#ef4444; box-shadow:0 0 8px rgba(239,68,68,0.5); }
    .tl-warning { background:#f59e0b; }
    .tl-title { font-size:13px; font-weight:600; color:var(--text-primary); }
    .tl-time { font-size:11px; color:var(--text-muted); margin-top:2px; }
    .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:1000; }
    .modal-box { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-xl); padding:28px; width:440px; max-width:95vw; }
    .modal-header { display:flex; align-items:center; gap:12px; font-size:18px; font-weight:700; .material-icons { font-size:28px; } }
    @media (max-width:1000px) { .detail-layout { grid-template-columns:1fr; } .detail-side { position:static; } }
  `]
})
export class CaseDetailComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatScroll') private chatScroll!: ElementRef;

  caseData: AuthorizationRequest | null = null;
  messages: Communication[] = [];
  newMessage = '';
  loading = true;
  actioning = false;
  showReviewModal = false;
  reviewDecision = '';
  reviewReason = '';
  private caseId = '';

  constructor(
    private route: ActivatedRoute,
    private authSvc: AuthorizationService,
    private commSvc: CommunicationService,
    private authService: AuthService
  ) {}

  get isPayer() { return this.authService.isPayer; }
  get currentUserId() { return this.authService.currentUser?.userId; }

  ngOnInit() {
    this.caseId = this.route.snapshot.paramMap.get('caseId')!;
    this.loadCase();
    this.loadMessages();
  }

  ngAfterViewChecked() {
    try { this.chatScroll?.nativeElement?.scrollTo(0, this.chatScroll.nativeElement.scrollHeight); } catch {}
  }

  loadCase() {
    this.loading = true;
    this.authSvc.getCaseDetail(this.caseId).subscribe({
      next: r => { if (r.success) this.caseData = r.data!; this.loading = false; },
      error: () => this.loading = false
    });
  }

  loadMessages() {
    this.commSvc.getMessages(this.caseId).subscribe(r => { if (r.success) this.messages = r.data!; });
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;
    const u = this.authService.currentUser!;
    const msg: Communication = {
      caseId: this.caseId, senderId: u.userId, senderName: u.fullName,
      senderRole: u.role, message: this.newMessage.trim(), messageType: 'GENERAL'
    };
    this.commSvc.sendMessage(msg).subscribe(r => {
      if (r.success) { this.messages.push(r.data!); this.newMessage = ''; }
    });
  }

  review(decision: string) { this.reviewDecision = decision; this.showReviewModal = true; }

  confirmReview() {
    this.actioning = true;
    this.authSvc.reviewRequest(this.caseId, this.reviewDecision, this.reviewReason).subscribe({
      next: r => { if (r.success) { this.caseData = r.data!; this.showReviewModal = false; } this.actioning = false; },
      error: () => this.actioning = false
    });
  }

  requestClarification() {
    this.actioning = true;
    this.authSvc.requestClarification(this.caseId).subscribe({
      next: r => { if (r.success) this.caseData = r.data!; this.actioning = false; },
      error: () => this.actioning = false
    });
  }

  submitCase() {
    this.actioning = true;
    this.authSvc.submitRequest(this.caseId).subscribe({
      next: r => { if (r.success) this.caseData = r.data!; this.actioning = false; },
      error: () => this.actioning = false
    });
  }

  getIssues() { return this.caseData?.aiIssues?.split('|').filter(s => s.trim()) || []; }
  getAttachments() { return this.caseData?.attachments?.split(',').map(s => s.trim()).filter(Boolean) || []; }
  getBadge(s?: string) { const m: any = { DRAFT:'badge-neutral',SUBMITTED:'badge-info',IN_PROGRESS:'badge-secondary',APPROVED:'badge-success',REJECTED:'badge-danger',REQUESTED:'badge-warning' }; return m[s||'']||'badge-neutral'; }
  getUrgency(u?: string) { return u==='CRITICAL'?'badge-danger':u==='HIGH'?'badge-warning':u==='MEDIUM'?'badge-info':'badge-neutral'; }
}
