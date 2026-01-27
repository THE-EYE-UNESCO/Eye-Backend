# The Eye - Complete API Endpoints

Base URL: `http://localhost:3000/api`

---

## 🔐 Authentication Endpoints

### 1. Register User
**POST** `/auth/register`
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "role": "CITIZEN"
}
```
**Roles:** `CITIZEN`, `ADMIN`, `RESPONDER`

### 2. Login
**POST** `/auth/login`
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```
**Response:** Returns JWT token

---

## 📋 Reports Endpoints (Citizen)
**Auth Required:** Yes (Bearer Token)

### 3. Create Report
**POST** `/reports`
```json
{
  "title": "Building Fire on Main Street",
  "description": "Large fire at downtown office building",
  "category": "Fire",
  "severity": "HIGH",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```
**Severity:** `LOW`, `MEDIUM`, `HIGH`

### 4. Get All Reports
**GET** `/reports`
**Response:**
```json
{
  "reports": [...],
  "total": 10
}
```

### 5. Get Single Report
**GET** `/reports/:id`
**Response:**
```json
{
  "report": {
    "id": "uuid",
    "title": "...",
    "status": "PENDING",
    ...
  }
}
```

### 6. Get Report Status
**GET** `/reports/:id/status`
**Response:**
```json
{
  "status": {
    "reportId": "uuid",
    "status": "PENDING",
    "message": "Your report is pending verification"
  }
}
```

### 7. Update Report
**PUT** `/reports/:id`
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "severity": "MEDIUM"
}
```

### 8. Delete Report
**DELETE** `/reports/:id`
**Response:**
```json
{
  "message": "Report deleted successfully"
}
```

---

## 🏛️ Admin Endpoints
**Auth Required:** Yes (Admin Role)

### 9. Get Dashboard Metrics
**GET** `/admin/dashboard`
**Response:**
```json
{
  "dashboard": {
    "totalReports": 25,
    "activeIncidents": 5,
    "resolvedIncidents": 15,
    "availableResponders": 8,
    "busyResponders": 2
  }
}
```

### 10. Get Pending Reports
**GET** `/admin/reports`
**Response:**
```json
{
  "reports": [...]
}
```

### 11. Verify Report
**PATCH** `/admin/reports/:id/verify`
```json
{
  "verified": true,
  "priority": "HIGH"
}
```
**Priority:** `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`

**To Reject:**
```json
{
  "verified": false
}
```

### 12. Get All Incidents
**GET** `/admin/incidents`
**Response:**
```json
{
  "incidents": [...]
}
```

### 13. Get Single Incident
**GET** `/admin/incidents/:id`
**Response:**
```json
{
  "incident": {
    "id": "uuid",
    "report_id": "uuid",
    "status": "NEW",
    "priority": "HIGH",
    ...
  }
}
```

### 14. Update Incident
**PUT** `/admin/incidents/:id`
```json
{
  "priority": "CRITICAL",
  "status": "ASSIGNED"
}
```
**Status:** `NEW`, `ASSIGNED`, `ON_THE_WAY`, `ON_SITE`, `RESOLVED`

### 15. Delete Incident
**DELETE** `/admin/incidents/:id`
**Response:**
```json
{
  "message": "Incident deleted successfully"
}
```

### 16. Assign Responder
**POST** `/admin/incidents/:id/assign`
```json
{
  "responder_id": "responder-user-id-here"
}
```

---

## 🚨 Responder Endpoints
**Auth Required:** Yes (Responder Role)

### 17. Get Assigned Incidents
**GET** `/responder/incidents`
**Response:**
```json
{
  "incidents": [...]
}
```

### 18. Get Incident Details
**GET** `/responder/incidents/:id`
**Response:**
```json
{
  "incident": {
    "incident": {...},
    "report": {...}
  }
}
```

### 19. Update Incident Status
**PATCH** `/responder/incidents/:id/status`
```json
{
  "status": "ON_THE_WAY"
}
```
**Valid Transitions:**
- `ASSIGNED` → `ON_THE_WAY`
- `ON_THE_WAY` → `ON_SITE`
- `ON_SITE` → `RESOLVED`

### 20. Upload Evidence
**POST** `/responder/incidents/:id/evidence`
```json
{
  "file_url": "https://example.com/evidence/photo1.jpg",
  "note": "Photo of incident scene"
}
```

---

## 🏥 Health Check

### 21. Health Check
**GET** `/health` (No auth required)
**Response:**
```json
{
  "status": "OK",
  "timestamp": "2026-01-27T12:00:00.000Z"
}
```

---

## 📝 Complete CRUD Operations Summary

### Reports CRUD
- **Create:** `POST /reports`
- **Read All:** `GET /reports`
- **Read One:** `GET /reports/:id`
- **Update:** `PUT /reports/:id`
- **Delete:** `DELETE /reports/:id`

### Incidents CRUD (Admin)
- **Create:** Automatic via `PATCH /admin/reports/:id/verify`
- **Read All:** `GET /admin/incidents`
- **Read One:** `GET /admin/incidents/:id`
- **Update:** `PUT /admin/incidents/:id`
- **Delete:** `DELETE /admin/incidents/:id`

---

## 🔑 Authentication Headers

For all protected endpoints, include:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📊 Testing Workflow

1. **Register users** (Citizen, Admin, Responder)
2. **Login** to get JWT tokens
3. **Create reports** as Citizen
4. **Verify reports** as Admin (creates incidents)
5. **Assign responders** as Admin
6. **Update status** as Responder
7. **Upload evidence** as Responder

---

## ⚠️ Error Responses

All endpoints return consistent error format:
```json
{
  "message": "Error description"
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error
