// backend/src/config/passport.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as TwitterStrategy } from "passport-twitter";
import User from "../src/DB/models/user.model.js";
// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback",
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ email: profile.emails[0].value });
      if (!user) {
        user = await User.create({
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          email: profile.emails[0].value,
          profilePic: profile.photos[0]?.value,
          provider: "google",
          isVerified: true,
        });
      }
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

// Facebook Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "/api/auth/facebook/callback",
    profileFields: ["id", "emails", "name"],
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ email: profile.emails[0].value });
      if (!user) {
        user = await User.create({
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          email: profile.emails[0].value,
          provider: "facebook",
          isVerified: true,
        });
      }
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

// GitHub Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "/api/auth/github/callback",
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ email: profile.emails[0].value });
      if (!user) {
        user = await User.create({
          firstName: profile.displayName.split(" ")[0],
          lastName: profile.displayName.split(" ")[1] || "",
          email: profile.emails[0].value,
          profilePic: profile.photos[0]?.value,
          provider: "github",
          isVerified: true,
        });
      }
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

// // Apple Strategy
// passport.use(new AppleStrategy({
//     clientID: process.env.APPLE_CLIENT_ID,
//     teamID: process.env.APPLE_TEAM_ID,
//     keyID: process.env.APPLE_KEY_ID,
//     privateKeyString: process.env.APPLE_PRIVATE_KEY,
//     callbackURL: "/api/auth/apple/callback",
//   },
//   async (accessToken, refreshToken, profile, done) => {
//     try {
//       let user = await User.findOne({ email: profile.email });
//       if (!user) {
//         user = await User.create({
//           firstName: "Apple",
//           lastName: "User",
//           email: profile.email,
//           provider: "apple",
//           isVerified: true,
//         });
//       }
//       return done(null, user);
//     } catch (error) {
//       return done(error, null);
//     }
//   }
// ));

// Twitter (X) Strategy
// passport.use(new TwitterStrategy({
//     consumerKey: process.env.TWITTER_API_KEY,
//     consumerSecret: process.env.TWITTER_API_SECRET,
//     callbackURL: "/api/auth/twitter/callback",
//     includeEmail: true,
//   },
//   async (token, tokenSecret, profile, done) => {
//     try {
//       let user = await User.findOne({ email: profile.emails[0].value });
//       if (!user) {
//         user = await User.create({
//           firstName: profile.displayName.split(" ")[0],
//           lastName: profile.displayName.split(" ")[1] || "",
//           email: profile.emails[0].value,
//           profilePic: profile.photos[0]?.value,
//           provider: "twitter",
//           isVerified: true,
//         });
//       }
//       return done(null, user);
//     } catch (error) {
//       return done(error, null);
//     }
//   }
// ));

export default passport;