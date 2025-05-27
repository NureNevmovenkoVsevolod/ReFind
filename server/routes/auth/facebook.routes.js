import express from "express";
import passport from "passport";
import { generateToken } from "../../controllers/auth.controller.js";

const router = express.Router();

router.get("/", passport.authenticate("facebook", { scope: ["email"] }));

router.get(
  "/callback",
  passport.authenticate("facebook", { failureRedirect: process.env.REACT_APP_CLIENT_URL+"server/login" }),
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
      console.error("Token generation error:", error);
      res.redirect(process.env.REACT_APP_CLIENT_URL+"/login?error=authentication_failed");
    }
  }
);

export default router;
