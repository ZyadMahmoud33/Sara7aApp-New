import { Router } from "express";
import * as authService from "./auth.service.js";
import * as authValidation from "./auth.validation.js";
import { authentication } from "../../Middlewares/auth.middleware.js";
import { TokenTypeEnum } from "../../Utlis/enumes/user.enumes.js";
import { validation } from "../../Middlewares/validation.middleware.js";

const router = Router();

router.post("/signup",
  authentication({ tokenType: TokenTypeEnum.Access }),
  validation(authValidation.signupSchema),
  authService.signup  
);

router.patch(
  "/confirm-email",
  authentication({ tokenType: TokenTypeEnum.Access }),
  validation(authValidation.confirmEmailSchema),
  authService.confirmEmail
);

router.patch(
  "/resend-otp",
  authentication({ tokenType: TokenTypeEnum.Access }),
  validation(authValidation.resendOtpSchema),
  authService.resendOtp
);

router.post("/login",
  authentication({ tokenType: TokenTypeEnum.Access }),
  validation(authValidation.loginSchema),
  authService.login
);

router.post(
  "/refresh-token",
  authentication({ tokenType: TokenTypeEnum.Refresh }),
  validation(authValidation.refreshTokenSchema),
  authService.refreshToken
);

router.post("/social-login", authService.loginWithGoogle);

router.post(
  "/logout",  
  authentication({ tokenType: TokenTypeEnum.Access }),
  validation(authValidation.logoutSchema),
  authService.logout
);

router.post(
  "/logout-with-redis",
  authentication({ tokenType: TokenTypeEnum.Access }),
  validation(authValidation.logoutSchema),
  authService.logoutWithRedis
);

router.patch("/forget-password",
  authentication({ tokenType: TokenTypeEnum.Access }),
  validation(authValidation.forgetPasswordSchema),
  authService.forgetPassword
);

router.patch(
  "/reset-password",
  authentication({ tokenType: TokenTypeEnum.Access }),
  validation(authValidation.resetPasswordSchema),
  authService.resetPassword
);


export default router;