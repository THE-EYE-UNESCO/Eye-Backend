import { Router } from 'express';
import { ResponderController } from '../controllers/responderController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();
const responderController = new ResponderController();

router.use(authenticate);
router.use(authorize(UserRole.RESPONDER));

router.get('/incidents', responderController.getAssignedIncidents);
router.get('/incidents/:id', responderController.getIncidentDetails);
router.patch('/incidents/:id/status', responderController.updateIncidentStatus);
router.post('/incidents/:id/evidence', responderController.uploadEvidence);

export { router as responderRoutes };
