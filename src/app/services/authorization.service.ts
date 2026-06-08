import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthorizationRequest, ProviderDashboard, PayerDashboard, ApiResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthorizationService {
  private apiUrl = '/api/authorization';

  constructor(private http: HttpClient) {}

  createRequest(dto: AuthorizationRequest): Observable<ApiResponse<AuthorizationRequest>> {
    return this.http.post<ApiResponse<AuthorizationRequest>>(`${this.apiUrl}/create`, dto);
  }

  analyzeRequest(dto: AuthorizationRequest): Observable<ApiResponse<AuthorizationRequest>> {
    return this.http.post<ApiResponse<AuthorizationRequest>>(`${this.apiUrl}/analyze`, dto);
  }

  submitRequest(caseId: string): Observable<ApiResponse<AuthorizationRequest>> {
    return this.http.post<ApiResponse<AuthorizationRequest>>(`${this.apiUrl}/${caseId}/submit`, {});
  }

  applyAiFixes(caseId: string): Observable<ApiResponse<AuthorizationRequest>> {
    return this.http.post<ApiResponse<AuthorizationRequest>>(`${this.apiUrl}/${caseId}/ai-fix`, {});
  }

  reviewRequest(caseId: string, decision: string, reason: string): Observable<ApiResponse<AuthorizationRequest>> {
    return this.http.post<ApiResponse<AuthorizationRequest>>(`${this.apiUrl}/${caseId}/review`, { decision, reason });
  }

  requestClarification(caseId: string): Observable<ApiResponse<AuthorizationRequest>> {
    return this.http.post<ApiResponse<AuthorizationRequest>>(`${this.apiUrl}/${caseId}/clarification`, {});
  }

  getProviderDashboard(): Observable<ApiResponse<ProviderDashboard>> {
    return this.http.get<ApiResponse<ProviderDashboard>>(`${this.apiUrl}/provider/dashboard`);
  }

  getPayerDashboard(): Observable<ApiResponse<PayerDashboard>> {
    return this.http.get<ApiResponse<PayerDashboard>>(`${this.apiUrl}/payer/dashboard`);
  }

  getPayerCases(page = 0, size = 20): Observable<ApiResponse<AuthorizationRequest[]>> {
    return this.http.get<ApiResponse<AuthorizationRequest[]>>(`${this.apiUrl}/payer/cases`, {
      params: new HttpParams().set('page', page).set('size', size)
    });
  }

  getProviderCases(): Observable<ApiResponse<AuthorizationRequest[]>> {
    return this.http.get<ApiResponse<AuthorizationRequest[]>>(`${this.apiUrl}/provider/cases`);
  }

  getKanbanBoard(): Observable<ApiResponse<AuthorizationRequest[]>> {
    return this.http.get<ApiResponse<AuthorizationRequest[]>>(`${this.apiUrl}/kanban`);
  }

  getCaseDetail(caseId: string): Observable<ApiResponse<AuthorizationRequest>> {
    return this.http.get<ApiResponse<AuthorizationRequest>>(`${this.apiUrl}/${caseId}`);
  }
}
