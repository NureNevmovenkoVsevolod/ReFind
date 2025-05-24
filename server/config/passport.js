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
    console.error("Deserialize user error:", error);
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({
          where: { email: profile.emails[0].value },
        });

        if (user) {
          console.log("Existing user found, updating...");
          await user.update({
            auth_provider: "google",
            provider_id: profile.id,
            user_pfp: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
          });

          await user.reload();
        } else {
          console.log("Creating new user...");
          user = await User.create({
            email: profile.emails[0].value,
            first_name: profile.name.givenName || "",
            last_name: profile.name.familyName || "",
            auth_provider: "google",
            provider_id: profile.id,
            user_pfp: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
          });
        }
        return done(null, user);
      } catch (error) {
        console.error("Google auth error:", error);
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
      callbackURL: "http://localhost:5000/auth/facebook/callback",
      profileFields: ["id", "emails", "name", "picture"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Facebook Profile:", profile);
        
        let user = await User.findOne({
          where: {
            provider_id: profile.id,
            auth_provider: "facebook",
          },
        });

        if (!user) {
          user = await User.create({
            email: profile.emails && profile.emails[0] ? profile.emails[0].value : "",
            first_name: profile.name.givenName || "",
            last_name: profile.name.familyName || "",
            auth_provider: "facebook",
            provider_id: profile.id,
            user_pfp: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
          });
        }

        return done(null, user);
      } catch (error) {
        console.error("Facebook auth error:", error);
        return done(error, null);
      }
    }
  )
);

export default passport;