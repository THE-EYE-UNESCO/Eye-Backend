import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();
const adminController = new AdminController();

router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

router.get('/dashboard', (req, res) => adminController.getDashboard(req, res));
router.get('/reports', (req, res) => adminController.getPendingReports(req, res));
router.patch('/reports/:id/verify', (req, res) => adminController.verifyReport(req, res));
router.get('/incidents', (req, res) => adminController.getIncidents(req, res));
router.post('/incidents/:id/assign', (req, res) => adminController.assignResponder(req, res));

export { router as adminRoutes };
