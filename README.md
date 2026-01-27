# The Eye - Crisis Management Backend

A comprehensive crisis management and response system backend built with TypeScript, Node.js, and Express.

## Features

- **Citizen Portal**: Report crises anonymously or as registered users
- **Admin Dashboard**: Verify reports, manage incidents, assign responders
- **Field Responder Portal**: View assigned incidents, update status, upload evidence
- **Role-Based Access Control**: Secure authentication and authorization
- **Real-time Notifications**: Alert system for critical incidents

## Architecture

### Core Components

1. **Authentication Service**: JWT-based auth with role management
2. **Report Service**: Handle citizen reports with validation
3. **Admin Service**: Incident management and responder assignment
4. **Responder Service**: Field operations and evidence management
5. **Database Service**: In-memory data storage (production: PostgreSQL)

### Data Flow

1. **Citizen** creates report → **PENDING**
2. **Admin** verifies report → creates **INCIDENT**
3. **System** generates alerts for high severity
4. **Admin** assigns responder → **ASSIGNED**
5. **Responder** updates status → **ON_THE_WAY** → **ON_SITE** → **RESOLVED**

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Reports (Citizen)
- `POST /api/reports` - Create new report
- `GET /api/reports/:id` - Get report details
- `GET /api/reports/:id/status` - Get report status

### Admin
- `GET /api/admin/dashboard` - Dashboard metrics
- `GET /api/admin/reports` - Pending reports
- `PATCH /api/admin/reports/:id/verify` - Verify/reject report
- `GET /api/admin/incidents` - All incidents
- `POST /api/admin/incidents/:id/assign` - Assign responder

### Field Responder
- `GET /api/responder/incidents` - Assigned incidents
- `GET /api/responder/incidents/:id` - Incident details
- `PATCH /api/responder/incidents/:id/status` - Update status
- `POST /api/responder/incidents/:id/evidence` - Upload evidence

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Build the project:
```bash
npm run build
```

4. Start the server:
```bash
npm start
```

For development:
```bash
npm run dev
```

## Data Models

### User
- id, name, email, phone, role, password_hash, created_at

### Report
- id, citizen_id, title, description, category, severity, latitude, longitude, status, created_at

### Incident
- id, report_id, status, priority, assigned_responder_id, created_at

### Alert
- id, incident_id, message, priority, created_at

### Evidence
- id, incident_id, uploaded_by, file_url, note, created_at

## Security Features

- JWT authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- Password hashing with bcrypt
- Error handling with custom AppError class

## Next Steps

- [ ] PostgreSQL database integration
- [ ] Redis for real-time notifications
- [ ] WebSocket implementation for live updates
- [ ] File upload service for evidence
- [ ] Geo-location based responder assignment
- [ ] Rate limiting and API throttling
- [ ] Comprehensive logging and monitoring

## Technologies Used

- TypeScript
- Node.js
- Express.js
- JWT
- bcryptjs
- UUID
- Morgan (logging)
- Helmet (security)
- CORS
