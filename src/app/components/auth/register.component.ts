import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-page">
      <div class="login-bg">
        <div class="grid-pattern"></div>
        <div class="glow-orb orb1"></div>
        <div class="glow-orb orb2"></div>
      </div>
      <div class="login-container animate-fade" style="max-width:480px">
        <div class="login-brand">
          <div class="brand-icon"><span class="material-icons">monitor_heart</span></div>
          <h1>HealthConnect<span class="brand-accent">AI</span></h1>
          <p>Create your account</p>
        </div>
        <div class="login-card">
          <h2>Register</h2>
          <p class="login-subtitle">Join the healthcare authorization platform</p>

          <div *ngIf="success" class="alert alert-success" style="margin-bottom:16px">
            <span class="material-icons alert-icon">check_circle</span>
            <div class="alert-content"><div class="alert-title">Registration Successful!</div><div class="alert-message">Redirecting to login...</div></div>
          </div>
          <div *ngIf="error" class="alert alert-critical" style="margin-bottom:16px">
            <span class="material-icons alert-icon">error_outline</span>
            <div class="alert-content"><div class="alert-title">Error</div><div class="alert-message">{{ error }}</div></div>
          </div>

          <form (ngSubmit)="register()" #f="ngForm">
            <div class="grid-2" style="margin-bottom:14px">
              <div class="input-group">
                <label>Full Name</label>
                <input type="text" [(ngModel)]="form.fullName" name="fullName" placeholder="Dr. Jane Smith" required>
              </div>
              <div class="input-group">
                <label>Username</label>
                <input type="text" [(ngModel)]="form.username" name="username" placeholder="jsmith" required>
              </div>
            </div>
            <div class="input-group" style="margin-bottom:14px">
              <label>Email</label>
              <input type="email" [(ngModel)]="form.email" name="email" placeholder="dr.smith@hospital.com" required>
            </div>
            <div class="input-group" style="margin-bottom:14px">
              <label>Password</label>
              <input type="password" [(ngModel)]="form.password" name="password" placeholder="Min 8 characters" required>
            </div>
            <div class="grid-2" style="margin-bottom:14px">
              <div class="input-group">
                <label>Organization</label>
                <input type="text" [(ngModel)]="form.organization" name="organization" placeholder="City General Hospital">
              </div>
              <div class="input-group">
                <label>NPI Number (Providers)</label>
                <input type="text" [(ngModel)]="form.npiNumber" name="npiNumber" placeholder="10-digit NPI">
              </div>
            </div>
            <div class="input-group" style="margin-bottom:24px">
              <label>Role</label>
              <select [(ngModel)]="form.role" name="role" required>
                <option value="">Select Role</option>
                <option value="PROVIDER">Provider (Hospital / Clinic)</option>
                <option value="PAYER">Payer (Insurance Company)</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary w-full btn-lg" [disabled]="loading">
              <div class="spinner" *ngIf="loading" style="width:18px;height:18px;border-width:2px"></div>
              <span class="material-icons" *ngIf="!loading">how_to_reg</span>
              {{ loading ? 'Creating account...' : 'Create Account' }}
            </button>
          </form>
          <div class="login-footer" style="margin-top:20px">
            Already have an account? <a routerLink="/login">Sign in</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page { min-height:100vh; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; }
    .login-bg { position:absolute; inset:0; z-index:0; background:var(--bg-base); }
    .grid-pattern { position:absolute; inset:0; background-image:linear-gradient(rgba(14,165,233,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(14,165,233,0.05) 1px,transparent 1px); background-size:40px 40px; }
    .glow-orb { position:absolute; border-radius:50%; filter:blur(80px); }
    .orb1 { width:400px; height:400px; background:rgba(14,165,233,0.15); top:-100px; right:-100px; }
    .orb2 { width:300px; height:300px; background:rgba(99,102,241,0.12); bottom:-50px; left:-50px; }
    .login-container { position:relative; z-index:1; width:100%; padding:24px; }
    .login-brand { text-align:center; margin-bottom:24px; }
    .brand-icon { width:56px; height:56px; border-radius:16px; background:var(--gradient-primary); display:flex; align-items:center; justify-content:center; margin:0 auto 12px; box-shadow:var(--shadow-primary); }
    .brand-icon .material-icons { color:white; font-size:28px; }
    h1 { font-size:26px; font-weight:800; }
    .brand-accent { color:var(--primary); }
    p { color:var(--text-muted); font-size:13px; margin-top:4px; }
    .login-card { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-xl); padding:28px; }
    .login-subtitle { color:var(--text-muted); font-size:13px; margin:4px 0 20px; }
    .login-footer { text-align:center; font-size:13px; color:var(--text-muted); }
    .login-footer a { color:var(--primary); text-decoration:none; font-weight:600; }
  `]
})
export class RegisterComponent {
  form: any = { fullName: '', username: '', email: '', password: '', organization: '', npiNumber: '', role: '' };
  loading = false;
  error = '';
  success = false;

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    this.loading = true;
    this.error = '';
    this.authService.register(this.form).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res.success) {
          this.success = true;
          setTimeout(() => this.router.navigate(['/login']), 1500);
        } else {
          this.error = res.message;
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.message || 'Registration failed';
      }
    });
  }
}
