import express from "express";
import passport from "passport";
import AuthController from "../../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

export default router;
