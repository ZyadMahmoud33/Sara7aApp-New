import UserModel from "../../DB/models/user.model.js"; 
import { BadRequestException, ConflictException, NotFoundException } from "../../Utlis/response/error.response.js";
import { successResponse } from "../../Utlis/response/succes.response.js";
import { create, findOne, findById, updateOne } from "../../DB//models/database.repository.js";
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
import { generateOTP } from "../../Utlis/security/otp.security.js";
import { OAuth2Client } from "google-auth-library";
import { profile } from "node:console";
import joi from "joi";
import TokenModel from "../../DB/models/token.model.js";
import { set } from "../../DB/redis.service.js";
import { revokeTokenKey, ttl } from "../../DB/redis.service.js";


export const signup = async (req, res) => {

  const { firstName, lastName, email, password, phone } = req.body;

  if (await findOne({ model: UserModel, filter: { email } }))
    throw ConflictException({ message: "User already exists" });

  const hashedPassword = await generateHash({
    plaintext: password,
    algo: HashEnum.Argon,
  });

  const encryptedData = await encrypt(phone);

  const user = await create({
  model: UserModel,
  data: [
    {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone: encryptedData,
    },
  ],
});

  const otp = generateOTP();

  user.otpCode = otp;
  user.otpExpires = Date.now() + 5 * 60 * 1000;

  await user.save();

  console.log("OTP:", otp);

  return successResponse({
    res, 
    statusCode: 201, 
    message: "User created successfully", 
    data: { validationResults },
  });
};


export const login = async (req, res) => {

    const { email, password } = req.body;

    const user = await findOne({ model: UserModel, filter: { email } });

    if (!user)
        throw NotFoundException({ message: "User Not Found" });

    if (!user.isVerified) {
        throw BadRequestException({ message: "Verify your email first" });
    }

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

export const refreshToken = async (req, res, next) => {
  const {authorization} = req.headers;
  const decodedToken = verifyToken({
    token: authorization,
  });
  const user = await findById({
    model: UserModel,
    id: decodedToken.id,
  });
  if (!user) throw NotFoundException({message :  "User not found" });
  const accessToken = generateToken({
    payload: {
      id: user._id,
      email: user.email,
    },
    secret: process.env.ACCESS_TOKEN_SECRET,
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
  });
  

  console.log(decodedToken); 
}

export const verifyOTP = async (req, res, next) => {
    const { email, otp } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) throw NotFoundException({message :  "User not found" });

    if (user.isVerified) throw BadRequestException({message :  "Already verified" });

    if (user.otpCode !== otp) throw BadRequestException({message :  "Invalid OTP" });
    
    if (user.otpExpires < Date.now()) throw BadRequestException({message :  "OTP expired" });

    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpires = undefined;

    await user.save();

    return successResponse({
        res,
        statusCode: 200,
        message: "Verified successfully",
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



