import { Router } from "express";
import * as userService from "./user.service.js";
import { authentication, authorization } from "../../Middlewares/auth.middleware.js";
import { RoleEnum, TokenTypeEnum } from "../../Utlis/enumes/user.enumes.js";
import { localFileUpload, fileValidation } from "../../Utlis/multer/local.multer.js";
import { validation } from "../../Middlewares/validation.middleware.js";
import * as userValidation from "./user.validation.js";


const router = Router();

router.get(
    "/getuser", 
    authentication({tokenType: TokenTypeEnum.Access}),
    authorization({AccessRoles: [RoleEnum.User, RoleEnum.Admin]}),
    userService.getprofile,

);



router.get("/profile/:username", userService.getUserByUsername);

router.get("/:id", userService.getUserById);

// علق الـ validation line
router.patch(
  "/update-profile-pic",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.User] }),
  localFileUpload({
    customPath: "Users",
    validation: [...fileValidation.images],
  }).single("attachments"),
  // validation(userValidation.updateProfilePicSchema), // ✅ علقها مؤقتاً
  userService.uploadProfilePic,
);



router.patch(
  "/update-cover-pic",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.User] }),
  localFileUpload({
    customPath: "Users",
    validation: [...fileValidation.images],
  }).array("attachments", 5),
  validation(userValidation.coverImagesValidation),
  userService.uploadCoverPic,
);

router.patch(
  "/update-password",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.User, RoleEnum.Admin] }),
  validation(userValidation.updatePasswordSchema),
  userService.updatePassword,
);



router.patch(
  "/upgrade/:userId",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.User] }),
  validation(userValidation.getPremiumStatusSchema),
  userService.upgradePlan
);

router.post(
  "/checkout",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.User] }),
  userService.createCheckoutSession
);

// 🔥 manual payment
// FIX upgrade route


// ✅ manual payment with validation
router.post(
  "/manual-payment",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.User] }),

  localFileUpload({
    customPath: "Users/manualPayments",
    validation: [...fileValidation.images],
  }).single("screenshot"),

  userService.createManualPayment
);

router.post(
  "/watch-ad",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.User] }),
  userService.watchAd
);

router.patch(
  "/update-profile",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.User, RoleEnum.Admin] }),
  validation(userValidation.updateProfileSchema),
  userService.updateProfile
);
// 👤 UPDATE PERSONAL INFO (جديد)
router.patch(
  "/update-personal-info",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.User, RoleEnum.Admin] }),
  validation(userValidation.updatePersonalInfoSchema),
  userService.updatePersonalInfo
);




export default router;
