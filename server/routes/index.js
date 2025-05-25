import { Router } from "express";
import advertisementRouter from "../routes/advertisement.routes.js";
import userRouter from "../routes/user.routes.js";
import * as categoriesController from "../controllers/categories.controller.js";
import moderRouter from "../routes/mod.routes.js"

const router = Router();

router.use("/advertisement", advertisementRouter);
router.get("/categories", categoriesController.getAllCategories);
router.use("/user", userRouter);
router.use("/moder", moderRouter);

export default router;
