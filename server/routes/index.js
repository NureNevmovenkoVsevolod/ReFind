import { Router } from "express";
import advertisementRouter from "../routes/advertisement.routes.js";
import userRouter from "../routes/user.routes.js";
import statsRouter from "../routes/stats.routes.js";
import CategoriesController from "../controllers/categories.controller.js";
import moderRouter from "../routes/mod.routes.js"
import complaintsRouter from '../routes/complaints.routes.js';
import fcmRoutes from '../routes/fcm.routes.js';
import chatRouter from '../routes/chat.routes.js';
import reviewRouter from './review.routes.js';


const router = Router();

router.use("/advertisement", advertisementRouter);
router.get("/categories", CategoriesController.getAllCategories);
router.use("/user", userRouter);
router.use("/moder", moderRouter);
router.use("/stats", statsRouter);
router.use("/complaints", complaintsRouter);
router.use('/fcm', fcmRoutes);
router.use('/chat', chatRouter);
router.use('/review', reviewRouter);

export default router;
