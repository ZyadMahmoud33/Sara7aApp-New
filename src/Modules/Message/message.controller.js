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
  validation(messageValidation.getAllMessagesValidation),
  messageService.getAllMessages
);

// get message Admin by receiverId
router.get(
  "/get-message-admin/:receiverId",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.Admin] }),
  validation(messageValidation.getUserMessagesValidation),
  messageService.getUserMessages
);

// get message User
router.get(
  "/get-message",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.User, RoleEnum.Admin] }),
  validation(messageValidation.getMyMessagesValidation),
  messageService.getMessage
);

// ✅ NEW: Get single message by ID (with sender data if revealed)

// like message
router.patch(
  "/:messageId/like",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.User, RoleEnum.Admin] }),
  validation(messageValidation.likeMessageValidation),
  messageService.likeMessage
);

// reveal sender
router.patch(
  "/:messageId/reveal",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.User, RoleEnum.Admin] }),
  validation(messageValidation.revealSenderValidation),
  messageService.revealSender
);

router.get(
  "/:messageId",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.User, RoleEnum.Admin] }),
  validation(messageValidation.getMessageByIdValidation),
  messageService.getMessageById
);
// soft delete
router.get(
  "/message/:messageId",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.User, RoleEnum.Admin] }),
  validation(messageValidation.deleteMessageValidation),
  messageService.deleteMessage
);

// restore message
router.patch(
  "/message/:messageId/restore",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.User, RoleEnum.Admin] }),
  validation(messageValidation.restoreMessageValidation),
  messageService.restoreMessage
);

// force delete
router.delete(
  "/message/:messageId/force",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.User, RoleEnum.Admin] }),
  validation(messageValidation.forceDeleteMessageValidation),
  messageService.forceDeleteMessage
);

export default router;