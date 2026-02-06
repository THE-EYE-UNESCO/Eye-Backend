import { User, Report, Incident, Alert, ResponderStatus, Evidence } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Pool } from 'pg';
import { config } from '../config';
import fs from 'fs';
import path from 'path';

export class DatabaseService {
  private static instance: DatabaseService;
  private pool: Pool;

  private constructor() {
    this.pool = new Pool({
      host: config.database.host,
      port: config.database.port,
      database: config.database.name,
      user: config.database.user,
      password: config.database.password,
    });

    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }

  public async initialize() {
    try {
      await this.pool.query('SELECT NOW()');
      console.log('✅ Connected to PostgreSQL successfully');
      await this.initSchema();
    } catch (err) {
      console.error('❌ Failed to connect to PostgreSQL:', err instanceof Error ? err.message : err);
      throw err;
    }
  }

  private async initSchema() {
    try {
      const schemaPath = path.join(process.cwd(), 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await this.pool.query(schema);
        console.log('✅ Database schema initialized successfully');
      } else {
        console.warn('⚠️ schema.sql not found, skipping initialization');
      }
    } catch (err) {
      console.error('❌ Failed to initialize database schema:', err instanceof Error ? err.message : err);
    }
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async createUser(userData: Omit<User, 'id' | 'created_at'>): Promise<User> {
    const id = uuidv4();
    const { name, email, phone, role, address, password_hash } = userData;
    
    const query = `
      INSERT INTO users (id, name, email, phone, address, role, password_hash)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const { rows } = await this.pool.query(query, [id, name, email, phone, address || '', role, password_hash]);
    return rows[0];
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const { rows } = await this.pool.query(query, [email]);
    return rows[0] || null;
  }

  async createReport(reportData: Omit<Report, 'id' | 'created_at'>): Promise<Report> {
    const id = uuidv4();
    const { citizen_id, title, description, category, severity, latitude, longitude, address, landmark, status } = reportData;
    
    const query = `
      INSERT INTO reports (id, citizen_id, title, description, category, severity, latitude, longitude, address, landmark, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const { rows } = await this.pool.query(query, [
      id, citizen_id, title, description, category, severity, latitude, longitude, address || '', landmark || '', status || 'PENDING'
    ]);
    return rows[0];
  }

  async createIncident(incidentData: Omit<Incident, 'id' | 'created_at'>): Promise<Incident> {
    const id = uuidv4();
    const { report_id, status, priority, assigned_responder_id } = incidentData;
    
    const query = `
      INSERT INTO incidents (id, report_id, status, priority, assigned_responder_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const { rows } = await this.pool.query(query, [id, report_id, status, priority, assigned_responder_id]);
    return rows[0];
  }

  async createAlert(alertData: Omit<Alert, 'id' | 'created_at'>): Promise<Alert> {
    const id = uuidv4();
    const { incident_id, message, priority } = alertData;
    
    const query = `
      INSERT INTO alerts (id, incident_id, message, priority)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const { rows } = await this.pool.query(query, [id, incident_id, message, priority]);
    return rows[0];
  }

  async updateResponderStatus(responderId: string, statusData: Omit<ResponderStatus, 'responder_id' | 'updated_at'>): Promise<ResponderStatus> {
    const { availability, last_lat, last_lng } = statusData;
    
    const query = `
      INSERT INTO responder_statuses (responder_id, availability, last_lat, last_lng, updated_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (responder_id) DO UPDATE
      SET availability = EXCLUDED.availability,
          last_lat = EXCLUDED.last_lat,
          last_lng = EXCLUDED.last_lng,
          updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    const { rows } = await this.pool.query(query, [responderId, availability, last_lat, last_lng]);
    return rows[0];
  }

  async createEvidence(evidenceData: Omit<Evidence, 'id' | 'created_at'>): Promise<Evidence> {
    const id = uuidv4();
    const { incident_id, uploaded_by, file_url, note } = evidenceData;
    
    const query = `
      INSERT INTO evidence (id, incident_id, uploaded_by, file_url, note)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const { rows } = await this.pool.query(query, [id, incident_id, uploaded_by, file_url, note]);
    return rows[0];
  }

  async getReport(id: string): Promise<Report | null> {
    const query = 'SELECT * FROM reports WHERE id = $1';
    const { rows } = await this.pool.query(query, [id]);
    return rows[0] || null;
  }

  async getIncident(id: string): Promise<Incident | null> {
    const query = 'SELECT * FROM incidents WHERE id = $1';
    const { rows } = await this.pool.query(query, [id]);
    return rows[0] || null;
  }

  async getAllReports(): Promise<Report[]> {
    const query = 'SELECT * FROM reports ORDER BY created_at DESC';
    const { rows } = await this.pool.query(query);
    return rows;
  }

  async getReportsByCitizen(citizenId: string): Promise<Report[]> {
    const query = 'SELECT * FROM reports WHERE citizen_id = $1 ORDER BY created_at DESC';
    const { rows } = await this.pool.query(query, [citizenId]);
    return rows;
  }

  async getAllIncidents(): Promise<Incident[]> {
    const query = 'SELECT * FROM incidents ORDER BY created_at DESC';
    const { rows } = await this.pool.query(query);
    return rows;
  }

  async getReportsByStatus(status: string): Promise<Report[]> {
    const query = 'SELECT * FROM reports WHERE status = $1 ORDER BY created_at DESC';
    const { rows } = await this.pool.query(query, [status]);
    return rows;
  }

  async getIncidentsByStatus(status: string): Promise<Incident[]> {
    const query = 'SELECT * FROM incidents WHERE status = $1 ORDER BY created_at DESC';
    const { rows } = await this.pool.query(query, [status]);
    return rows;
  }

  async deleteReport(id: string): Promise<void> {
    const query = 'DELETE FROM reports WHERE id = $1';
    await this.pool.query(query, [id]);
  }

  async deleteIncident(id: string): Promise<void> {
    const query = 'DELETE FROM incidents WHERE id = $1';
    await this.pool.query(query, [id]);
  }

  async getIncidentsByResponder(responderId: string): Promise<Incident[]> {
    const query = 'SELECT * FROM incidents WHERE assigned_responder_id = $1 ORDER BY created_at DESC';
    const { rows } = await this.pool.query(query, [responderId]);
    return rows;
  }

  async updateReport(id: string, updates: Partial<Report>): Promise<Report | null> {
    const keys = Object.keys(updates);
    if (keys.length === 0) return this.getReport(id);

    const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
    const query = `UPDATE reports SET ${setClause} WHERE id = $1 RETURNING *`;
    
    const { rows } = await this.pool.query(query, [id, ...Object.values(updates)]);
    return rows[0] || null;
  }

  async updateIncident(id: string, updates: Partial<Incident>): Promise<Incident | null> {
    const keys = Object.keys(updates);
    if (keys.length === 0) return this.getIncident(id);

    const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
    const query = `UPDATE incidents SET ${setClause} WHERE id = $1 RETURNING *`;
    
    const { rows } = await this.pool.query(query, [id, ...Object.values(updates)]);
    return rows[0] || null;
  }

  async getDashboardMetrics(): Promise<any> {
    const reportsQuery = 'SELECT COUNT(*) FROM reports';
    const activeIncidentsQuery = "SELECT COUNT(*) FROM incidents WHERE status != 'RESOLVED'";
    const resolvedIncidentsQuery = "SELECT COUNT(*) FROM incidents WHERE status = 'RESOLVED'";
    const availableRespondersQuery = "SELECT COUNT(*) FROM responder_statuses WHERE availability = 'AVAILABLE'";
    const busyRespondersQuery = "SELECT COUNT(*) FROM responder_statuses WHERE availability = 'BUSY'";

    const [reports, active, resolved, available, busy] = await Promise.all([
      this.pool.query(reportsQuery),
      this.pool.query(activeIncidentsQuery),
      this.pool.query(resolvedIncidentsQuery),
      this.pool.query(availableRespondersQuery),
      this.pool.query(busyRespondersQuery)
    ]);

    return {
      totalReports: parseInt(reports.rows[0].count),
      activeIncidents: parseInt(active.rows[0].count),
      resolvedIncidents: parseInt(resolved.rows[0].count),
      availableResponders: parseInt(available.rows[0].count),
      busyResponders: parseInt(busy.rows[0].count)
    };
  }

  // --- Story Methods ---

  async createStory(storyData: { id: string; citizen_id: string; title: string; body: string; image_url?: string; tag?: string }): Promise<any> {
    const { id, citizen_id, title, body, image_url, tag } = storyData;
    const query = `
      INSERT INTO stories (id, citizen_id, title, body, image_url, tag)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const { rows } = await this.pool.query(query, [id, citizen_id, title, body, image_url, tag]);
    return rows[0];
  }

  async getAllStories(userId?: string): Promise<any[]> {
    const query = `
      SELECT s.*, u.name as author_name,
        (SELECT COUNT(*) FROM story_likes WHERE story_id = s.id) as likes_count,
        (SELECT COUNT(*) FROM story_comments WHERE story_id = s.id) as comments_count
        ${userId ? `, EXISTS(SELECT 1 FROM story_likes WHERE story_id = s.id AND user_id = $1) as user_has_liked` : ''}
      FROM stories s
      JOIN users u ON s.citizen_id = u.id
      ORDER BY s.created_at DESC
    `;
    const { rows } = await this.pool.query(query, userId ? [userId] : []);
    return rows;
  }

  async likeStory(id: string, storyId: string, userId: string): Promise<void> {
    const query = 'INSERT INTO story_likes (id, story_id, user_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING';
    await this.pool.query(query, [id, storyId, userId]);
  }

  async unlikeStory(storyId: string, userId: string): Promise<void> {
    const query = 'DELETE FROM story_likes WHERE story_id = $1 AND user_id = $2';
    await this.pool.query(query, [storyId, userId]);
  }

  async addComment(commentData: { id: string; story_id: string; user_id: string; body: string }): Promise<any> {
    const { id, story_id, user_id, body } = commentData;
    const query = `
      INSERT INTO story_comments (id, story_id, user_id, body)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const { rows } = await this.pool.query(query, [id, story_id, user_id, body]);
    return rows[0];
  }

  async getCommentsByStory(storyId: string): Promise<any[]> {
    const query = `
      SELECT c.*, u.name as author_name
      FROM story_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.story_id = $1
      ORDER BY c.created_at ASC
    `;
    const { rows } = await this.pool.query(query, [storyId]);
    return rows;
  }

  async updateStory(storyId: string, citizenId: string, updateData: { title?: string; body?: string; image_url?: string; tag?: string }): Promise<any> {
    const { title, body, image_url, tag } = updateData;
    const fields = [];
    const values = [];
    let idx = 1;

    if (title) { fields.push(`title = $${idx++}`); values.push(title); }
    if (body) { fields.push(`body = $${idx++}`); values.push(body); }
    if (image_url) { fields.push(`image_url = $${idx++}`); values.push(image_url); }
    if (tag) { fields.push(`tag = $${idx++}`); values.push(tag); }

    if (fields.length === 0) return null;

    values.push(storyId, citizenId);
    const query = `
      UPDATE stories SET ${fields.join(', ')}
      WHERE id = $${idx++} AND citizen_id = $${idx++}
      RETURNING *
    `;
    const { rows } = await this.pool.query(query, values);
    return rows[0];
  }

  async deleteStory(storyId: string, citizenId: string): Promise<boolean> {
    const query = 'DELETE FROM stories WHERE id = $1 AND citizen_id = $2';
    const { rowCount } = await this.pool.query(query, [storyId, citizenId]);
    return (rowCount ?? 0) > 0;
  }

  async getCommunityStats(): Promise<any> {
    const membersQuery = 'SELECT COUNT(*) FROM users WHERE role = \'citizen\'';
    const storiesQuery = 'SELECT COUNT(*) FROM stories';
    const commentsQuery = 'SELECT COUNT(*) FROM story_comments';
    const likesQuery = 'SELECT COUNT(*) FROM story_likes';

    const [members, stories, comments, likes] = await Promise.all([
      this.pool.query(membersQuery),
      this.pool.query(storiesQuery),
      this.pool.query(commentsQuery),
      this.pool.query(likesQuery)
    ]);

    return {
      activeMembers: parseInt(members.rows[0].count),
      storiesShared: parseInt(stories.rows[0].count),
      commentsCount: parseInt(comments.rows[0].count),
      sharesCount: parseInt(likes.rows[0].count)
    };
  }
}
