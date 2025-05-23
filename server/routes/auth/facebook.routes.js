import express from "express";
import passport from "passport";
import { generateToken } from "../../controllers/auth.controller.js";

const router = express.Router();

router.get("/", passport.authenticate("facebook", { scope: ["email"] }));

router.get(
  "/callback",
  passport.authenticate("facebook", { failureRedirect: "http://localhost:5000/login" }),
  (req, res) => {
    try {
      const token = generateToken(req.user);
      res.redirect(`http://localhost:5000/auth/success?token=${token}`);
    } catch (error) {
      console.error("Token generation error:", error);
      res.redirect("http://localhost:5000/login?error=authentication_failed");
    }
  }
);

export default router;
