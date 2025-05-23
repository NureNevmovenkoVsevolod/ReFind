import express from "express";
import passport from "passport";
import { generateToken } from "../../controllers/auth.controller.js";

const router = express.Router();

router.get(
  "/",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

router.get(
  "/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5000/login?error=google_auth_failed",
    session: false,
  }),
  (req, res) => {
    try {
      const token = generateToken(req.user);
      res.redirect(`http://localhost:5000/auth/success?token=${token}`);
    } catch (error) {
      console.error("Token generation error:", error);
      res.redirect("http://localhost:5000/login?error=google_auth_failed");
    }
  }
);

export default router;
