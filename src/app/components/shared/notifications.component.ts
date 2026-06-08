import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../services/communication.service';
import { Notification } from '../../models/models';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="animate-fade">
      <div class="page-header">
        <div>
          <div class="page-title">Notification Center</div>
          <div class="page-subtitle">{{ unread }} unread notifications</div>
        </div>
        <button class="btn btn-outline" (click)="markAllRead()" *ngIf="unread > 0">
          <span class="material-icons" style="font-size:16px">done_all</span>Mark All Read
        </button>
      </div>

      <div *ngIf="loading" class="flex justify-center" style="padding:60px">
        <div class="spinner" style="width:36px;height:36px"></div>
      </div>

      <div *ngIf="!loading && notifications.length === 0" style="text-align:center;padding:80px;color:var(--text-muted)">
        <span class="material-icons" style="font-size:56px;display:block;margin-bottom:16px;opacity:0.3">notifications_none</span>
        <div style="font-size:16px;font-weight:600">You're all caught up!</div>
        <div style="font-size:13px;margin-top:4px">No notifications at this time.</div>
      </div>

      <div *ngIf="!loading && notifications.length > 0" class="notif-list">
        <div *ngFor="let n of notifications" class="notif-item" [class.unread]="!n.read"
          (click)="markRead(n)">
          <div class="notif-icon-wrap" [ngClass]="getIconClass(n.alertType)">
            <span class="material-icons">{{ getIcon(n.alertType) }}</span>
          </div>
          <div class="notif-content">
            <div class="notif-title">{{ n.title }}</div>
            <div class="notif-message">{{ n.message }}</div>
            <div class="notif-meta">
              <span class="notif-time">{{ n.createdAt | date:'MMM d, y · h:mm a' }}</span>
              <span class="notif-case" *ngIf="n.caseId">{{ n.caseId }}</span>
            </div>
          </div>
          <div class="notif-actions">
            <span class="unread-dot" *ngIf="!n.read"></span>
            <a *ngIf="n.actionUrl" [routerLink]="[n.actionUrl]" class="btn btn-outline btn-sm" (click)="$event.stopPropagation()">
              <span class="material-icons" style="font-size:14px">open_in_new</span>View
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notif-list { display:flex; flex-direction:column; gap:8px; }
    .notif-item {
      display:flex; align-items:flex-start; gap:14px; background:var(--bg-card); border:1px solid var(--border);
      border-radius:var(--radius-lg); padding:16px; cursor:pointer; transition:all var(--transition);
      &:hover { border-color:var(--border-light); background:var(--bg-card-hover); }
      &.unread { border-left:3px solid var(--primary); background:rgba(14,165,233,0.04); }
    }
    .notif-icon-wrap {
      width:42px; height:42px; border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center; flex-shrink:0;
      .material-icons { font-size:20px; }
      &.icon-critical { background:rgba(239,68,68,0.15); color:#ef4444; }
      &.icon-warning { background:rgba(245,158,11,0.15); color:#f59e0b; }
      &.icon-success { background:rgba(16,185,129,0.15); color:#10b981; }
      &.icon-info { background:rgba(14,165,233,0.15); color:#0ea5e9; }
      &.icon-ai { background:rgba(99,102,241,0.15); color:#818cf8; }
    }
    .notif-content { flex:1; min-width:0; }
    .notif-title { font-size:14px; font-weight:700; color:var(--text-primary); }
    .notif-message { font-size:13px; color:var(--text-secondary); margin-top:3px; line-height:1.5; }
    .notif-meta { display:flex; align-items:center; gap:10px; margin-top:8px; }
    .notif-time { font-size:11px; color:var(--text-muted); }
    .notif-case { font-size:11px; font-family:var(--font-mono); color:var(--primary); background:rgba(14,165,233,0.1); padding:1px 8px; border-radius:20px; }
    .notif-actions { display:flex; flex-direction:column; align-items:center; gap:8px; flex-shrink:0; }
    .unread-dot { width:10px; height:10px; border-radius:50%; background:var(--primary); box-shadow:0 0 8px rgba(14,165,233,0.5); }
  `]
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  loading = true;
  get unread() { return this.notifications.filter(n => !n.read).length; }

  constructor(private svc: NotificationService) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.svc.getNotifications().subscribe({
      next: r => { if (r.success) this.notifications = r.data!; this.loading = false; },
      error: () => this.loading = false
    });
  }

  markRead(n: Notification) {
    if (!n.read && n.id) {
      this.svc.markRead(n.id).subscribe();
      n.read = true;
    }
  }

  markAllRead() {
    this.svc.markAllRead().subscribe(() => this.notifications.forEach(n => n.read = true));
  }

  getIcon(t?: string) {
    return t === 'CRITICAL' ? 'error' : t === 'WARNING' ? 'warning' : t === 'SUCCESS' ? 'check_circle' : t === 'AI_INSIGHT' ? 'auto_awesome' : 'info';
  }
  getIconClass(t?: string) {
    return t === 'CRITICAL' ? 'icon-critical' : t === 'WARNING' ? 'icon-warning' : t === 'SUCCESS' ? 'icon-success' : t === 'AI_INSIGHT' ? 'icon-ai' : 'icon-info';
  }
}
