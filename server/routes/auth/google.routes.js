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
    failureRedirect: process.env.REACT_APP_SERVER_URL+"/login?error=google_auth_failed",
    session: false,
  }),
  (req, res) => {
    try {
      const token = generateToken(req.user);
      res.redirect(process.env.REACT_APP_SERVER_URL+`/auth/success?token=${token}`);
    } catch (error) {
      console.error("Token generation error:", error);
      res.redirect(process.env.REACT_APP_SERVER_URL+"/login?error=google_auth_failed");
    }
  }
);

export default router;
