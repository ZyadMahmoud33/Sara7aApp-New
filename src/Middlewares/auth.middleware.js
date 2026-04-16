import { findById, findOne } from "../DB/models/database.repository.js";
import { TokenTypeEnum, SignatureEnum } from "../Utlis/enumes/user.enumes.js";
import {
   BadRequestException,
   NotFoundException, 
   UnauthorizedException
} from "../Utlis/response/error.response.js";
import { getSignature, verifyToken } from "../Utlis/token/token.js";
import UserModel from "../DB/models/user.model.js";
import TokenModel from "../DB/models/token.model.js";
import { revokeTokenKey, get } from "../DB/redis.service.js";

export const decodedToken = async ({ 
  authorization,
  tokenType = TokenTypeEnum.Access,
}) => {
    const [bearer, token] = authorization.split(" ") || [];

    if (!bearer || !token) 
      throw BadRequestException({ message: "Invalid token" });


    let signature = await getSignature ({ signatureLevel: SignatureEnum.User });

    const decoded = verifyToken({
      token,
      secretKey: 
      tokenType === TokenTypeEnum.Access 
      ? signature.accesssignature 
      : signature.refreshSignature,
    });

    // check if token is revoked ----> logout
    // if (await findOne({
    //   model: TokenModel,
    //   filter: { jti : decoded.jti}
    // }))
    //   throw UnauthorizedException({ message: "Token Is Revoked" });


      const isRevoked = await get({
      key: revokeTokenKey({ userId: decoded.id, jti: decoded.jti }),
    });
      if (isRevoked) throw UnauthorizedException({ message: "Token Is Revoked" });
    


    const user = await findById({
      model: UserModel,
      id: decoded.id,
    });
    if (!user) throw NotFoundException({ message: "Not Registered Account" });

    if (user.changeCredentialsTime?.getTime() > decoded.iat * 1000) 
      throw UnauthorizedException({ message: "Token expired" });
    
    
    return {user, decoded};  
};

export const authorization = ({ AccessRoles = [] }) => {
  return async (req, res, next) => {
    if (!req.user) {
      throw BadRequestException({ message: "User not authenticated" });
    }

    if (!AccessRoles.includes(req.user.role)) {
      throw BadRequestException({ message: "Unauthorized Access" });
    }

    return next();
  };
};


export const authentication = ({tokenType = TokenTypeEnum.Access}) => {
    return async (req, res, next) => {
        const {user, decoded} = (await decodedToken({
            authorization: req.headers.authorization,
            tokenType,
        })) || {};
        req.user = user;
        req.decoded = decoded;
        return next();
    };
};

























// export const decodeToken = async ({
//   authorization,
//   tokenType = TokenTypeEnum.Access,
// }) => {
//   if (!authorization) {
//     throw BadRequestException({ message: "Missing authorization header" });
//   }

//   const [bearer, token] = authorization.split(" ") || [];

//   if (!bearer || !token || bearer !== "User") {
//     throw BadRequestException({ message: "Invalid token format" });
//   }

//   const signature = await getSignature({
//     getSignatureLevel: SignatureEnum.User,
//   });

//   if (!signature) {
//     throw BadRequestException({ message: "Signature not found" });
//   }

//   const decoded = verifyToken({
//     token,
//     secretKey:
//       tokenType === TokenTypeEnum.Access
//         ? signature.accesssignature
//         : signature.refreshSignature,
//   });

//   if (!decoded || !decoded.id) {
//     throw BadRequestException({ message: "Invalid token payload" });
//   }

//   const user = await findById({
//     model: UserModel,
//     id: decoded.id,
//   });

//   if (!user) {
//     throw  NotFoundException({ message: "Not Registered Account" });
//   }

//   return user;
// };

// export const authentication = ({ tokenType }) => {
//   return async (req, res, next) => {
//     try {
//       const user = await decodeToken({
//         authorization: req.headers.authorization,
//         tokenType,
//       });

//       req.user = user;

//       return next();
//     } catch (error) {
//       return next(error);
//     }
//   };
// };
// export const authorization = ({ AccessRoles = [] }) => {
//   return async (req, res, next) => {
//     if (!req.user) {
//       throw ForbiddenException({ message: "User not authenticated" });
//     }

//     if (!AccessRoles.includes(req.user.role)) {
//       throw ForbiddenException({ message: "Unauthorized Access" });
//     }

//     return next();
//   };
// };