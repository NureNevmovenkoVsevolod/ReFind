import { Router } from 'express';
import complaintController from '../controllers/complaint.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';


const router = Router();

router.post('/', authMiddleware, complaintController.create);

router.get('/', authMiddleware,  complaintController.getAll);

router.get('/:id', authMiddleware,complaintController.getById);

router.put('/:id/reject', authMiddleware,  complaintController.rejectComplaint);

router.delete('/:id/advertisement', authMiddleware,  complaintController.deleteAdvertisement);

export default router; 