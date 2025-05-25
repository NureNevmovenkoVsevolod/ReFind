import express from 'express';
import { getAllMods, getModById, createMod, updateMod, deleteMod } from '../controllers/mod.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getAllMods);
router.get('/:id', getModById);
router.post('/', createMod);
router.put('/:id', updateMod);
router.delete('/:id', deleteMod);

export default router; 