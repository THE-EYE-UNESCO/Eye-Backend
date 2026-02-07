"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const pg_1 = require("pg");
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const types_1 = require("../types");
class DatabaseService {
    constructor() {
        if (!process.env.DATABASE_URL)
            throw new Error('DATABASE_URL is not defined');
        this.pool = new pg_1.Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });
        this.pool.on('error', (err) => {
            console.error('Unexpected PostgreSQL error', err);
            process.exit(1);
        });
    }
    static getInstance() {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }
    /** -------------------- INITIALIZE -------------------- */
    async initialize() {
        try {
            await this.pool.query('SELECT 1');
            console.log('✅ Connected to PostgreSQL');
            const schemaPath = path_1.default.join(process.cwd(), 'schema.sql');
            if (fs_1.default.existsSync(schemaPath)) {
                const schema = fs_1.default.readFileSync(schemaPath, 'utf8');
                await this.pool.query(schema);
                console.log('✅ Database schema initialized');
            }
            else {
                console.warn('⚠️ schema.sql not found, skipping initialization');
            }
        }
        catch (err) {
            console.error('❌ Failed to initialize database', err);
            throw err;
        }
    }
    /** -------------------- USERS -------------------- */
    async createUser(userData) {
        const id = (0, uuid_1.v4)();
        const { name, email, phone, role, address, password_hash } = userData;
        const query = `
      INSERT INTO users (id, name, email, phone, address, role, password_hash)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
    `;
        const { rows } = await this.pool.query(query, [
            id, name, email, phone, address || '', role, password_hash
        ]);
        return rows[0];
    }
    async getUserByEmail(email) {
        const { rows } = await this.pool.query('SELECT * FROM users WHERE email=$1', [email]);
        return rows[0] || null;
    }
    /** -------------------- REPORTS -------------------- */
    async createReport(reportData) {
        const id = (0, uuid_1.v4)();
        const { citizen_id, title, description, category, severity, latitude, longitude, address, landmark, status } = reportData;
        const query = `
      INSERT INTO reports
      (id, citizen_id, title, description, category, severity, latitude, longitude, address, landmark, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *
    `;
        const { rows } = await this.pool.query(query, [
            id, citizen_id, title, description, category, severity,
            latitude, longitude, address || '', landmark || '', status || types_1.ReportStatus.PENDING
        ]);
        return rows[0];
    }
    async getReport(id) {
        const { rows } = await this.pool.query('SELECT * FROM reports WHERE id=$1', [id]);
        return rows[0] || null;
    }
    async getAllReports() {
        const { rows } = await this.pool.query('SELECT * FROM reports ORDER BY created_at DESC');
        return rows;
    }
    async getReportsByStatus(status) {
        const { rows } = await this.pool.query('SELECT * FROM reports WHERE status=$1 ORDER BY created_at DESC', [status]);
        return rows;
    }
    async getReportsByCitizen(citizenId) {
        const { rows } = await this.pool.query('SELECT * FROM reports WHERE citizen_id=$1 ORDER BY created_at DESC', [citizenId]);
        return rows;
    }
    async updateReport(id, updates) {
        const keys = Object.keys(updates);
        if (!keys.length)
            return this.getReport(id);
        const setClause = keys.map((k, i) => `${k}=$${i + 2}`).join(', ');
        const { rows } = await this.pool.query(`UPDATE reports SET ${setClause} WHERE id=$1 RETURNING *`, [id, ...Object.values(updates)]);
        return rows[0] || null;
    }
    async deleteReport(id) {
        await this.pool.query('DELETE FROM reports WHERE id=$1', [id]);
    }
    /** -------------------- INCIDENTS -------------------- */
    async createIncident(data) {
        const id = (0, uuid_1.v4)();
        const { report_id, status, priority, assigned_responder_id } = data;
        const { rows } = await this.pool.query(`INSERT INTO incidents (id, report_id, status, priority, assigned_responder_id)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`, [id, report_id, status, priority, assigned_responder_id || null]);
        return rows[0];
    }
    async getIncident(id) {
        const { rows } = await this.pool.query('SELECT * FROM incidents WHERE id=$1', [id]);
        return rows[0] || null;
    }
    async getAllIncidents() {
        const { rows } = await this.pool.query('SELECT * FROM incidents ORDER BY created_at DESC');
        return rows;
    }
    async getIncidentsByStatus(status) {
        const { rows } = await this.pool.query('SELECT * FROM incidents WHERE status=$1 ORDER BY created_at DESC', [status]);
        return rows;
    }
    async getIncidentsByResponder(responderId) {
        const { rows } = await this.pool.query('SELECT * FROM incidents WHERE assigned_responder_id=$1 ORDER BY created_at DESC', [responderId]);
        return rows;
    }
    async updateIncident(id, updates) {
        const keys = Object.keys(updates);
        if (!keys.length)
            return this.getIncident(id);
        const setClause = keys.map((k, i) => `${k}=$${i + 2}`).join(', ');
        const { rows } = await this.pool.query(`UPDATE incidents SET ${setClause} WHERE id=$1 RETURNING *`, [id, ...Object.values(updates)]);
        return rows[0] || null;
    }
    async deleteIncident(id) {
        await this.pool.query('DELETE FROM incidents WHERE id=$1', [id]);
    }
    /** -------------------- RESPONDER STATUS -------------------- */
    async updateResponderStatus(responder_id, status) {
        const updated_at = new Date();
        const { rows } = await this.pool.query(`UPDATE responders SET availability=$1, updated_at=$2 WHERE id=$3 RETURNING *`, [status.availability, updated_at, responder_id]);
        return rows[0];
    }
    /** -------------------- ALERTS -------------------- */
    async createAlert(alert) {
        const id = (0, uuid_1.v4)();
        const created_at = new Date();
        const { incident_id, message, priority } = alert;
        const { rows } = await this.pool.query(`INSERT INTO alerts (id, incident_id, message, priority, created_at)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`, [id, incident_id, message, priority, created_at]);
        return rows[0];
    }
    /** -------------------- EVIDENCE -------------------- */
    async createEvidence(data) {
        const id = (0, uuid_1.v4)();
        const { incident_id, uploaded_by, file_url, note } = data;
        const { rows } = await this.pool.query(`INSERT INTO evidence (id, incident_id, uploaded_by, file_url, note)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`, [id, incident_id, uploaded_by, file_url, note]);
        return rows[0];
    }
    /** -------------------- STORIES -------------------- */
    async createStory(data) {
        const { id, citizen_id, title, body, image_url, tag } = data;
        const { rows } = await this.pool.query(`INSERT INTO stories (id, citizen_id, title, body, image_url, tag)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [id, citizen_id, title, body, image_url, tag]);
        return rows[0];
    }
    async getAllStories(userId) {
        const query = `
      SELECT 
        s.*,
        u.name as author_name,
        (SELECT COUNT(*) FROM story_likes WHERE story_id = s.id) as likes_count,
        (SELECT COUNT(*) FROM story_comments WHERE story_id = s.id) as comments_count
        ${userId ? `, EXISTS(SELECT 1 FROM story_likes WHERE story_id = s.id AND user_id = $1) as user_has_liked` : ''}
      FROM stories s
      JOIN users u ON s.citizen_id = u.id
      ORDER BY s.created_at DESC
    `;
        const { rows } = await this.pool.query(query, userId ? [userId] : []);
        return rows.map(r => ({
            ...r,
            likes_count: parseInt(r.likes_count),
            comments_count: parseInt(r.comments_count),
            user_has_liked: !!r.user_has_liked
        }));
    }
    async likeStory(id, story_id, user_id) {
        await this.pool.query('INSERT INTO story_likes (id, story_id, user_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [id, story_id, user_id]);
    }
    async unlikeStory(story_id, user_id) {
        await this.pool.query('DELETE FROM story_likes WHERE story_id = $1 AND user_id = $2', [story_id, user_id]);
    }
    async addComment(data) {
        const { id, story_id, user_id, body } = data;
        const { rows } = await this.pool.query(`INSERT INTO story_comments (id, story_id, user_id, body)
       VALUES ($1, $2, $3, $4) RETURNING *`, [id, story_id, user_id, body]);
        // Get author name
        const user = await this.pool.query('SELECT name FROM users WHERE id = $1', [user_id]);
        return {
            ...rows[0],
            author_name: user.rows[0]?.name
        };
    }
    async getCommentsByStory(storyId) {
        const query = `
      SELECT sc.*, u.name as author_name
      FROM story_comments sc
      JOIN users u ON sc.user_id = u.id
      WHERE sc.story_id = $1
      ORDER BY sc.created_at ASC
    `;
        const { rows } = await this.pool.query(query, [storyId]);
        return rows;
    }
    async updateStory(storyId, citizenId, updates) {
        const keys = Object.keys(updates).filter(k => ['title', 'body', 'image_url', 'tag'].includes(k));
        if (!keys.length)
            return null;
        const setClause = keys.map((k, i) => `${k}=$${i + 3}`).join(', ');
        const { rows } = await this.pool.query(`UPDATE stories SET ${setClause} WHERE id=$1 AND citizen_id=$2 RETURNING *`, [storyId, citizenId, ...keys.map(k => updates[k])]);
        return rows[0] || null;
    }
    async deleteStory(storyId, citizenId) {
        const { rowCount } = await this.pool.query('DELETE FROM stories WHERE id = $1 AND citizen_id = $2', [storyId, citizenId]);
        return (rowCount ?? 0) > 0;
    }
    async getCommunityStats() {
        const [members, stories, comments, likes] = await Promise.all([
            this.pool.query('SELECT COUNT(*) FROM users WHERE role = $1', ['CITIZEN']),
            this.pool.query('SELECT COUNT(*) FROM stories'),
            this.pool.query('SELECT COUNT(*) FROM story_comments'),
            this.pool.query('SELECT COUNT(*) FROM story_likes')
        ]);
        return {
            activeMembers: parseInt(members.rows[0].count),
            storiesShared: parseInt(stories.rows[0].count),
            comments: parseInt(comments.rows[0].count),
            shares: parseInt(likes.rows[0].count)
        };
    }
    /** -------------------- DASHBOARD -------------------- */
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
exports.DatabaseService = DatabaseService;
