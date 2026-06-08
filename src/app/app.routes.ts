import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'provider',
    loadComponent: () => import('./components/shared/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    data: { role: 'PROVIDER' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/provider-dashboard/provider-dashboard.component').then(m => m.ProviderDashboardComponent)
      },
      {
        path: 'new-request',
        loadComponent: () => import('./components/new-request/new-request.component').then(m => m.NewRequestComponent)
      },
      {
        path: 'cases',
        loadComponent: () => import('./components/provider-dashboard/active-cases.component').then(m => m.ActiveCasesComponent)
      },
      {
        path: 'cases/:caseId',
        loadComponent: () => import('./components/case-detail/case-detail.component').then(m => m.CaseDetailComponent)
      },
      {
        path: 'status',
        loadComponent: () => import('./components/status-tracking/status-tracking.component').then(m => m.StatusTrackingComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./components/shared/notifications.component').then(m => m.NotificationsComponent)
      }
    ]
  },
  {
    path: 'payer',
    loadComponent: () => import('./components/shared/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    data: { role: 'PAYER' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/payer-dashboard/payer-dashboard.component').then(m => m.PayerDashboardComponent)
      },
      {
        path: 'cases',
        loadComponent: () => import('./components/payer-dashboard/review-queue.component').then(m => m.ReviewQueueComponent)
      },
      {
        path: 'cases/:caseId',
        loadComponent: () => import('./components/case-detail/case-detail.component').then(m => m.CaseDetailComponent)
      },
      {
        path: 'status',
        loadComponent: () => import('./components/status-tracking/status-tracking.component').then(m => m.StatusTrackingComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./components/shared/notifications.component').then(m => m.NotificationsComponent)
      }
    ]
  },
  { path: '**', redirectTo: '/login' }
];
