// backend/src/Modules/Auth/auth.service.js
import UserModel from "../../DB/models/user.model.js"; 
import { BadRequestException, ConflictException, NotFoundException } from "../../Utlis/response/error.response.js";
import { successResponse } from "../../Utlis/response/succes.response.js";
import { create, findOne, findById, updateOne, findOneAndUpdate } from "../../DB//models/database.repository.js";
import { generateHash, compareHash } from "../../Utlis/security/hash.security.js";
import { HashEnum } from "../../Utlis/enumes/security.enum.js";
import { encrypt } from "../../Utlis/security/encryption.security.js";
import {generateToken} from "../../Utlis/token/token.js";
import {  REFRESH_EXPIRES, CLIENT_ID  } from "../../../config/config.service.js";
import { verifyToken  } from "../../Utlis/token/token.js";
import { getNewLoginCredentials } from "../../Utlis/token/token.js";
import { getSignature, generateToken as generateToken2 } from "../../Utlis/token/token.js";
import { SignatureEnum, TokenTypeEnum, RoleEnum, ProviderEnum, LogoutTypeEnum } from "../../Utlis/enumes/user.enumes.js";
import { ACCESS_EXPIRES } from "../../../config/config.service.js";
import { OAuth2Client } from "google-auth-library";
import { set } from "../../DB/redis.service.js";
import { revokeTokenKey, ttl } from "../../DB/redis.service.js";
import { generateOTP } from "../../Utlis/generateOtp.js";
import { emailEventy } from "../../Utlis/events/email.events.js";
import jwt from "jsonwebtoken";
import { createPrivateKey } from "crypto";
import axios from "axios";

export const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, age, confirmPassword } = req.body;
    
    // تأكد إن الباسووردات متطابقة
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    
    if (await findOne({ model: UserModel, filter: { email } }))
      return res.status(409).json({ message: "User already exists" });
      
    const hashedPassword = await generateHash({
      plaintext: password,
      algo: HashEnum.Argon,
    });
    
    const encryptedData = await encrypt(phone);
    const otp = generateOTP();
    const hashedOtp = await generateHash({
      plaintext: JSON.stringify(otp),
      algo: HashEnum.Argon,
    });
    
    const user = await create({
      model: UserModel,
      data: [{
        firstName,
        lastName,
        email,
        age,
        password: hashedPassword,
        confirmPassword: hashedPassword,
        phone: encryptedData,
        confirmEmailOtp: hashedOtp,
      }],
    });
    
    emailEventy.emit("confirmEmail", {
      to: email,
      otp,
      firstName,
    });
    
    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: { user },
    });
    
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const confirmEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        console.log("📥 Confirm Email - Email:", email);
        console.log("🔢 OTP received:", otp);
        
        // ✅ تحقق من وجود البيانات
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required ❌"
            });
        }
        
        const user = await findOne({ 
            model: UserModel, 
            filter: { 
                email, 
                confirmEmail: { $exists: false }, 
                confirmEmailOtp: { $exists: true } ,
            } 
        });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found or already confirmed ❌"
            });
        }
        
        console.log("✅ User found:", user._id);
        
        // ✅ تأكد من وجود confirmEmailOtp
        if (!user.confirmEmailOtp) {
            return res.status(400).json({
                success: false,
                message: "No OTP found. Please request a new one 📧"
            });
        }
        
        const isOtpValid = await compareHash({
            plaintext: otp,
            ciphertext: user.confirmEmailOtp,
            algo: HashEnum.Argon,
        });
        
        console.log("🔍 OTP valid?", isOtpValid);
        
        if (!isOtpValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP ❌"
            });
        }
        
        await updateOne({ 
            model: UserModel, 
            filter: { email }, 
            update: { 
                confirmEmail: Date.now(),
                $unset: { confirmEmailOtp: true } 
            },
        });
        
        console.log("✅ Email confirmed successfully!");
        return res.status(200).json({
            success: true,
            message: "Email confirmed successfully! ✅"
        });
    } catch (error) {
        console.error("❌ Confirm email error:", error);
        console.error("Error stack:", error.stack);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error ❌",
        });
    }
};

export const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required 📧"
            });
        }
        
        console.log("📥 Resend OTP for:", email);
        
        const user = await findOne({
            model: UserModel,
            filter: {
                email: email.toLowerCase(),
                confirmEmail: { $exists: false },
            },
        });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User Not Found or already confirmed ❌"
            });
        }
        
        // generate OTP
        const otp = generateOTP();
        console.log("🔢 New OTP generated:", otp);
        
        const hashedOtp = await generateHash({
            plaintext: otp.toString(),
            algo: HashEnum.Argon,
        });
        
        await updateOne({
            model: UserModel,
            filter: { email: email.toLowerCase() },
            update: {
                confirmEmailOtp: hashedOtp,
            },
        });
        
        // send email
        emailEventy.emit("resendOtp", {
            to: user.email,
            otp,
            firstName: user.firstName,
        });
        
        console.log("✅ OTP resent successfully to:", email);
        
        return successResponse({
            res,
            message: "OTP resent successfully! 📧",
        });
        
    } catch (error) {
        console.error("❌ Resend OTP error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await findOne({ 
      model: UserModel, 
      filter: { 
        email, 
        confirmEmail: { $exists: true },
        freezedAt: { $exists: false }
       },
    });
    if (!user)
        throw NotFoundException({ message: "User Not Found" });
    
    const isPasswordValid = await compareHash({
        plaintext: password,
        ciphertext: user.password,
        algo: HashEnum.Argon,
    });
    if (!isPasswordValid)
        throw BadRequestException({ message: "Invalid email or password" });
    const credentials = await getNewLoginCredentials(user);
    return successResponse({
        res,
        statusCode: 200,
        message: "User logged in successfully",
        data: { ...credentials },
    });
};

export const refreshToken = async (req, res) => {

  const user = await findById({
    model: UserModel,
    id: req.user.id, // 🔥 جاي من middleware
  });

  if (!user) {
    throw new Error("User not found");
  }

  const signature = getSignature({
    getSignatureLevel:
      user.role !== RoleEnum.Admin
        ? SignatureEnum.User
        : SignatureEnum.Admin,
  });

  const accessToken = generateToken({
    payload: {
      id: user._id,
      role: user.role, // 🔥 مهم جدًا
    },
    secretKey: signature.accesssignature,
    options: { expiresIn: ACCESS_EXPIRES },
  });

  return res.json({
    message: "Token refreshed successfully",
    accessToken,
  });
};

// ================================
// 🔐 GOOGLE LOGIN
// ================================



export const loginWithGoogle = async (req, res) => {
  try {
    const { idToken } = req.body; // الـ idToken هنا هو access_token فعلاً
    
    // ✅ استخدم access_token مباشرة مع Google API
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${idToken}`
    );
    
    const { email, name, picture, email_verified, given_name, family_name } = response.data;
    
    if (!email_verified) {
      throw BadRequestException({ message: "Email not verified with Google" });
    }
    
    let user = await findOne({ 
      model: UserModel, 
      filter: { email },
    });
    
    if (user) {
      if (user.provider !== ProviderEnum.Google) {
        throw BadRequestException({ 
          message: "Email already registered with another provider. Please login with your password." 
        });
      }
      
      const credentials = await getNewLoginCredentials(user);
      return successResponse({
        res,
        message: "Logged in successfully with Google",
        data: credentials,
      });
    }
    
    const firstName = given_name || name?.split(" ")[0] || "Google";
    const lastName = family_name || name?.split(" ")[1] || "User";
    
    const newUser = await create({
      model: UserModel,
      data: [{
        firstName,
        lastName,
        email,
        profilePic: picture,
        provider: ProviderEnum.Google,
        isVerified: true,
        plan: "free",
        coins: 0,
      }],
    });
    
    const credentials = await getNewLoginCredentials(newUser);
    
    return successResponse({
      res,
      statusCode: 201,
      message: "Account created and logged in successfully with Google",
      data: credentials,
    });
    
  } catch (error) {
    console.error("❌ Google login error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Google login failed",
    });
  }
};

// ================================
// 🔐 FACEBOOK LOGIN
// ================================

async function verifyFacebookAccount({ accessToken }) {
  const response = await axios.get(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`);
  return response.data;
}

export const loginWithFacebook = async (req, res) => {
  try {
    const { accessToken } = req.body;
    
    if (!accessToken) {
      throw BadRequestException({ message: "Access token is required" });
    }
    
    const { email, name, picture } = await verifyFacebookAccount({ accessToken });
    
    if (!email) {
      throw BadRequestException({ message: "Email not provided by Facebook" });
    }
    
    const firstName = name?.split(" ")[0] || "Facebook";
    const lastName = name?.split(" ")[1] || "User";
    const profilePic = picture?.data?.url || null;
    
    let user = await findOne({ 
      model: UserModel, 
      filter: { email },
    });
    
    if (user) {
      if (user.provider !== ProviderEnum.Facebook) {
        throw BadRequestException({ 
          message: "Email already registered with another provider. Please login with your password." 
        });
      }
      
      const credentials = await getNewLoginCredentials(user);
      return successResponse({
        res,
        message: "Logged in successfully with Facebook",
        data: credentials,
      });
    }
    
    const newUser = await create({
      model: UserModel,
      data: [{
        firstName,
        lastName,
        email,
        profilePic,
        provider: ProviderEnum.Facebook,
        isVerified: true,
        plan: "free",
        coins: 0,
      }],
    });
    
    const credentials = await getNewLoginCredentials(newUser);
    
    return successResponse({
      res,
      statusCode: 201,
      message: "Account created and logged in successfully with Facebook",
      data: credentials,
    });
    
  } catch (error) {
    console.error("❌ Facebook login error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Facebook login failed",
    });
  }
};

// ================================
// 🔐 GITHUB LOGIN
// ================================
async function getGitHubUser({ code }) {
  // Exchange code for access token
  const tokenResponse = await axios.post(
    "https://github.com/login/oauth/access_token",
    {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    },
    { headers: { Accept: "application/json" } }
  );
  
  const accessToken = tokenResponse.data.access_token;
  
  // Get user data
  const userResponse = await axios.get("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  
  // Get user email (primary email)
  const emailResponse = await axios.get("https://api.github.com/user/emails", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  
  const primaryEmail = emailResponse.data.find(email => email.primary)?.email;
  
  return {
    ...userResponse.data,
    email: primaryEmail,
  };
}

export const loginWithGitHub = async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      throw BadRequestException({ message: "Authorization code is required" });
    }
    
    const { login, name, email, avatar_url } = await getGitHubUser({ code });
    
    if (!email) {
      throw BadRequestException({ message: "Email not provided by GitHub" });
    }
    
    const firstName = name?.split(" ")[0] || login || "GitHub";
    const lastName = name?.split(" ")[1] || "User";
    
    let user = await findOne({ 
      model: UserModel, 
      filter: { email },
    });
    
    if (user) {
      if (user.provider !== ProviderEnum.GitHub) {
        throw BadRequestException({ 
          message: "Email already registered with another provider. Please login with your password." 
        });
      }
      
      const credentials = await getNewLoginCredentials(user);
      return successResponse({
        res,
        message: "Logged in successfully with GitHub",
        data: credentials,
      });
    }
    
    const newUser = await create({
      model: UserModel,
      data: [{
        firstName,
        lastName,
        email,
        profilePic: avatar_url,
        provider: ProviderEnum.GitHub,
        isVerified: true,
        plan: "free",
        coins: 0,
      }],
    });
    
    const credentials = await getNewLoginCredentials(newUser);
    
    return successResponse({
      res,
      statusCode: 201,
      message: "Account created and logged in successfully with GitHub",
      data: credentials,
    });
    
  } catch (error) {
    console.error("❌ GitHub login error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "GitHub login failed",
    });
  }
};

// ================================
// 🔐 APPLE LOGIN
// ================================

async function verifyAppleAccount({ authorizationCode }) {
  const clientSecret = jwt.sign(
    {},
    createPrivateKey(process.env.APPLE_PRIVATE_KEY),
    {
      algorithm: "ES256",
      keyid: process.env.APPLE_KEY_ID,
      issuer: process.env.APPLE_TEAM_ID,
      audience: "https://appleid.apple.com",
      subject: process.env.APPLE_CLIENT_ID,
      expiresIn: "5m",
    }
  );
  
  const response = await axios.post("https://appleid.apple.com/auth/token", {
    client_id: process.env.APPLE_CLIENT_ID,
    client_secret: clientSecret,
    code: authorizationCode,
    grant_type: "authorization_code",
  });
  
  const { id_token } = response.data;
  const decoded = jwt.decode(id_token);
  
  return {
    email: decoded.email,
    email_verified: decoded.email_verified,
    sub: decoded.sub,
  };
}

export const loginWithApple = async (req, res) => {
  try {
    const { authorizationCode } = req.body;
    
    if (!authorizationCode) {
      throw BadRequestException({ message: "Authorization code is required" });
    }
    
    const { email, email_verified } = await verifyAppleAccount({ authorizationCode });
    
    if (!email_verified || !email) {
      throw BadRequestException({ message: "Email not verified by Apple" });
    }
    
    let user = await findOne({ 
      model: UserModel, 
      filter: { email },
    });
    
    if (user) {
      if (user.provider !== ProviderEnum.Apple) {
        throw BadRequestException({ 
          message: "Email already registered with another provider. Please login with your password." 
        });
      }
      
      const credentials = await getNewLoginCredentials(user);
      return successResponse({
        res,
        message: "Logged in successfully with Apple",
        data: credentials,
      });
    }
    
    const newUser = await create({
      model: UserModel,
      data: [{
        firstName: "Apple",
        lastName: "User",
        email,
        provider: ProviderEnum.Apple,
        isVerified: true,
        plan: "free",
        coins: 0,
      }],
    });
    
    const credentials = await getNewLoginCredentials(newUser);
    
    return successResponse({
      res,
      statusCode: 201,
      message: "Account created and logged in successfully with Apple",
      data: credentials,
    });
    
  } catch (error) {
    console.error("❌ Apple login error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Apple login failed",
    });
  }
};

// ================================
// 🔐 X (TWITTER) LOGIN
// ================================
async function getTwitterUser({ oauthToken, oauthVerifier }) {
  // Exchange request token for access token
  const tokenResponse = await axios.post(
    "https://api.twitter.com/oauth/access_token",
    null,
    {
      params: {
        oauth_token: oauthToken,
        oauth_verifier: oauthVerifier,
      },
    }
  );
  
  const params = new URLSearchParams(tokenResponse.data);
  const accessToken = params.get("oauth_token");
  const accessSecret = params.get("oauth_token_secret");
  const userId = params.get("user_id");
  const screenName = params.get("screen_name");
  
  // Get user data
  const userResponse = await axios.get(
    `https://api.twitter.com/1.1/users/show.json?user_id=${userId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
      },
    }
  );
  
  return {
    id: userId,
    username: screenName,
    name: userResponse.data.name,
    email: `${screenName}@twitter.com`,
    profilePic: userResponse.data.profile_image_url_https,
  };
}

export const loginWithTwitter = async (req, res) => {
  try {
    const { oauthToken, oauthVerifier } = req.body;
    
    if (!oauthToken || !oauthVerifier) {
      throw BadRequestException({ message: "OAuth token and verifier are required" });
    }
    
    const { username, name, email, profilePic } = await getTwitterUser({ oauthToken, oauthVerifier });
    
    let user = await findOne({ 
      model: UserModel, 
      filter: { email },
    });
    
    if (user) {
      if (user.provider !== ProviderEnum.Twitter) {
        throw BadRequestException({ 
          message: "Email already registered with another provider. Please login with your password." 
        });
      }
      
      const credentials = await getNewLoginCredentials(user);
      return successResponse({
        res,
        message: "Logged in successfully with X (Twitter)",
        data: credentials,
      });
    }
    
    const newUser = await create({
      model: UserModel,
      data: [{
        firstName: name?.split(" ")[0] || username || "Twitter",
        lastName: name?.split(" ")[1] || "User",
        email,
        profilePic,
        provider: ProviderEnum.Twitter,
        isVerified: true,
        plan: "free",
        coins: 0,
      }],
    });
    
    const credentials = await getNewLoginCredentials(newUser);
    
    return successResponse({
      res,
      statusCode: 201,
      message: "Account created and logged in successfully with X (Twitter)",
      data: credentials,
    });
    
  } catch (error) {
    console.error("❌ X (Twitter) login error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "X (Twitter) login failed",
    });
  }
};

export const socialLoginCallback = async (req, res) => {
  try {
    const user = req.user;
    const credentials = await getNewLoginCredentials(user);
    res.redirect(`${process.env.CLIENT_URL}/auth-success?accessToken=${credentials.accessToken}&refreshToken=${credentials.refreshToken}`);
  } catch (error) {
    res.redirect(`${process.env.CLIENT_URL}/login?error=Social login failed`);
  }
};

// logout with ttl of mongoodb
export const logout = async (req, res) => {
    const {flag} = req.body;

    let status = 200;
    switch (flag) {
      case LogoutTypeEnum.logout:
        await create ({
          model : TokenModel,
          data: [{
            jti: req.decoded.jti, 
            userId : req.user._id,
            expiresIn: Date.now() - req.decoded.exp,
          },
        ],
      });
      status = 201;  
       case LogoutTypeEnum.logoutFromAll:
        await updateOne ({
          model : UserModel,
          filter : { _id: req.user._id },
          update: { changeCredentialsTime : Date.now()

           },
        });
      status = 200;          
    }
    return successResponse({
      res,
      statusCode: status,
      message: "Logout successfully",
    });
  };

  export const logoutWithRedis = async (req, res) => {
    const {flag} = req.body;

    let status = 200;
    switch (flag) {
      case LogoutTypeEnum.logout:
       await set({
        key: revokeTokenKey({
          userId: req.user._id, 
          jti: req.decoded.jti
        }), 
        value: req.decoded.jti, 
        ttl: req.decoded.iat + ACCESS_EXPIRES,
      })
      status = 201;  
       case LogoutTypeEnum.logoutFromAll:
        await updateOne ({
          model : UserModel,
          filter : { _id: req.user._id },
          update: { changeCredentialsTime : Date.now()

           },
        });
      status = 200;          
    }
    return successResponse({
      res,
      statusCode: status,
      message: "Logout successfully",
    });
  };

export const forgetPassword = async (req, res) => {
  const { email } = req.body;
  
  // generate otp 
  const otp = generateOTP();
  const hashOtp = await generateHash({ 
    plaintext: JSON.stringify(otp), 
    algo: HashEnum.Argon, 
  });
  
  const user = await findOneAndUpdate({
    model: UserModel,
    filter: { 
      email, 
      provider: ProviderEnum.System,
      confirmEmail: { $exists: true },
    },
    update: {
      forgetPasswordOTP: hashOtp
    },
  });
  
  if (!user) throw NotFoundException({ message: "User not found" });
  
  emailEventy.emit("forgetPassword", {
    to: email,
    otp,
    firstName: user.firstName,
  });
  
  return successResponse({
    res,
    statusCode: 200,
    message: "Check Your Inbox",
  });
};

export const resetPassword = async (req, res) => {
 const { email, otp, newPassword } = req.body;
  const user = await findOne({
    model : UserModel,
    filter : { 
      email, 
      provider: ProviderEnum.System,
      confirmEmail: { $exists: true },
      forgetPasswordOTP: { $exists: true, $ne: null }
    },
  });
 if (!user) throw NotFoundException({message: "User not found"});
 const isOtpValid = await compareHash({
        plaintext: JSON.stringify(otp),
        ciphertext: user.forgetPasswordOTP,
        algo: HashEnum.Argon,
    });
    if (!isOtpValid) 
        throw BadRequestException({
            message: "Invalid OTP",
        });

     const hashedPassword = await generateHash({ 
        plaintext: newPassword, 
        algo: HashEnum.Argon, 
      });
      //update user password
      await updateOne({
        model : UserModel,
        filter : { email},
        update : { 
          password: hashedPassword ,
          $unset: { forgetPasswordOTP: true },
        },
      });
      return successResponse({
        res,
        statusCode: 200,
        message: "Password reset successfully",
      });
    
};