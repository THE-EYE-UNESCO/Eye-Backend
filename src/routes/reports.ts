import { Router } from 'express';
import { ReportController } from '../controllers/reportController';
import { authenticate } from '../middleware/auth';

const router = Router();
const reportController = new ReportController();

router.post('/', authenticate, (req, res) => reportController.createReport(req, res));
router.get('/:id', authenticate, (req, res) => reportController.getReport(req, res));
router.get('/:id/status', authenticate, (req, res) => reportController.getReportStatus(req, res));

export { router as reportRoutes };
