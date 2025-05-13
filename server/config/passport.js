import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import dotenv from "dotenv";
import User from "../models/user.model.js";

dotenv.config();

passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback", // Повний URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google profile:", profile); // Для дебагу
        let user = await User.findOne({
          where: {
            provider_id: profile.id,
            auth_provider: "google",
          },
        });

        if (!user) {
          user = await User.create({
            email: profile.emails[0].value,
            first_name: profile.name.givenName,
            last_name: profile.name.familyName,
            auth_provider: "google",
            provider_id: profile.id,
            user_pfp: profile.photos[0].value,
            is_verified: true,
          });
        }

        return done(null, user);
      } catch (error) {
        console.error("Google auth error:", error); // Для дебагу
        return done(error, null);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "/auth/facebook/callback",
      profileFields: ["id", "emails", "name", "picture"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({
          where: {
            provider_id: profile.id,
            auth_provider: "facebook",
          },
        });

        if (!user) {
          user = await User.create({
            email: profile.emails[0].value,
            first_name: profile.name.givenName,
            last_name: profile.name.familyName,
            auth_provider: "facebook",
            provider_id: profile.id,
            user_pfp: profile.photos[0].value,
            is_verified: true,
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;
