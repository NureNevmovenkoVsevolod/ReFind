import express from "express";
import passport from "passport";
import { generateToken } from "../../controllers/auth.controller.js";

const router = express.Router();

// Початок авторизації Google
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
    failureRedirect: "http://localhost:3000/login?error=google_auth_failed",
    session: false, 
  }),
  (req, res) => {
    try {

      if (!req.user) {
        return res.redirect("http://localhost:3000/login?error=no_user_data");
      }

      const token = generateToken(req.user);
      console.log("Token generated:", !!token);

      const userData = {
        id: req.user.user_id,
        email: req.user.email,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        role: 'user',
        auth_provider: req.user.auth_provider,
        user_pfp: req.user.user_pfp
      };
      
      const authData = {
        token,
        user: userData
      };

      const encodedData = encodeURIComponent(JSON.stringify(authData));

      const redirectUrl = `http://localhost:3000/auth/success?data=${encodedData}`;
      
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("Google auth callback error:", error);
      console.error("Error stack:", error.stack);
      res.redirect("http://localhost:3000/login?error=token_generation_failed");
    }
  }
);

export default router;