import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthorizationService } from '../../services/authorization.service';
import { AuthorizationRequest } from '../../models/models';

@Component({
  selector: 'app-new-request',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="animate-fade">
      <div class="page-header">
        <div>
          <div class="page-title">New Authorization Request</div>
          <div class="page-subtitle">AI Copilot will validate your request in real-time</div>
        </div>
        <a [routerLink]="['/provider/dashboard']" class="btn btn-outline">
          <span class="material-icons" style="font-size:16px">arrow_back</span>Back
        </a>
      </div>

      <div class="new-request-layout">
        <!-- Form -->
        <div class="form-panel">
          <!-- Patient Section -->
          <div class="form-section">
            <div class="section-header">
              <span class="material-icons section-icon">person</span>
              <div>
                <div class="section-title">Patient Information</div>
                <div class="section-sub">FHIR Patient Resource</div>
              </div>
            </div>
            <div class="form-grid">
              <div class="input-group">
                <label>Patient Full Name *</label>
                <input type="text" [(ngModel)]="form.patientName" (input)="analyze()" placeholder="Jane Doe">
              </div>
              <div class="input-group">
                <label>Date of Birth *</label>
                <input type="date" [(ngModel)]="form.patientDob" (change)="analyze()">
              </div>
              <div class="input-group">
                <label>Patient ID</label>
                <input type="text" [(ngModel)]="form.patientId" placeholder="PID-XXXXX">
              </div>
              <div class="input-group">
                <label>Insurance ID *</label>
                <input type="text" [(ngModel)]="form.patientInsuranceId" (input)="analyze()" placeholder="INS-XXXXXX">
              </div>
            </div>
          </div>

          <!-- Procedure Section -->
          <div class="form-section">
            <div class="section-header">
              <span class="material-icons section-icon" style="background:rgba(99,102,241,0.15);color:#818cf8">medical_services</span>
              <div>
                <div class="section-title">Procedure Information</div>
                <div class="section-sub">FHIR Claim Resource</div>
              </div>
            </div>
            <div class="form-grid">
              <div class="input-group">
                <label>CPT Code *</label>
                <select [(ngModel)]="form.procedureCode" (change)="onProcedureChange()">
                  <option value="">Select CPT Code</option>
                  <option value="70551">CPT 70551 – Brain MRI without contrast</option>
                  <option value="70553">CPT 70553 – Brain MRI with contrast</option>
                  <option value="27447">CPT 27447 – Total Knee Arthroplasty</option>
                  <option value="63030">CPT 63030 – Lumbar Discectomy</option>
                  <option value="93306">CPT 93306 – Echocardiogram</option>
                  <option value="29827">CPT 29827 – Shoulder Arthroscopy</option>
                  <option value="43239">CPT 43239 – Upper GI Endoscopy</option>
                  <option value="66984">CPT 66984 – Cataract Extraction</option>
                </select>
              </div>
              <div class="input-group">
                <label>Procedure Description</label>
                <input type="text" [(ngModel)]="form.procedureDescription" placeholder="Auto-filled from CPT">
              </div>
              <div class="input-group">
                <label>ICD-10 Diagnostic Codes *</label>
                <input type="text" [(ngModel)]="form.icd10Codes" (input)="analyze()" placeholder="G43.909, M17.11">
              </div>
              <div class="input-group">
                <label>Urgency Level</label>
                <select [(ngModel)]="form.urgencyLevel">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical – Urgent Care</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Payer Section -->
          <div class="form-section">
            <div class="section-header">
              <span class="material-icons section-icon" style="background:rgba(16,185,129,0.15);color:#10b981">business</span>
              <div>
                <div class="section-title">Payer Information</div>
                <div class="section-sub">Insurance / Coverage Resource</div>
              </div>
            </div>
            <div class="form-grid">
              <div class="input-group">
                <label>Payer / Insurance Company *</label>
                <select [(ngModel)]="form.payerName" (change)="analyze()">
                  <option value="">Select Payer</option>
                  <option value="BlueCross BlueShield">BlueCross BlueShield</option>
                  <option value="Aetna">Aetna</option>
                  <option value="UnitedHealth">UnitedHealth</option>
                  <option value="Cigna">Cigna</option>
                  <option value="Humana">Humana</option>
                  <option value="Medicare">Medicare</option>
                  <option value="Medicaid">Medicaid</option>
                </select>
              </div>
              <div class="input-group">
                <label>Payer ID</label>
                <input type="text" [(ngModel)]="form.payerId" placeholder="BCB-001">
              </div>
            </div>
          </div>

          <!-- Clinical Notes -->
          <div class="form-section">
            <div class="section-header">
              <span class="material-icons section-icon" style="background:rgba(245,158,11,0.15);color:#f59e0b">description</span>
              <div>
                <div class="section-title">Clinical Justification</div>
                <div class="section-sub">Supporting Documentation</div>
              </div>
            </div>
            <div class="input-group">
              <label>Clinical Notes *</label>
              <textarea [(ngModel)]="form.clinicalNotes" (input)="analyze()" rows="5"
                placeholder="Describe the medical necessity. Include prior treatments, diagnoses, and supporting evidence..."></textarea>
            </div>
            <div class="input-group" style="margin-top:14px">
              <label>Attachments (comma separated filenames)</label>
              <input type="text" [(ngModel)]="form.attachments" placeholder="clinical_notes.pdf, lab_report.pdf, imaging.pdf">
            </div>
          </div>

          <!-- Action buttons -->
          <div class="form-actions">
            <button class="btn btn-outline" type="button" (click)="saveDraft()" [disabled]="saving">
              <span class="material-icons" style="font-size:16px">save</span>
              {{ saving ? 'Saving...' : 'Save Draft' }}
            </button>
            <button class="btn btn-primary btn-lg" type="button" (click)="submit()" [disabled]="submitting || !createdCaseId">
              <div class="spinner" *ngIf="submitting" style="width:18px;height:18px;border-width:2px"></div>
              <span class="material-icons" *ngIf="!submitting" style="font-size:16px">send</span>
              {{ submitting ? 'Submitting...' : 'Submit for Authorization' }}
            </button>
          </div>

          <div *ngIf="submitSuccess" class="alert alert-success animate-fade" style="margin-top:16px">
            <span class="material-icons alert-icon">check_circle</span>
            <div class="alert-content">
              <div class="alert-title">Request Submitted Successfully!</div>
              <div class="alert-message">Case {{ createdCaseId }} has been transmitted to {{ form.payerName }}.</div>
            </div>
          </div>
        </div>

        <!-- AI Copilot Sidebar -->
        <div class="ai-sidebar">
          <div class="ai-header">
            <div class="ai-icon"><span class="material-icons">auto_awesome</span></div>
            <div>
              <div class="ai-title">AI Copilot</div>
              <div class="ai-sub">Smart Guardrail System</div>
            </div>
            <div class="ai-status" *ngIf="analyzing">
              <div class="spinner" style="width:16px;height:16px;border-width:2px"></div>
            </div>
          </div>

          <!-- Score -->
          <div class="ai-score-section" *ngIf="analysis">
            <div class="score-label">Approval Probability</div>
            <div class="score-ring" [ngClass]="'score-' + (analysis.aiRiskLevel || 'GREEN').toLowerCase()">
              <div class="score-number">{{ analysis.aiRiskScore }}%</div>
              <div class="score-level">{{ analysis.aiRiskLevel }}</div>
            </div>
            <div class="risk-bar" style="margin-top:12px">
              <div class="risk-fill" [ngClass]="(analysis.aiRiskLevel||'GREEN').toLowerCase()"
                [style.width.%]="analysis.aiRiskScore"></div>
            </div>
            <div class="score-desc" [ngClass]="'score-desc-' + (analysis.aiRiskLevel||'GREEN').toLowerCase()">
              <span *ngIf="analysis.aiRiskLevel === 'GREEN'">✅ High chance of structural approval</span>
              <span *ngIf="analysis.aiRiskLevel === 'YELLOW'">⚠️ Issues detected — review before submitting</span>
              <span *ngIf="analysis.aiRiskLevel === 'RED'">🚨 Critical gaps — likely rejection</span>
            </div>
          </div>

          <!-- Checklist -->
          <div class="ai-checklist">
            <div class="checklist-title">Real-time Scan Checklist</div>

            <div class="check-item">
              <span class="material-icons check-icon" [ngClass]="form.patientName ? 'pass' : 'fail'">
                {{ form.patientName ? 'check_circle' : 'cancel' }}
              </span>
              <span class="check-text" [ngClass]="!form.patientName ? 'fail' : ''">
                Patient demographic data {{ form.patientName ? 'found' : 'missing' }}
              </span>
            </div>

            <div class="check-item">
              <span class="material-icons check-icon" [ngClass]="form.icd10Codes ? 'pass' : 'fail'">
                {{ form.icd10Codes ? 'check_circle' : 'cancel' }}
              </span>
              <span class="check-text" [ngClass]="!form.icd10Codes ? 'fail' : ''">
                ICD-10 diagnostic codes {{ form.icd10Codes ? 'linked' : 'missing' }}
              </span>
            </div>

            <div class="check-item">
              <span class="material-icons check-icon" [ngClass]="form.procedureCode ? 'pass' : 'fail'">
                {{ form.procedureCode ? 'check_circle' : 'cancel' }}
              </span>
              <span class="check-text" [ngClass]="!form.procedureCode ? 'fail' : ''">
                CPT procedure code {{ form.procedureCode ? 'specified' : 'missing' }}
              </span>
            </div>

            <div class="check-item">
              <span class="material-icons check-icon" [ngClass]="(form.clinicalNotes || '').length > 20 ? 'pass' : 'fail'">
                {{ (form.clinicalNotes || '').length > 20 ? 'check_circle' : 'cancel' }}
              </span>
              <span class="check-text" [ngClass]="(form.clinicalNotes || '').length <= 20 ? 'fail' : ''">
                Clinical justification notes {{ (form.clinicalNotes || '').length > 20 ? 'provided' : 'missing' }}
              </span>
            </div>

            <div class="check-item">
              <span class="material-icons check-icon" [ngClass]="form.payerName ? 'pass' : 'fail'">
                {{ form.payerName ? 'check_circle' : 'cancel' }}
              </span>
              <span class="check-text">Payer {{ form.payerName ? form.payerName : 'not selected' }}</span>
            </div>

            <div class="check-item">
              <span class="material-icons check-icon" [ngClass]="form.patientInsuranceId ? 'pass' : 'fail'">
                {{ form.patientInsuranceId ? 'check_circle' : 'cancel' }}
              </span>
              <span class="check-text">Insurance ID {{ form.patientInsuranceId ? 'present' : 'missing' }}</span>
            </div>
          </div>

          <!-- AI Issues -->
          <div class="ai-issues" *ngIf="analysis?.aiIssues">
            <div class="issues-title">
              <span class="material-icons" style="font-size:15px;color:#ef4444">report</span>
              Issues Detected
            </div>
            <div *ngFor="let issue of getIssues()" class="issue-item">
              <span class="material-icons" style="font-size:14px;color:#ef4444;flex-shrink:0">error_outline</span>
              {{ issue }}
            </div>
          </div>

          <!-- AI Fix Button -->
          <button class="btn btn-primary w-full" style="margin-top:14px" *ngIf="createdCaseId && hasIssues()"
            (click)="applyAiFixes()" [disabled]="fixing">
            <div class="spinner" *ngIf="fixing" style="width:16px;height:16px;border-width:2px"></div>
            <span class="material-icons" *ngIf="!fixing">auto_fix_high</span>
            {{ fixing ? 'Applying fixes...' : '✨ Apply AI Recommended Fixes' }}
          </button>

          <!-- AI Recommendations -->
          <div class="ai-recs" *ngIf="analysis?.aiRecommendations">
            <div class="recs-title">
              <span class="material-icons" style="font-size:15px;color:#818cf8">lightbulb</span>
              AI Recommendations
            </div>
            <div *ngFor="let rec of getRecs()" class="rec-item">→ {{ rec }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .new-request-layout { display:grid; grid-template-columns:1fr 320px; gap:20px; align-items:start; }
    .form-panel { display:flex; flex-direction:column; gap:16px; }
    .form-section { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-lg); padding:20px; }
    .section-header { display:flex; align-items:center; gap:12px; margin-bottom:18px; }
    .section-icon { width:38px; height:38px; border-radius:10px; background:rgba(14,165,233,0.15); color:var(--primary); display:flex; align-items:center; justify-content:center; font-size:20px; }
    .section-title { font-size:15px; font-weight:700; color:var(--text-primary); }
    .section-sub { font-size:11px; color:var(--text-muted); font-family:var(--font-mono); margin-top:2px; }
    .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
    .form-actions { display:flex; gap:12px; justify-content:flex-end; padding-top:4px; }

    .ai-sidebar { position:sticky; top:0; background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-lg); padding:20px; display:flex; flex-direction:column; gap:16px; }
    .ai-header { display:flex; align-items:center; gap:12px; }
    .ai-icon { width:38px; height:38px; border-radius:10px; background:linear-gradient(135deg,rgba(99,102,241,0.3),rgba(14,165,233,0.3)); display:flex; align-items:center; justify-content:center; .material-icons { color:#818cf8; font-size:22px; } }
    .ai-title { font-size:15px; font-weight:700; }
    .ai-sub { font-size:11px; color:var(--text-muted); }
    .ai-status { margin-left:auto; }

    .ai-score-section { background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius-md); padding:16px; text-align:center; }
    .score-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:var(--text-muted); margin-bottom:12px; }
    .score-ring { display:inline-flex; flex-direction:column; align-items:center; padding:16px 24px; border-radius:50%; border:4px solid; }
    .score-green { border-color:#10b981; background:rgba(16,185,129,0.08); .score-number { color:#10b981; } }
    .score-yellow { border-color:#f59e0b; background:rgba(245,158,11,0.08); .score-number { color:#f59e0b; } }
    .score-red { border-color:#ef4444; background:rgba(239,68,68,0.08); .score-number { color:#ef4444; } }
    .score-number { font-size:26px; font-weight:800; font-variant-numeric:tabular-nums; }
    .score-level { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; margin-top:2px; }
    .score-desc { font-size:12px; margin-top:10px; font-weight:600; }
    .score-desc-green { color:#10b981; }
    .score-desc-yellow { color:#f59e0b; }
    .score-desc-red { color:#ef4444; }

    .ai-checklist { }
    .checklist-title { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:var(--text-muted); margin-bottom:8px; }

    .ai-issues { background:rgba(239,68,68,0.06); border:1px solid rgba(239,68,68,0.2); border-radius:var(--radius-md); padding:12px; }
    .issues-title { font-size:12px; font-weight:700; color:#ef4444; margin-bottom:8px; display:flex; align-items:center; gap:6px; }
    .issue-item { font-size:12px; color:var(--text-secondary); padding:4px 0; padding-left:20px; line-height:1.5; }

    .ai-recs { background:rgba(99,102,241,0.06); border:1px solid rgba(99,102,241,0.2); border-radius:var(--radius-md); padding:12px; }
    .recs-title { font-size:12px; font-weight:700; color:#818cf8; margin-bottom:8px; display:flex; align-items:center; gap:6px; }
    .rec-item { font-size:12px; color:var(--text-secondary); padding:3px 0; line-height:1.5; }

    @media (max-width:900px) { .new-request-layout { grid-template-columns:1fr; } .ai-sidebar { position:static; } }
  `]
})
export class NewRequestComponent implements OnInit {
  form: AuthorizationRequest = {
    patientName: '', patientDob: '', patientId: '', patientInsuranceId: '',
    procedureCode: '', procedureDescription: '', icd10Codes: '', clinicalNotes: '',
    payerName: '', urgencyLevel: 'MEDIUM', attachments: ''
  };

  analysis: AuthorizationRequest | null = null;
  analyzing = false;
  saving = false;
  submitting = false;
  fixing = false;
  submitSuccess = false;
  createdCaseId: string | null = null;
  private analyzeTimer: any;

  constructor(private svc: AuthorizationService, private router: Router) {}
  ngOnInit() {}

  onProcedureChange() {
    const map: Record<string, string> = {
      '70551': 'Brain MRI without contrast', '70553': 'Brain MRI with contrast',
      '27447': 'Total Knee Arthroplasty', '63030': 'Lumbar Discectomy',
      '93306': 'Echocardiogram', '29827': 'Shoulder Arthroscopy',
      '43239': 'Upper GI Endoscopy', '66984': 'Cataract Extraction'
    };
    this.form.procedureDescription = map[this.form.procedureCode] || '';
    this.analyze();
  }

  analyze() {
    clearTimeout(this.analyzeTimer);
    this.analyzeTimer = setTimeout(() => {
      if (!this.form.patientName && !this.form.procedureCode) return;
      this.analyzing = true;
      this.svc.analyzeRequest(this.form).subscribe({
        next: res => { if (res.success) this.analysis = res.data!; this.analyzing = false; },
        error: () => this.analyzing = false
      });
    }, 600);
  }

  saveDraft() {
    this.saving = true;
    this.svc.createRequest(this.form).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.createdCaseId = res.data.caseId!;
          this.analysis = res.data;
        }
        this.saving = false;
      },
      error: () => this.saving = false
    });
  }

  submit() {
    if (!this.createdCaseId) { this.saveDraft(); return; }
    this.submitting = true;
    this.svc.submitRequest(this.createdCaseId).subscribe({
      next: res => {
        if (res.success) { this.submitSuccess = true; setTimeout(() => this.router.navigate(['/provider/cases']), 2000); }
        this.submitting = false;
      },
      error: () => this.submitting = false
    });
  }

  applyAiFixes() {
    if (!this.createdCaseId) return;
    this.fixing = true;
    this.svc.applyAiFixes(this.createdCaseId).subscribe({
      next: res => { if (res.success) this.analysis = res.data!; this.fixing = false; },
      error: () => this.fixing = false
    });
  }

  getIssues(): string[] {
    if (!this.analysis?.aiIssues) return [];
    return this.analysis.aiIssues.split('|').filter(s => s.trim());
  }

  getRecs(): string[] {
    if (!this.analysis?.aiRecommendations) return [];
    return this.analysis.aiRecommendations.split('|').filter(s => s.trim());
  }

  hasIssues(): boolean { return this.getIssues().length > 0; }
}
