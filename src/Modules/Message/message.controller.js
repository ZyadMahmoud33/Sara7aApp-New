import { Router } from "express";
import * as messageService from "./message.service.js";
import * as messageValidation from "./message.validation.js";
import { validation } from "../../Middlewares/validation.middleware.js";
import { authentication, authorization } from "../../Middlewares/auth.middleware.js";
import { RoleEnum, TokenTypeEnum } from "../../Utlis/enumes/user.enumes.js";

const router = Router();

// send message (public)
router.post(
  "/send-message/:receiverId",
  authentication({ tokenType: TokenTypeEnum.Access }), // ✅ أضف هذا السطر
  validation(messageValidation.sendMessageValidation),
  messageService.sendMessage
);

// get All messages for Admin
router.get(
  "/get-all-messages",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.Admin] }),
  messageService.getAllMessages
);

// get message Admin by receiverId
router.get(
  "/get-message-admin/:receiverId",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.Admin] }),
  messageService.getUserMessages
);

// get message User
router.get(
  "/get-message",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.User, RoleEnum.Admin] }),
  messageService.getMessage
);

// ✅ NEW: Get single message by ID (with sender data if revealed)
router.get(
  "/:messageId",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.User, RoleEnum.Admin] }),
  messageService.getMessageById
);

// reveal sender
router.patch(
  "/:messageId/reveal",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.User, RoleEnum.Admin] }),
  messageService.revealSender
);

// like message
router.patch(
  "/:messageId/like",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.User, RoleEnum.Admin] }),
  messageService.likeMessage
);

// soft delete
router.delete(
  "/message/:messageId",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.User, RoleEnum.Admin] }),
  messageService.deleteMessage
);

// restore message
router.patch(
  "/message/:messageId/restore",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.User, RoleEnum.Admin] }),
  messageService.restoreMessage
);

// force delete
router.delete(
  "/message/:messageId/force",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.User, RoleEnum.Admin] }),
  messageService.forceDeleteMessage
);

export default router;