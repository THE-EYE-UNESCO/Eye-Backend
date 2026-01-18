import { Router } from 'express';
import { ReportController } from '../controllers/reportController';
import { authenticate } from '../middleware/auth';

const router = Router();
const reportController = new ReportController();

router.post('/', authenticate, reportController.createReport);
router.get('/:id', authenticate, reportController.getReport);
router.get('/:id/status', authenticate, reportController.getReportStatus);

export { router as reportRoutes };
