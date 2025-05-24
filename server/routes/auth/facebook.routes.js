import express from "express";
import passport from "passport";
import { generateToken } from "../../controllers/auth.controller.js";

const router = express.Router();

router.get("/", passport.authenticate("facebook", { scope: ["email"] }));

router.get(
  "/callback",
  passport.authenticate("facebook", { failureRedirect: process.env.REACT_APP_SERVER_URL+"server/login" }),
  (req, res) => {
    try {
      const token = generateToken(req.user);
      res.redirect(`${process.env.REACT_APP_CLIENT_URL}/auth/success?token=${token}`);
    } catch (error) {
      console.error("Token generation error:", error);
      res.redirect(process.env.REACT_APP_CLIENT_URL+"/login?error=authentication_failed");
    }
  }
);

export default router;
