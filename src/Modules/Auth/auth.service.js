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
import { log, profile } from "node:console";
import joi from "joi";
import TokenModel from "../../DB/models/token.model.js";
import { set } from "../../DB/redis.service.js";
import { revokeTokenKey, ttl } from "../../DB/redis.service.js";
import { sendEmail } from "../../Utlis/email/email.utils.js";
import { emailSubject } from "../../Utlis/email/email.utils.js";
import {customAlphabet} from "nanoid"
import { generateOTP } from "../../Utlis/generateOtp.js";
import { emailEvent, emailEventy } from "../../Utlis/events/email.events.js";



export const signup = async (req, res) => {
  const { firstName, lastName, email, password, phone, age, confirmPassword  } = req.body;
  if (await findOne({ model: UserModel, filter: { email } }))
    throw ConflictException({ message: "User already exists" });
  const hashedPassword = await generateHash({
    plaintext: password,
    algo: HashEnum.Argon,
  });
  const encryptedData = await encrypt(phone);
  const otp = generateOTP(); // otp math
  // const otp = customAlphabet('abcdefghjklmn1234567890', 6)();
   const hashedOtp = await generateHash({
    plaintext: JSON.stringify(otp),
    algo: HashEnum.Argon,
  });
  const user = await create({
  model: UserModel,
  data: [
    {
      firstName,
      lastName,
      email,
      age,
      password: hashedPassword,
      confirmPassword: hashedPassword,
      phone: encryptedData,
      confirmEmailOtp: hashedOtp,
    },
  ],
});
const emailData = {
  to: user.email,
  otp: otp,
  firstName: user.firstName,
};
emailEvent.emit("confirmEmail", {to:email,  otp, firstName});
  return successResponse({
    res, 
    statusCode: 201, 
    message: "User created successfully", 
    data: { user },
  });
};

export const confirmEmail = async (req, res) => {
    const { email, otp } = req.body;
    const user = await findOne({ 
      model: UserModel, 
      filter: { 
        email, 
        confirmEmail: { $exists: false }, 
        confirmEmailOtp: { $exists: true } ,
      } 
    });
    if (!user)
        throw NotFoundException({ message: "User Not Found" });
    const isOtpValid = await compareHash({
        plaintext: otp,
        ciphertext: user.confirmEmailOtp,
        algo: HashEnum.Argon,
    });
    if (!isOtpValid)
        throw BadRequestException({ message: "Invalid otp" });
      //update
    await updateOne({ 
      model: UserModel, 
      filter: { email}, 
      update: { confirmEmail: Date.now() , $unset: { confirmEmailOtp: true } },
    });
    return successResponse({
        res, 
        statusCode: 200, 
        message: "Email confirmed successfully", 
    });
};

export const resendOtp = async (req, res) => {
  const { email } = req.body;

  const user = await findOne({
    model: UserModel,
    filter: {
      email,
      confirmEmail: { $exists: false },
    },
  });
  if (!user)
    throw NotFoundException({ message: "User Not Found" });
  // generate OTP
  const otp = generateOTP();

  const hashedOtp = await generateHash({
    plaintext: otp,
    algo: HashEnum.Argon,
  });
  await updateOne({
    model: UserModel,
    filter: { email },
    update: {
      confirmEmailOtp: hashedOtp,
    },
  });
  // send email (نفس confirm بالظبط)
  emailEventy.emit("resendOtp", {
    to: user.email,
    otp,
    firstName: user.firstName,
  });
  return successResponse({
    res,
    statusCode: 200,
    message: "OTP resent successfully",
  });
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

async function verifyGoogleAccount({idToken}) {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: CLIENT_ID,  
  });
  const payload = ticket.getPayload();
  return payload;
};

export const loginWithGoogle = async (req, res) => {
    const { idToken } = req.body;
    
   const { email, picture, given_name, family_name, email_verified } =
    await verifyGoogleAccount({ idToken });


  if (!email_verified) throw BadRequestException({message :  "Email not verified" });

  const user = await findOne({ model: UserModel, filter: { email },  });
  if (user) {
    //logic
  if (user.provider === ProviderEnum.Google) {
    const credentials = await getNewLoginCredentials({ user });
    return successResponse({
      res,
      statusCode: 200,
      message: "Logged in successfully",
      data: credentials,
    });
   }
  }
  const newUser = await create({ model : UserModel , 
    data :[
      {
    firstName : given_name,
    lastName : family_name,
    email,
    profilePic: picture,
    provider : ProviderEnum.Google,
    },
  ],
  });
  // create user
   const credentials = await getNewLoginCredentials({ newUser });
    return successResponse({
      res,
      statusCode: 201,
      message: "Logged in successfully",
      data:  { credentials },
    });
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
 //generate otp 
  const otp = generateOTP();
  const hashOtp = await generateHash({ 
    plaintext: JSON.stringify(otp), 
    algo: HashEnum.Argon, 
  });
  const user = await findOneAndUpdate({
    model : UserModel,
    filter : { 
      email, 
      provider: ProviderEnum.System,
      confirmEmail: { $exists: true },
    },
    update : {
       forgetPasswordOTP : hashOtp
    },
  });
  if(!user)throw NotFoundException({message: "User not found"});
  emailEvent.emit("forgetPassword", {
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


