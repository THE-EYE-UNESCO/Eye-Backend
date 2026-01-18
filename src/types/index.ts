import { UserRole, ReportStatus, IncidentStatus, Severity, Priority, Availability, AlertPriority } from './enums';

export { UserRole, ReportStatus, IncidentStatus, Severity, Priority, Availability, AlertPriority };

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  password_hash: string;
  created_at: Date;
}

export interface Report {
  id: string;
  citizen_id?: string;
  title: string;
  description: string;
  category: string;
  severity: Severity;
  latitude: number;
  longitude: number;
  status: ReportStatus;
  created_at: Date;
}

export interface Incident {
  id: string;
  report_id: string;
  status: IncidentStatus;
  priority: Priority;
  assigned_responder_id?: string;
  created_at: Date;
}

export interface Alert {
  id: string;
  incident_id: string;
  message: string;
  priority: AlertPriority;
  created_at: Date;
}

export interface ResponderStatus {
  responder_id: string;
  availability: Availability;
  last_lat?: number;
  last_lng?: number;
  updated_at: Date;
}

export interface Evidence {
  id: string;
  incident_id: string;
  uploaded_by: string;
  file_url: string;
  note?: string;
  created_at: Date;
}

export interface CreateReportRequest {
  title: string;
  description: string;
  category: string;
  severity: Severity;
  latitude: number;
  longitude: number;
  anonymous?: boolean;
}

export interface VerifyReportRequest {
  verified: boolean;
  priority?: Priority;
}

export interface AssignResponderRequest {
  responder_id: string;
}

export interface UpdateIncidentStatusRequest {
  status: IncidentStatus;
}

export interface CreateEvidenceRequest {
  file_url: string;
  note?: string;
}
