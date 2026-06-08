export interface User {
  id?: number;
  username: string;
  email?: string;
  fullName?: string;
  organization?: string;
  npiNumber?: string;
  role: 'PROVIDER' | 'PAYER' | 'ADMIN';
}

export interface AuthResponse {
  token: string;
  username: string;
  fullName: string;
  role: 'PROVIDER' | 'PAYER' | 'ADMIN';
  userId: number;
  organization: string;
}

export type FhirStatus = 'DRAFT' | 'PROPOSED' | 'ACTIVE' | 'SUBMITTED' | 'IN_PROGRESS' | 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
export type KanbanStatus = 'DRAFT_AI_REVIEW' | 'TRANSMITTED' | 'PAYER_REVIEW' | 'INFO_REQUESTED' | 'FINALIZED';
export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AuthorizationRequest {
  id?: number;
  caseId?: string;
  patientName: string;
  patientDob: string;
  patientId: string;
  patientInsuranceId: string;
  procedureCode: string;
  procedureDescription: string;
  icd10Codes: string;
  clinicalNotes: string;
  providerId?: number;
  providerName?: string;
  providerNpi?: string;
  providerOrganization?: string;
  payerName: string;
  payerId?: string;
  fhirStatus?: FhirStatus;
  kanbanStatus?: KanbanStatus;
  urgencyLevel?: UrgencyLevel;
  aiRiskScore?: number;
  aiRiskLevel?: 'GREEN' | 'YELLOW' | 'RED';
  aiRecommendations?: string;
  aiIssues?: string;
  aiApproved?: boolean;
  decision?: string;
  decisionReason?: string;
  reviewerName?: string;
  submittedAt?: string;
  reviewedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  expiryDate?: string;
  attachments?: string;
}

export interface ProviderDashboard {
  draftsPendingReview: number;
  awaitingPayerResponse: number;
  aiPreApprovedRate: number;
  actionNeeded: number;
  recentCases: AuthorizationRequest[];
  recentNotifications: Notification[];
}

export interface PayerDashboard {
  incomingRequestsToday: number;
  autoAdjudicated: number;
  manualReviewQueue: number;
  avgTurnaroundTime: string;
  manualReviewCases: AuthorizationRequest[];
  recentNotifications: Notification[];
}

export interface Communication {
  id?: number;
  caseId: string;
  senderId?: number;
  senderName?: string;
  senderRole?: 'PROVIDER' | 'PAYER' | 'ADMIN';
  message: string;
  messageType?: 'CLARIFICATION_REQUEST' | 'CLARIFICATION_RESPONSE' | 'STATUS_UPDATE' | 'REJECTION_NOTICE' | 'APPROVAL_NOTICE' | 'GENERAL';
  read?: boolean;
  sentAt?: string;
}

export interface Notification {
  id?: number;
  userId?: number;
  caseId?: string;
  title: string;
  message: string;
  alertType: 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS' | 'AI_INSIGHT';
  read?: boolean;
  actionUrl?: string;
  createdAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
}
