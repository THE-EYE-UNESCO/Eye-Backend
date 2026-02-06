import { UserRole, ReportStatus, IncidentStatus, Severity, Priority, Availability, AlertPriority } from './enums';

export { UserRole, ReportStatus, IncidentStatus, Severity, Priority, Availability, AlertPriority };

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
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
  address?: string;
  landmark?: string;
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

export interface Story {
  id: string;
  citizen_id: string;
  author_name?: string;
  title: string;
  body: string;
  image_url?: string;
  tag?: string;
  likes_count: number;
  comments_count: number;
  user_has_liked?: boolean;
  created_at: Date;
}

export interface StoryComment {
  id: string;
  story_id: string;
  user_id: string;
  author_name?: string;
  body: string;
  created_at: Date;
}

export interface CreateStoryRequest {
  title: string;
  body: string;
  image_url?: string;
  tag?: string;
}

export interface UpdateStoryRequest {
  title?: string;
  body?: string;
  image_url?: string;
  tag?: string;
}

export interface PostCommentRequest {
  body: string;
}

export interface CreateReportRequest {
  title: string;
  description: string;
  category: string;
  severity: Severity;
  latitude: number;
  longitude: number;
  address?: string;
  landmark?: string;
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
