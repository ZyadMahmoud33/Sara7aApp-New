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

import { Router } from "express";
import * as authService from "./auth.service.js";
import * as authValidation from "./auth.validation.js";
import { authentication, authorization } from "../../Middlewares/auth.middleware.js";
import { RoleEnum, TokenTypeEnum } from "../../Utlis/enumes/user.enumes.js";
import { validation } from "../../Middlewares/validation.middleware.js";

const router = Router();

// 📝 إنشاء حساب جديد (مفتوح للكل - لا يحتاج Token)
// ✅ من غير authentication و authorization
router.post("/signup",
     validation(authValidation.signupSchema),
      authService.signup
    );



// 🔑 تسجيل الدخول (مفتوح للكل - هو اللي بيولد الـ Token)
router.post("/login",
    validation(authValidation.loginSchema),
    authService.login
);

// 📧 تأكيد الإيميل (مفتوح للكل لأنه بيعتمد على الكود المرسل)
router.patch(
    "/confirm-email",
    validation(authValidation.confirmEmailSchema),
    authService.confirmEmail
);

// 🔄 إعادة إرسال الـ OTP
router.patch(
    "/resend-otp",
    validation(authValidation.resendOtpSchema),
    authService.resendOtp
);

// 🌐 تسجيل دخول بجوجل
router.post("/social-login", authService.loginWithGoogle);

// 🔄 تحديث التوكين (يحتاج Refresh Token حصراً)
router.post(
    "/refresh-token",
    authentication({ tokenType: TokenTypeEnum.Refresh }),
    authService.refreshToken
);

// 🚪 تسجيل الخروج (يحتاج Access Token عشان نعرف مين اللي بيقفل الجلسة)
router.post(
    "/logout",  
    authentication({ tokenType: TokenTypeEnum.Access }),
    authorization({ AccessRoles: [RoleEnum.User] }),
    validation(authValidation.logoutSchema),
    authService.logout
);

// 🚪 تسجيل الخروج باستخدام Redis
router.post(
    "/logout-with-redis",
    authentication({ tokenType: TokenTypeEnum.Access }),
    authService.logoutWithRedis
);

// 🆘 نسيان كلمة المرور (مفتوح للكل)
router.patch("/forget-password",
    validation(authValidation.forgetPasswordSchema),
    authService.forgetPassword
);

// 🛠️ إعادة تعيين كلمة المرور (مفتوح للكل)
router.patch(
    "/reset-password",
    validation(authValidation.resetPasswordSchema),
    authService.resetPassword
);

export default router;