import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-page">
      <div class="login-bg">
        <div class="grid-pattern"></div>
        <div class="glow-orb orb1"></div>
        <div class="glow-orb orb2"></div>
      </div>

      <div class="login-container animate-fade">
        <div class="login-brand">
          <div class="brand-icon">
            <span class="material-icons">monitor_heart</span>
          </div>
          <h1>HealthConnect<span class="brand-accent">AI</span></h1>
          <p>Smart Healthcare Authorization Platform</p>
        </div>

        <div class="login-card">
          <h2>Welcome back</h2>
          <p class="login-subtitle">Sign in to your account to continue</p>

          <div *ngIf="error" class="alert alert-critical" style="margin-bottom:16px">
            <span class="material-icons alert-icon">error_outline</span>
            <div class="alert-content">
              <div class="alert-title">Login Failed</div>
              <div class="alert-message">{{ error }}</div>
            </div>
          </div>

          <form (ngSubmit)="login()" #loginForm="ngForm">
            <div class="input-group" style="margin-bottom:16px">
              <label>Username</label>
              <div class="input-icon-wrap">
                <span class="material-icons input-icon">person</span>
                <input type="text" [(ngModel)]="username" name="username" placeholder="Enter username" required autocomplete="username">
              </div>
            </div>

            <div class="input-group" style="margin-bottom:24px">
              <label>Password</label>
              <div class="input-icon-wrap">
                <span class="material-icons input-icon">lock</span>
                <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password" name="password" placeholder="Enter password" required autocomplete="current-password">
                <button type="button" class="toggle-pass" (click)="showPassword=!showPassword">
                  <span class="material-icons">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
            </div>

            <button type="submit" class="btn btn-primary w-full btn-lg" [disabled]="loading">
              <div class="spinner" *ngIf="loading" style="width:18px;height:18px;border-width:2px"></div>
              <span class="material-icons" *ngIf="!loading">login</span>
              {{ loading ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>

          <div class="demo-accounts">
            <div class="demo-title">Demo Accounts</div>
            <div class="demo-grid">
              <button class="demo-btn" (click)="fillDemo('provider1','password123','PROVIDER')">
                <span class="material-icons">local_hospital</span>
                <div>
                  <div class="demo-role">Provider</div>
                  <div class="demo-cred">provider1 / password123</div>
                </div>
              </button>
              <button class="demo-btn" (click)="fillDemo('payer1','password123','PAYER')">
                <span class="material-icons">business</span>
                <div>
                  <div class="demo-role">Payer</div>
                  <div class="demo-cred">payer1 / password123</div>
                </div>
              </button>
            </div>
          </div>

          <div class="login-footer">
            Don't have an account? <a routerLink="/register">Register here</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }
    .login-bg {
      position: absolute; inset: 0; z-index: 0;
      background: var(--bg-base);
    }
    .grid-pattern {
      position: absolute; inset: 0;
      background-image: linear-gradient(rgba(14,165,233,0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(14,165,233,0.05) 1px, transparent 1px);
      background-size: 40px 40px;
    }
    .glow-orb {
      position: absolute; border-radius: 50%; filter: blur(80px);
      &.orb1 { width: 400px; height: 400px; background: rgba(14,165,233,0.15); top: -100px; right: -100px; }
      &.orb2 { width: 300px; height: 300px; background: rgba(99,102,241,0.12); bottom: -50px; left: -50px; }
    }
    .login-container {
      position: relative; z-index: 1;
      width: 100%; max-width: 420px; padding: 24px;
    }
    .login-brand {
      text-align: center; margin-bottom: 32px;
      .brand-icon {
        width: 56px; height: 56px; border-radius: 16px;
        background: var(--gradient-primary);
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 12px;
        box-shadow: var(--shadow-primary);
        .material-icons { color: white; font-size: 28px; }
      }
      h1 { font-size: 26px; font-weight: 800; color: var(--text-primary); }
      .brand-accent { color: var(--primary); }
      p { color: var(--text-muted); font-size: 13px; margin-top: 4px; }
    }
    .login-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: 32px;
      h2 { font-size: 20px; font-weight: 700; }
    }
    .login-subtitle { color: var(--text-muted); font-size: 13px; margin: 4px 0 24px; }
    .input-icon-wrap {
      position: relative;
      .input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 18px; pointer-events: none; }
      input { padding-left: 42px; }
      .toggle-pass { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted); display: flex; align-items: center; padding: 4px; &:hover { color: var(--text-primary); } }
    }
    .demo-accounts {
      margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border);
      .demo-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); margin-bottom: 12px; }
    }
    .demo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .demo-btn {
      background: var(--bg-input); border: 1px solid var(--border); border-radius: var(--radius-md);
      padding: 10px 12px; cursor: pointer; display: flex; align-items: center; gap: 10px;
      transition: all var(--transition); color: var(--text-primary); text-align: left;
      .material-icons { color: var(--primary); font-size: 20px; }
      .demo-role { font-size: 12px; font-weight: 700; color: var(--text-primary); }
      .demo-cred { font-size: 10px; color: var(--text-muted); font-family: var(--font-mono); margin-top: 2px; }
      &:hover { border-color: var(--primary); background: rgba(14,165,233,0.08); }
    }
    .login-footer {
      text-align: center; margin-top: 20px; font-size: 13px; color: var(--text-muted);
      a { color: var(--primary); text-decoration: none; font-weight: 600; &:hover { text-decoration: underline; } }
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  showPassword = false;
  loading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.isLoggedIn) {
      this.redirectUser();
    }
  }

  fillDemo(user: string, pass: string, role: string) {
    this.username = user;
    this.password = pass;
  }

  login() {
    if (!this.username || !this.password) return;
    this.loading = true;
    this.error = '';
    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) this.redirectUser();
        else this.error = res.message || 'Login failed';
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Login failed. Please check your credentials.';
      }
    });
  }

  private redirectUser() {
    const role = this.authService.currentUser?.role?.toLowerCase();
    this.router.navigate([`/${role}/dashboard`]);
  }
}
