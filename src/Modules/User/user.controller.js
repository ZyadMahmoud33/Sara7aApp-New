import { Router } from "express";
import * as userService from "./user.service.js";
import { authentication, authorization } from "../../Middlewares/auth.middleware.js";
import { RoleEnum, TokenTypeEnum } from "../../Utlis/enumes/user.enumes.js";
import { localFileUpload, fileValidation } from "../../Utlis/multer/local.multer.js";
import { validation } from "../../Middlewares/validation.middleware.js";
import {
  updateProfilePicSchema,
  coverImagesValidation,
} from "./user.validation.js";


const router = Router();

router.get(
    "/", 
    authentication({tokenType: TokenTypeEnum.Access}),
    authorization({AccessRoles: [RoleEnum.User]}),
    userService.getprofile,

);


router.patch(
  "/update-profile-pic",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.User] }),
  localFileUpload({
    customPath: "Users",
    validation: [...fileValidation.images],
  }).single("attachments"),
  validation(updateProfilePicSchema),
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
  validation(coverImagesValidation),
  userService.uploadCoverPic,
);



export default router;
