import { Router } from "express";
import * as adminService from "./admin.service.js";
import * as adminValidation from "./admin.validation.js";

import {
  authentication,
  authorization,
} from "../../Middlewares/auth.middleware.js";

import {
  RoleEnum,
  TokenTypeEnum,
} from "../../Utlis/enumes/user.enumes.js";

import { validation } from "../../Middlewares/validation.middleware.js";
import { getAdminLogs } from "../../Utlis/loggers/adminLogger.js";

const router = Router();

// ================================
// 🔐 COMMON MIDDLEWARE
// ================================
const secure = [
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.Admin] }),
];

// ================================
// 👤 ADMIN PROFILE
// ================================
router.get(
  "/profile",
  ...secure,
  adminService.getAdminProfile
);

// ================================
// 👥 GET ALL USERS
// ================================
router.get(
  "/users",
  ...secure,
  adminService.getAllUsers
);

// ================================
// ❄️ FREEZE USER
// ================================
router.delete(
  "/:userId/freeze-account",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.Admin] }),
  adminService.freezeAccount
);

// ================================
// 🔄 RESTORE USER
// ================================
router.patch(
  "/:userId/restore-account",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.Admin] }),
  adminService.restoreAccount
);

// ================================
// ❌ DELETE USER
// ================================
router.delete(
  "/:userId/hard-delete",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.Admin] }),
  adminService.hardDeleteAccount
);

// ================================
// 👑 CHANGE USER ROLE
// ================================
router.patch(
  "/:userId/change-role",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.Admin] }),
  adminService.changeUserRole
);

// ================================
// 💳 GET PENDING PAYMENTS
// ================================
router.get(
  "/payments",
   authentication({ tokenType: TokenTypeEnum.Access }),
   authorization({ AccessRoles: [RoleEnum.Admin] }),
  adminService.getPendingPayments
);

// ================================
// ✅ APPROVE PAYMENT
// ================================
router.patch(
  "/payments/:paymentId/approve",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.Admin] }),
  adminService.approvePayment
);

// ================================
// ❌ REJECT PAYMENT
// ================================
router.patch(
  "/payments/:paymentId/reject",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.Admin] }),
  adminService.rejectPayment
);

// ================================
// 📜 ADMIN LOGS (🔥 مهم)
// ================================
router.get(
  "/logs",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.Admin] }),
  getAdminLogs
);

// ================================
// 🔑 CHANGE PASSWORD
// ================================
router.patch(
  "/change-password",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.Admin] }),
  adminService.changeAdminPassword
);

// backend/src/modules/admin/admin.controller.js

// أضف هذه الـ routes داخل الـ router

// 📊 GET LOGS STATISTICS
router.get(
  "/logs/stats",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.Admin] }),
  adminService.getAdminLogsStats
);

// 📥 GET LOGS BY ADMIN ID
router.get(
  "/logs/admin/:adminId",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.Admin] }),
  adminService.getAdminLogsByAdminId
);

// 📥 GET LOGS BY ACTION
router.get(
  "/logs/action/:action",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.Admin] }),
  adminService.getAdminLogsByAction
);

// 📥 GET LOGS BY DATE RANGE
router.get(
  "/logs/date-range",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.Admin] }),
  adminService.getAdminLogsByDateRange
);

// 📤 EXPORT LOGS TO CSV
router.get(
  "/logs/export",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.Admin] }),
  adminService.exportLogsToCSV
);

// 🗑️ DELETE OLD LOGS
router.delete(
  "/logs",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.Admin] }),
  adminService.deleteOldLogs
);

// 🔍 GET LOG BY ID
router.get(
  "/logs/:logId",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.Admin] }),
  adminService.getLogById
);


router.get(
  "/stats",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.Admin] }),
  adminService.getAdminStats
);

router.get(
  "/logs/stats",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.Admin] }),
  adminService.getAdminLogsStats
);

// 📥 GET LOGS BY ADMIN ID
router.get(
  "/logs/admin/:adminId",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.Admin] }),
  adminService.getAdminLogsByAdminId
);

// 📥 GET LOGS BY ACTION
router.get(
  "/logs/action/:action",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.Admin] }),
  adminService.getAdminLogsByAction
);

// 📥 GET LOGS BY DATE RANGE
router.get(
  "/logs/date-range",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.Admin] }),
  adminService.getAdminLogsByDateRange
);

// 📤 EXPORT LOGS TO CSV
router.get(
  "/logs/export",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.Admin] }),
  adminService.exportLogsToCSV
);

// 🗑️ DELETE OLD LOGS
router.delete(
  "/logs",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.Admin] }),
  adminService.deleteOldLogs
);

// 🔍 GET LOG BY ID
router.get(
  "/logs/:logId",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ AccessRoles: [RoleEnum.Admin] }),
  adminService.getLogById
);
export default router;