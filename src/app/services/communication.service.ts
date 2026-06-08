import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Communication, Notification, ApiResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CommunicationService {
  private apiUrl = '/api/communication';

  constructor(private http: HttpClient) {}

  getMessages(caseId: string): Observable<ApiResponse<Communication[]>> {
    return this.http.get<ApiResponse<Communication[]>>(`${this.apiUrl}/${caseId}/messages`);
  }

  sendMessage(dto: Communication): Observable<ApiResponse<Communication>> {
    return this.http.post<ApiResponse<Communication>>(`${this.apiUrl}/send`, dto);
  }
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = '/api/notifications';

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<ApiResponse<Notification[]>> {
    return this.http.get<ApiResponse<Notification[]>>(this.apiUrl);
  }

  getUnreadCount(): Observable<any> {
    return this.http.get(`${this.apiUrl}/unread-count`);
  }

  markAllRead(): Observable<any> {
    return this.http.post(`${this.apiUrl}/mark-all-read`, {});
  }

  markRead(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/read`, {});
  }
}
