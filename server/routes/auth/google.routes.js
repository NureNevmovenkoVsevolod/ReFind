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
    failureRedirect:
      process.env.REACT_APP_CLIENT_URL + "/login?error=google_auth_failed",
    session: false,
  }),
  (req, res) => {
    try {
      if (!req.user) {
        return res.redirect(
          process.env.REACT_APP_CLIENT_URL + "/login?error=no_user_data"
        );
      }

      const token = generateToken(req.user);

      const userData = {
        id: req.user.user_id,
        email: req.user.email,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        role: "user",
        auth_provider: req.user.auth_provider,
        user_pfp: req.user.user_pfp,
      };

      const authData = {
        token,
        user: userData,
      };

      const encodedData = encodeURIComponent(JSON.stringify(authData));

      // Перевіряємо, чи це мобільний додаток
      const platform = req.query.platform;
      const redirectUri = req.query.redirect_uri;

      if (platform === 'mobile' && redirectUri) {
        // Для мобільного додатку використовуємо redirectUri
        res.redirect(`${redirectUri}?data=${encodedData}`);
      } else {
        // Для веб-версії використовуємо стандартний URL
        res.redirect(
          process.env.REACT_APP_CLIENT_URL + `/auth/success?data=${encodedData}`
        );
      }
    } catch (error) {
      console.error("Google auth callback error:", error);
      console.error("Error stack:", error.stack);
      res.redirect(
        process.env.REACT_APP_CLIENT_URL +
          "/login?error=token_generation_failed"
      );
    }
  }
);

export default router;
