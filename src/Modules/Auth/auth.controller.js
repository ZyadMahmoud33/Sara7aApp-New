import { Router } from "express";
import * as authService from "./auth.service.js";
import * as authValidation from "./auth.validation.js";
import { authentication } from "../../Middlewares/auth.middleware.js";
import { TokenTypeEnum } from "../../Utlis/enumes/user.enumes.js";
import { validation } from "../../Middlewares/validation.middleware.js";
import joi from "joi";
import { localFileUpload } from "../../Utlis/multer/local.multer.js";

const router = Router();

router.post("/signup",
  validation(authValidation.signupSchema),
  authService.signup  
);

router.patch(
  "/confirm-email",
  validation(authValidation.confirmEmailSchema),
  authService.confirmEmail
);

router.patch(
  "/resend-otp",
  validation(authValidation.resendOtpSchema),
  authService.resendOtp
);

router.post("/login",
   validation(authValidation.loginSchema),
   authService.login,
);

router.post(
  "/refresh-token",
  authentication({ tokenType: TokenTypeEnum.Refresh }),
  authService.refreshToken
);

router.post("/social-login", authService.loginWithGoogle);

router.post(
  "/logout",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authService.logout
);

router.post(
  "/logout-with-redis",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authService.logoutWithRedis
);

router.patch("/forget-password",
  validation(authValidation.forgetPasswordSchema),
  authService.forgetPassword
);

router.patch(
  "/reset-password",
  validation(authValidation.resetPasswordSchema),
  authService.resetPassword
);


export default router;