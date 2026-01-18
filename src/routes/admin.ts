import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();
const adminController = new AdminController();

router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

router.get('/dashboard', adminController.getDashboard);
router.get('/reports', adminController.getPendingReports);
router.patch('/reports/:id/verify', adminController.verifyReport);
router.get('/incidents', adminController.getIncidents);
router.post('/incidents/:id/assign', adminController.assignResponder);

export { router as adminRoutes };
