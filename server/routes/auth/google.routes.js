import express from "express";
import passport from "passport";
import { generateToken } from "../../controllers/auth.controller.js";

const router = express.Router();

router.get("/",
  passport.authenticate("google", { 
    scope: ["profile", "email"],
    prompt: "select_account"
  })
);

router.get("/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    try {
      const token = generateToken(req.user);
      // Для розробки перенаправляємо на фронтенд
      res.redirect(`http://localhost:3000/auth/success?token=${token}`);
    } catch (error) {
      console.error("Token generation error:", error);
      res.redirect("/login?error=authentication_failed");
    }
  }
);

export default router;
