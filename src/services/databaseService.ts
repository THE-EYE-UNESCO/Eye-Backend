import { User, Report, Incident, Alert, ResponderStatus, Evidence } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

export class DatabaseService {
  private static instance: DatabaseService;
  private pool: Pool;

  private constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not defined');
    }

    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false } // REQUIRED for Supabase
    });

    this.pool.on('error', (err) => {
      console.error('Unexpected PostgreSQL error', err);
      process.exit(1);
    });
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async initialize() {
    try {
      await this.pool.query('SELECT 1');
      console.log('✅ Connected to Supabase PostgreSQL');
      await this.initSchema();
    } catch (err) {
      console.error('❌ Failed to connect to PostgreSQL:', err);
      throw err;
    }
  }

  private async initSchema() {
    try {
      const schemaPath = path.join(process.cwd(), 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await this.pool.query(schema);
        console.log('✅ Database schema initialized');
      } else {
        console.warn('⚠️ schema.sql not found, skipping initialization');
      }
    } catch (err) {
      console.error('❌ Failed to initialize database schema:', err);
    }
  }

  // ---------------- USERS ----------------

  async createUser(userData: Omit<User, 'id' | 'created_at'>): Promise<User> {
    const id = uuidv4();
    const { name, email, phone, role, address, password_hash } = userData;

    const query = `
      INSERT INTO users (id, name, email, phone, address, role, password_hash)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const { rows } = await this.pool.query(query, [
      id, name, email, phone, address || '', role, password_hash
    ]);

    return rows[0];
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const { rows } = await this.pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return rows[0] || null;
  }

  // ---------------- REPORTS ----------------

  async createReport(reportData: Omit<Report, 'id' | 'created_at'>): Promise<Report> {
    const id = uuidv4();
    const {
      citizen_id, title, description, category, severity,
      latitude, longitude, address, landmark, status
    } = reportData;

    const query = `
      INSERT INTO reports
      (id, citizen_id, title, description, category, severity, latitude, longitude, address, landmark, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *
    `;

    const { rows } = await this.pool.query(query, [
      id, citizen_id, title, description, category, severity,
      latitude, longitude, address || '', landmark || '', status || 'PENDING'
    ]);

    return rows[0];
  }

  async getReport(id: string): Promise<Report | null> {
    const { rows } = await this.pool.query(
      'SELECT * FROM reports WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  }

  async getAllReports(): Promise<Report[]> {
    const { rows } = await this.pool.query(
      'SELECT * FROM reports ORDER BY created_at DESC'
    );
    return rows;
  }

  async getReportsByCitizen(citizenId: string): Promise<Report[]> {
    const { rows } = await this.pool.query(
      'SELECT * FROM reports WHERE citizen_id = $1 ORDER BY created_at DESC',
      [citizenId]
    );
    return rows;
  }

  async getReportsByStatus(status: string): Promise<Report[]> {
    const { rows } = await this.pool.query(
      'SELECT * FROM reports WHERE status = $1 ORDER BY created_at DESC',
      [status]
    );
    return rows;
  }

  async updateReport(id: string, updates: Partial<Report>): Promise<Report | null> {
    const keys = Object.keys(updates);
    if (!keys.length) return this.getReport(id);

    const setClause = keys.map((k, i) => `${k}=$${i + 2}`).join(', ');
    const query = `UPDATE reports SET ${setClause} WHERE id=$1 RETURNING *`;

    const { rows } = await this.pool.query(query, [id, ...Object.values(updates)]);
    return rows[0] || null;
  }

  async deleteReport(id: string): Promise<void> {
    await this.pool.query('DELETE FROM reports WHERE id=$1', [id]);
  }

  // ---------------- INCIDENTS ----------------

  async createIncident(data: Omit<Incident, 'id' | 'created_at'>): Promise<Incident> {
    const id = uuidv4();
    const { report_id, status, priority, assigned_responder_id } = data;

    const { rows } = await this.pool.query(
      `
      INSERT INTO incidents (id, report_id, status, priority, assigned_responder_id)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING *
      `,
      [id, report_id, status, priority, assigned_responder_id]
    );

    return rows[0];
  }

  async getIncident(id: string): Promise<Incident | null> {
    const { rows } = await this.pool.query(
      'SELECT * FROM incidents WHERE id=$1',
      [id]
    );
    return rows[0] || null;
  }

  async getAllIncidents(): Promise<Incident[]> {
    const { rows } = await this.pool.query(
      'SELECT * FROM incidents ORDER BY created_at DESC'
    );
    return rows;
  }

  async getIncidentsByStatus(status: string): Promise<Incident[]> {
    const { rows } = await this.pool.query(
      'SELECT * FROM incidents WHERE status=$1 ORDER BY created_at DESC',
      [status]
    );
    return rows;
  }

  async updateIncident(id: string, updates: Partial<Incident>): Promise<Incident | null> {
    const keys = Object.keys(updates);
    if (!keys.length) return this.getIncident(id);

    const setClause = keys.map((k, i) => `${k}=$${i + 2}`).join(', ');
    const query = `UPDATE incidents SET ${setClause} WHERE id=$1 RETURNING *`;

    const { rows } = await this.pool.query(query, [id, ...Object.values(updates)]);
    return rows[0] || null;
  }

  async deleteIncident(id: string): Promise<void> {
    await this.pool.query('DELETE FROM incidents WHERE id=$1', [id]);
  }

  // ---------------- DASHBOARD ----------------

  async getDashboardMetrics() {
    const [reports, active, resolved] = await Promise.all([
      this.pool.query('SELECT COUNT(*) FROM reports'),
      this.pool.query(`SELECT COUNT(*) FROM incidents WHERE status!='RESOLVED'`),
      this.pool.query(`SELECT COUNT(*) FROM incidents WHERE status='RESOLVED'`)
    ]);

    return {
      totalReports: Number(reports.rows[0].count),
      activeIncidents: Number(active.rows[0].count),
      resolvedIncidents: Number(resolved.rows[0].count)
    };
  }
}
