import express from 'express';
import verifyToken from '../middlewares/auth.middleware.js';
import {getCategoriesStats, getAdsGraphData, getCountUsers, getCountAllAds, getCountPendingAds, getCountActiveComplaints, getCountLostAds, getCountFoundAds } from '../controllers/stats.controller.js';

const router = express.Router();

router.use(verifyToken);

router.get('/users', getCountUsers);
router.get('/ads', getCountAllAds);
router.get('/ads/pending', getCountPendingAds);
router.get('/complaints/active', getCountActiveComplaints);
router.get('/ads/lost', getCountLostAds);
router.get('/ads/found', getCountFoundAds);
router.get('/ads/graph', getAdsGraphData);
router.get('/categories', getCategoriesStats);

export default router;