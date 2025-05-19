import { Router } from "express";
import advertisementRouter from "../routes/advertisement.routes.js";
import * as categoriesController from "../controllers/categories.controller.js";
const router = Router();

router.use("/advertisement", advertisementRouter);
router.get("/categories", categoriesController.getAllCategories);

export default router;
