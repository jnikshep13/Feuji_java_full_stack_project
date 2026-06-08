import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/communication.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-layout">
      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed">
        <div class="sidebar-brand">
          <div class="brand-icon"><span class="material-icons">monitor_heart</span></div>
          <div class="brand-text" *ngIf="!sidebarCollapsed">
            <span class="brand-name">HealthConnect<span style="color:var(--primary)">AI</span></span>
            <span class="brand-role">{{ isProvider ? 'Provider Portal' : 'Payer Portal' }}</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section-label" *ngIf="!sidebarCollapsed">MAIN MENU</div>

          <ng-container *ngIf="isProvider">
            <a [routerLink]="['/provider/dashboard']" routerLinkActive="active" class="nav-item">
              <span class="material-icons">dashboard</span>
              <span *ngIf="!sidebarCollapsed">Dashboard</span>
            </a>
            <a [routerLink]="['/provider/new-request']" routerLinkActive="active" class="nav-item highlight">
              <span class="material-icons">add_circle</span>
              <span *ngIf="!sidebarCollapsed">New Request</span>
            </a>
            <a [routerLink]="['/provider/cases']" routerLinkActive="active" class="nav-item">
              <span class="material-icons">folder_open</span>
              <span *ngIf="!sidebarCollapsed">Active Cases</span>
            </a>
            <a [routerLink]="['/provider/status']" routerLinkActive="active" class="nav-item">
              <span class="material-icons">view_kanban</span>
              <span *ngIf="!sidebarCollapsed">Status Board</span>
            </a>
            <a [routerLink]="['/provider/notifications']" routerLinkActive="active" class="nav-item">
              <span class="material-icons">notifications</span>
              <span *ngIf="!sidebarCollapsed">Notifications</span>
              <span class="nav-badge" *ngIf="unreadCount > 0 && !sidebarCollapsed">{{ unreadCount }}</span>
            </a>
          </ng-container>

          <ng-container *ngIf="!isProvider">
            <a [routerLink]="['/payer/dashboard']" routerLinkActive="active" class="nav-item">
              <span class="material-icons">dashboard</span>
              <span *ngIf="!sidebarCollapsed">Dashboard</span>
            </a>
            <a [routerLink]="['/payer/cases']" routerLinkActive="active" class="nav-item">
              <span class="material-icons">pending_actions</span>
              <span *ngIf="!sidebarCollapsed">Review Queue</span>
            </a>
            <a [routerLink]="['/payer/status']" routerLinkActive="active" class="nav-item">
              <span class="material-icons">view_kanban</span>
              <span *ngIf="!sidebarCollapsed">Status Board</span>
            </a>
            <a [routerLink]="['/payer/notifications']" routerLinkActive="active" class="nav-item">
              <span class="material-icons">notifications</span>
              <span *ngIf="!sidebarCollapsed">Notifications</span>
              <span class="nav-badge" *ngIf="unreadCount > 0 && !sidebarCollapsed">{{ unreadCount }}</span>
            </a>
          </ng-container>
        </nav>

        <div class="sidebar-user">
          <div class="user-avatar">{{ initials }}</div>
          <div class="user-info" *ngIf="!sidebarCollapsed">
            <div class="user-name">{{ user?.fullName }}</div>
            <div class="user-org">{{ user?.organization }}</div>
          </div>
          <button class="btn btn-ghost btn-icon" (click)="logout()" *ngIf="!sidebarCollapsed" title="Logout">
            <span class="material-icons" style="font-size:18px">logout</span>
          </button>
        </div>
      </aside>

      <!-- Main content -->
      <div class="main-wrapper">
        <!-- Top Header -->
        <header class="top-header">
          <div class="header-left">
            <button class="btn btn-ghost btn-icon" (click)="sidebarCollapsed=!sidebarCollapsed">
              <span class="material-icons">{{ sidebarCollapsed ? 'menu_open' : 'menu' }}</span>
            </button>
            <div class="breadcrumb">
              <span class="bc-portal">{{ isProvider ? 'Provider' : 'Payer' }} Portal</span>
              <span class="material-icons bc-sep">chevron_right</span>
              <span class="bc-page">{{ pageTitle }}</span>
            </div>
          </div>
          <div class="header-right">
            <div class="fhir-badge">
              <span class="status-dot blue pulse"></span>
              FHIR R4 Active
            </div>
            <button class="icon-btn" [routerLink]="[isProvider ? '/provider/notifications' : '/payer/notifications']">
              <span class="material-icons">notifications</span>
              <span class="notif-dot" *ngIf="unreadCount > 0">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
            </button>
            <div class="header-avatar" (click)="logout()">{{ initials }}</div>
          </div>
        </header>

        <!-- Page content -->
        <main class="page-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-layout { display:flex; height:100vh; overflow:hidden; background:var(--bg-base); }

    .sidebar {
      width:var(--sidebar-width); background:var(--bg-surface); border-right:1px solid var(--border);
      display:flex; flex-direction:column; transition:width 0.2s ease; overflow:hidden; flex-shrink:0;
      &.collapsed { width:64px; }
    }
    .sidebar-brand {
      display:flex; align-items:center; gap:12px; padding:20px 16px; border-bottom:1px solid var(--border);
      .brand-icon { width:36px; height:36px; border-radius:10px; background:var(--gradient-primary); display:flex; align-items:center; justify-content:center; flex-shrink:0;
        .material-icons { color:white; font-size:20px; } }
      .brand-text { overflow:hidden; }
      .brand-name { display:block; font-size:14px; font-weight:800; color:var(--text-primary); white-space:nowrap; }
      .brand-role { display:block; font-size:10px; color:var(--text-muted); font-weight:600; text-transform:uppercase; letter-spacing:0.06em; margin-top:1px; }
    }
    .sidebar-nav { flex:1; padding:16px 10px; overflow-y:auto; }
    .nav-section-label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:var(--text-muted); padding:0 8px; margin-bottom:8px; }
    .nav-item {
      display:flex; align-items:center; gap:10px; padding:10px 10px; border-radius:var(--radius-md);
      color:var(--text-secondary); font-size:13px; font-weight:500; text-decoration:none;
      transition:all var(--transition); margin-bottom:2px; position:relative;
      .material-icons { font-size:20px; flex-shrink:0; }
      &:hover { background:var(--bg-card); color:var(--text-primary); }
      &.active { background:rgba(14,165,233,0.12); color:var(--primary); border:1px solid rgba(14,165,233,0.2); }
      &.highlight { background:rgba(14,165,233,0.08); color:var(--primary-light); }
    }
    .nav-badge { background:var(--danger); color:white; border-radius:20px; padding:1px 7px; font-size:10px; font-weight:700; margin-left:auto; }

    .sidebar-user {
      display:flex; align-items:center; gap:10px; padding:14px 16px; border-top:1px solid var(--border);
      .user-avatar { width:34px; height:34px; border-radius:50%; background:var(--gradient-primary); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:white; flex-shrink:0; }
      .user-name { font-size:12px; font-weight:600; color:var(--text-primary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:110px; }
      .user-org { font-size:10px; color:var(--text-muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:110px; }
    }

    .main-wrapper { flex:1; display:flex; flex-direction:column; overflow:hidden; }
    .top-header {
      height:var(--header-height); background:var(--bg-surface); border-bottom:1px solid var(--border);
      display:flex; align-items:center; justify-content:space-between; padding:0 20px; flex-shrink:0;
    }
    .header-left { display:flex; align-items:center; gap:12px; }
    .breadcrumb { display:flex; align-items:center; gap:4px; font-size:13px; }
    .bc-portal { color:var(--text-muted); }
    .bc-sep { font-size:16px; color:var(--text-muted); }
    .bc-page { color:var(--text-primary); font-weight:600; }
    .header-right { display:flex; align-items:center; gap:12px; }
    .fhir-badge { display:flex; align-items:center; gap:6px; font-size:11px; font-weight:700; color:var(--primary); background:rgba(14,165,233,0.1); border:1px solid rgba(14,165,233,0.2); border-radius:20px; padding:4px 12px; font-family:var(--font-mono); }
    .icon-btn { position:relative; width:36px; height:36px; background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-sm); display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--text-secondary); transition:all var(--transition);
      &:hover { border-color:var(--primary); color:var(--primary); }
      .material-icons { font-size:18px; }
    }
    .notif-dot { position:absolute; top:-4px; right:-4px; background:var(--danger); color:white; border-radius:20px; padding:0 5px; font-size:9px; font-weight:700; min-width:16px; text-align:center; }
    .header-avatar { width:34px; height:34px; border-radius:50%; background:var(--gradient-primary); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:white; cursor:pointer; }
    .page-content { flex:1; overflow-y:auto; padding:24px; }
  `]
})
export class LayoutComponent implements OnInit {
  sidebarCollapsed = false;
  unreadCount = 0;

  constructor(public authService: AuthService, private router: Router, private notifService: NotificationService) {}

  get isProvider() { return this.authService.isProvider; }
  get user() { return this.authService.currentUser; }
  get initials() {
    const n = this.user?.fullName || this.user?.username || 'U';
    return n.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  }
  get pageTitle() {
    const url = this.router.url;
    if (url.includes('dashboard')) return 'Dashboard';
    if (url.includes('new-request')) return 'New Request';
    if (url.includes('status')) return 'Status Board';
    if (url.includes('notifications')) return 'Notifications';
    if (url.includes('cases')) return 'Cases';
    return 'Overview';
  }

  ngOnInit() { this.loadUnreadCount(); }

  loadUnreadCount() {
    this.notifService.getUnreadCount().subscribe((res: any) => {
      if (res.success) this.unreadCount = res.count || 0;
    });
  }

  logout() { this.authService.logout(); }
}
