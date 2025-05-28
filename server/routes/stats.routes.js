import express from 'express';
import verifyToken from '../middlewares/auth.middleware.js';
import statsController from '../controllers/stats.controller.js';

const router = express.Router();

router.use(verifyToken);

router.get('/users', statsController.getCountUsers);
router.get('/ads', statsController.getCountAllAds);
router.get('/ads/pending', statsController.getCountPendingAds);
router.get('/complaints/active', statsController.getCountActiveComplaints);
router.get('/ads/lost', statsController.getCountLostAds);
router.get('/ads/found', statsController.getCountFoundAds);
router.get('/ads/graph', statsController.getAdsGraphData);
router.get('/categories', statsController.getCategoriesStats);

export default router;