import jwt from "jsonwebtoken";
import { 
  REFRESH_ADMIN_SECRET_KEY,
  TOKEN_ADMIN_ACCESS_KEY,
  ACCESS_EXPIRES,
  TOKEN_USER_ACCESS_KEY,
  REFRESH_USER_SECRET_KEY,
  REFRESH_EXPIRES,
} from "../../../config/config.service.js";

import { RoleEnum, SignatureEnum } from "../enumes/user.enumes.js";
import { v4 as uuidv4 } from "uuid";


export const generateToken = ({
  payload,
  secretKey,
  options = { expiresIn: ACCESS_EXPIRES },
}) => {
  if (!payload || !secretKey) {
    throw new Error("Missing payload or secretKey");
  }

  return jwt.sign(payload, secretKey, options);
};

export const verifyToken = ({ token, secretKey }) => {
  if (!token || !secretKey) {
    throw new Error("Token or secretKey is missing");
  }

  try {
    return jwt.verify(token, secretKey);
  } catch (error) {
    return null; 
  }
};

export const getSignature = ({
  getSignatureLevel = SignatureEnum.User,
}) => {
  let signature = {
    accesssignature: undefined,
    refreshSignature: undefined,
  };

  switch (getSignatureLevel) {
    case SignatureEnum.Admin:
      signature.accesssignature = TOKEN_ADMIN_ACCESS_KEY;
      signature.refreshSignature = REFRESH_ADMIN_SECRET_KEY;
      break;

    case SignatureEnum.User:
      signature.accesssignature = TOKEN_USER_ACCESS_KEY;
      signature.refreshSignature = REFRESH_USER_SECRET_KEY;
      break;

    default:
      signature.accesssignature = TOKEN_USER_ACCESS_KEY;
      signature.refreshSignature = REFRESH_USER_SECRET_KEY;
  }

  if (!signature.accesssignature || !signature.refreshSignature) {
    throw new Error("Signature keys are missing");
  }

  return signature;
};

export const getNewLoginCredentials = async (user) => {
  if (!user || !user._id) {
    throw new Error("Invalid user data");
  }

  const signature = await getSignature({
    getSignatureLevel:
      user.role != RoleEnum.Admin
        ? SignatureEnum.User
        : SignatureEnum.Admin,
  });
  const jwtid = uuidv4();
  const accessToken = generateToken({
    payload: { id: user._id, role: user.role }, 
    secretKey: signature.accesssignature,
    options: { expiresIn: ACCESS_EXPIRES, jwtid},
  });

  const refreshToken = generateToken({
    payload: { id: user._id },
    secretKey: signature.refreshSignature,
    options: { expiresIn: REFRESH_EXPIRES, jwtid },
  });

  return { accessToken, refreshToken };
};

