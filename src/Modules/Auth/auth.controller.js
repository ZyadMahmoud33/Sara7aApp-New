// import { Router } from "express";
// import * as authService from "./auth.service.js";
// import * as authValidation from "./auth.validation.js";
// import { authentication, authorization } from "../../Middlewares/auth.middleware.js";
// import { RoleEnum, TokenTypeEnum } from "../../Utlis/enumes/user.enumes.js";
// import { validation } from "../../Middlewares/validation.middleware.js";

// const router = Router();

// router.post("/signup",
//   authentication({ tokenType: TokenTypeEnum.Access }),
//   authorization({ AccessRoles: [RoleEnum.User] }),
//   validation(authValidation.signupSchema),
//   authService.signup  
// );

// router.patch(
//   "/confirm-email",
//   authentication({ tokenType: TokenTypeEnum.Access }),
//   authorization({ AccessRoles: [RoleEnum.User] }),
//   validation(authValidation.confirmEmailSchema),
//   authService.confirmEmail
// );

// router.patch(
//   "/resend-otp",
//   authentication({ tokenType: TokenTypeEnum.Access }),
//   authorization({ AccessRoles: [RoleEnum.User] }),
//   validation(authValidation.resendOtpSchema),
//   authService.resendOtp
// );

// router.post("/login",
//   authentication({ tokenType: TokenTypeEnum.Access }),
//   authorization({ AccessRoles: [RoleEnum.User, RoleEnum.Admin] }),
//   validation(authValidation.loginSchema),
//   authService.login
// );

// router.post(
//   "/refresh-token",
//   authentication({ tokenType: TokenTypeEnum.Refresh }),
//   authorization({ AccessRoles: [RoleEnum.User, RoleEnum.Admin] }),
//   validation(authValidation.refreshTokenSchema),
//   authService.refreshToken
// );

// router.post("/social-login", authService.loginWithGoogle);

// router.post(
//   "/logout",  
//   authentication({ tokenType: TokenTypeEnum.Access }),
//   authorization({ AccessRoles: [RoleEnum.User, RoleEnum.Admin] }),
//   validation(authValidation.logoutSchema),
//   authService.logout
// );

// router.post(
//   "/logout-with-redis",
//   authentication({ tokenType: TokenTypeEnum.Access }),
//   authorization({ AccessRoles: [RoleEnum.User, RoleEnum.Admin] }),
//   validation(authValidation.logoutSchema),
//   authService.logoutWithRedis
// );

// router.patch("/forget-password",
//   authentication({ tokenType: TokenTypeEnum.Access }),
//   authorization({ AccessRoles: [RoleEnum.User, RoleEnum.Admin] }),
//   validation(authValidation.forgetPasswordSchema),
//   authService.forgetPassword
// );

// router.patch(
//   "/reset-password",
//   authentication({ tokenType: TokenTypeEnum.Access }),
//   authorization({ AccessRoles: [RoleEnum.User, RoleEnum.Admin] }),
//   validation(authValidation.resetPasswordSchema),
//   authService.resetPassword
// );


// export default router;

// backend/src/Modules/Auth/auth.routes.js
import { Router } from "express";
import * as authService from "./auth.service.js";
import * as authValidation from "./auth.validation.js";
import { authentication, authorization } from "../../Middlewares/auth.middleware.js";
import { RoleEnum, TokenTypeEnum } from "../../Utlis/enumes/user.enumes.js";
import { validation } from "../../Middlewares/validation.middleware.js";

const router = Router();

// ================================
// 📝 PUBLIC ROUTES (no authentication required)
// ================================

// ✅ REGISTER - Create new account
router.post("/signup",
    validation(authValidation.signupSchema),
    authService.signup
);

// ✅ LOGIN - Sign in with email/password
router.post("/login",
    validation(authValidation.loginSchema),
    authService.login
);

// ✅ CONFIRM EMAIL - Verify email with OTP
router.patch("/confirm-email",
    validation(authValidation.confirmEmailSchema),
    authService.confirmEmail
);

// ✅ RESEND OTP - Resend verification code
router.patch("/resend-otp",
    validation(authValidation.resendOtpSchema),
    authService.resendOtp
);

// ✅ FORGET PASSWORD - Request password reset
router.patch("/forget-password",
    validation(authValidation.forgetPasswordSchema),
    authService.forgetPassword
);

// ✅ RESET PASSWORD - Reset password with OTP
router.patch("/reset-password",
    validation(authValidation.resetPasswordSchema),
    authService.resetPassword
);

// ================================
// 🌐 SOCIAL LOGIN ROUTES
// ================================
router.post("/google-login", authService.loginWithGoogle);
router.post("/facebook-login", authService.loginWithFacebook);
router.post("/github-login", authService.loginWithGitHub);
router.post("/apple-login", authService.loginWithApple);
router.post("/twitter-login", authService.loginWithTwitter);

// ================================
// 🔒 PROTECTED ROUTES (require authentication)
// ================================

// 🔄 REFRESH TOKEN - Get new access token
router.post("/refresh-token",
    authentication({ tokenType: TokenTypeEnum.Refresh }),
    authService.refreshToken
);

// 🚪 LOGOUT - Logout from current device
router.post("/logout",  
    authentication({ tokenType: TokenTypeEnum.Access }),
    authorization({ AccessRoles: [RoleEnum.User] }),
    validation(authValidation.logoutSchema),
    authService.logout
);

// 🚪 LOGOUT WITH REDIS - Logout using Redis blacklist
router.post("/logout-with-redis",
    authentication({ tokenType: TokenTypeEnum.Access }),
    authService.logoutWithRedis
);

export default router;