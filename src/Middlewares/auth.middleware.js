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
    const [Bearer, token] = authorization.split(" ") || [];

    if (!Bearer || !token) 
      throw BadRequestException({ message: "Invalid token" });


    let signature = await getSignature ({ 
      getSignatureLevel:  
        Bearer === "Admin" ? SignatureEnum.Admin : SignatureEnum.User,
     });

    const decoded = verifyToken({
      token,
      secretKey: 
      tokenType === TokenTypeEnum.Access 
      ? signature.accesssignature 
      : signature.refreshSignature,
    });
    // ❌ لو التوكن بايظ
   if (!decoded) throw UnauthorizedException({ message: "Invalid token ❌" });


     console.log(decoded);
    

    // check if token is revoked ----> logout
    if (await findOne({
      model: TokenModel,
      filter: { jti : decoded.jti}
    }))
      throw UnauthorizedException({ message: "Token Is Revoked" });


      const isRevoked = await get({
      key: revokeTokenKey({ userId: decoded.id, jti: decoded.jti }),
    });
      if (isRevoked) throw UnauthorizedException({ message: "Token Is Revoked" });
    


    const user = await findById({
      model: UserModel,
      id: decoded.id,
    });

    console.log(user);
    
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


export const isPremiumUser = (req, res, next) => {
  if (!req.user.isPremium) {
    return next(
      new Error("Upgrade to premium first", { cause: 403 })
    );
  }
  next();
};






















