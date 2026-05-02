// backend/src/modules/admin/admin.service.js
import UserModel from "../../DB/models/user.model.js";
import ManualPaymentModel from "../../DB/models/manualPayment.model.js";
import MessageModel from "../../DB/models/message.model.js";
import AdminLogModel from "../../DB/models/adminLog.model.js";

// ================================
// 📊 GET ADMIN STATS
// ================================
export const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await UserModel.countDocuments();
    const totalPayments = await ManualPaymentModel.countDocuments();
    const approvedPayments = await ManualPaymentModel.countDocuments({ status: "approved" });
    const pendingPayments = await ManualPaymentModel.countDocuments({ status: "pending" });
    const rejectedPayments = await ManualPaymentModel.countDocuments({ status: "rejected" });
    
    const payments = await ManualPaymentModel.find({ status: "approved" });
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    let totalMessages = 0;
    try {
      totalMessages = await MessageModel.countDocuments();
    } catch (err) {
      console.warn("MessageModel not available yet");
    }

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalPayments,
        approvedPayments,
        pendingPayments,
        rejectedPayments,
        totalRevenue,
        totalMessages,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ================================
// 📥 GET LOGS BY ACTION
// ================================
export const getAdminLogsByAction = async (req, res, next) => {
  try {
    const { action } = req.params;
    const page = +req.query.page || 1;
    const limit = +req.query.limit || 20;
    const skip = (page - 1) * limit;

    const logs = await AdminLogModel.find({ action })
      .populate("adminId", "email username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AdminLogModel.countDocuments({ action });

    return res.status(200).json({
      success: true,
      message: "Admin logs fetched ✅",
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ================================
// 📥 GET LOGS BY DATE RANGE
// ================================
export const getAdminLogsByDateRange = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const page = +req.query.page || 1;
    const limit = +req.query.limit || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (startDate) {
      filter.createdAt = { $gte: new Date(startDate) };
    }
    if (endDate) {
      filter.createdAt = { ...filter.createdAt, $lte: new Date(endDate) };
    }

    const logs = await AdminLogModel.find(filter)
      .populate("adminId", "email username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AdminLogModel.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: "Admin logs fetched ✅",
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ================================
// 📊 GET LOGS STATISTICS
// ================================
export const getAdminLogsStats = async (req, res, next) => {
  try {
    const total = await AdminLogModel.countDocuments();
    
    const byAction = {};
    const validActions = [
      "APPROVE_PAYMENT",
      "REJECT_PAYMENT",
      "FREEZE_USER",
      "RESTORE_USER",
      "DELETE_USER",
      "CHANGE_ROLE",
      "CHANGE_PASSWORD",
      "VIEW_PENDING_PAYMENTS",
      "VIEW_DASHBOARD",
      "VIEW_MESSAGES",
      "VIEW_SETTINGS",
      "VIEW_LOGS",
      "REFRESH_DATA",
      "SEARCH_USERS",
      "SEARCH_PAYMENTS",
      "FILTER_PAYMENTS",
      "EXPORT_LOGS",
    ];

    for (const action of validActions) {
      byAction[action] = await AdminLogModel.countDocuments({ action });
    }

    const last24Hours = await AdminLogModel.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    const lastWeek = await AdminLogModel.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    const lastMonth = await AdminLogModel.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    return res.status(200).json({
      success: true,
      message: "Admin logs stats fetched ✅",
      data: {
        total,
        byAction,
        last24Hours,
        lastWeek,
        lastMonth,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ================================
// 📥 GET LOGS BY ADMIN ID
// ================================
export const getAdminLogsByAdminId = async (req, res, next) => {
  try {
    const { adminId } = req.params;
    const page = +req.query.page || 1;
    const limit = +req.query.limit || 20;
    const skip = (page - 1) * limit;

    const logs = await AdminLogModel.find({ adminId })
      .populate("adminId", "email username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AdminLogModel.countDocuments({ adminId });

    return res.status(200).json({
      success: true,
      message: "Admin logs fetched ✅",
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ================================
// 🗑️ DELETE OLD LOGS
// ================================
export const deleteOldLogs = async (req, res, next) => {
  try {
    const days = +req.query.days || 30;
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const result = await AdminLogModel.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    return res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} old logs ✅`,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    next(err);
  }
};

// ================================
// 📤 EXPORT LOGS TO CSV
// ================================
export const exportLogsToCSV = async (req, res, next) => {
  try {
    const { startDate, endDate, action } = req.query;

    const filter = {};
    if (startDate) filter.createdAt = { $gte: new Date(startDate) };
    if (endDate) filter.createdAt = { ...filter.createdAt, $lte: new Date(endDate) };
    if (action && action !== "all") filter.action = action;

    const logs = await AdminLogModel.find(filter)
      .populate("adminId", "email username")
      .sort({ createdAt: -1 });

    const headers = ["Action", "Admin Email", "Target ID", "IP Address", "User Agent", "Timestamp", "Data"];
    const rows = logs.map(log => [
      log.action,
      log.adminId?.email || "Unknown",
      log.targetId || "",
      log.ip || "",
      log.userAgent || "",
      new Date(log.createdAt).toISOString(),
      JSON.stringify(log.data || {}),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=admin-logs-${Date.now()}.csv`);
    return res.status(200).send(csvContent);
  } catch (err) {
    next(err);
  }
};

// ================================
// 🔍 GET LOG BY ID
// ================================
export const getLogById = async (req, res, next) => {
  try {
    const { logId } = req.params;

    const log = await AdminLogModel.findById(logId).populate("adminId", "email username");

    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Log not found ❌",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Log fetched ✅",
      data: log,
    });
  } catch (err) {
    next(err);
  }
};

// ================================
// 👤 GET ADMIN PROFILE
// ================================
export const getAdminProfile = async (req, res, next) => {
  try {
    return res.status(200).json({
      message: "Admin profile fetched successfully ✅",
      data: {
        _id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        username: req.user.username,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ================================
// 👥 GET ALL USERS
// ================================
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await UserModel.find().select(
      "email role createdAt coins plan isPremium adminLevel firstName lastName username freezedAt"
    );

    return res.status(200).json({
      success: true,
      message: "Users fetched",
      data: { users },
    });
  } catch (err) {
    next(err);
  }
};

// ================================
// ❄️ FREEZE ACCOUNT
// ================================
export const freezeAccount = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (userId.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You can't freeze yourself ❌" });
    }

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found ❌" });

    if (user.adminLevel === 0 && req.user.adminLevel !== 0) {
      return res.status(403).json({ success: false, message: "Can't freeze super admin ❌" });
    }

    if (user.freezedAt) {
      return res.status(400).json({ success: false, message: "User already freezed ❌" });
    }

    user.freezedAt = new Date();
    user.freezedBy = req.user._id;
    user.restoredAt = undefined;
    user.restoredBy = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Account freezed successfully ✅",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// ================================
// 🔄 RESTORE ACCOUNT
// ================================
export const restoreAccount = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found ❌" });

    if (!user.freezedAt) {
      return res.status(400).json({ success: false, message: "User is not freezed ❌" });
    }

    user.restoredAt = new Date();
    user.restoredBy = req.user._id;
    user.freezedAt = undefined;
    user.freezedBy = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User restored successfully ✅",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// ================================
// ❌ DELETE USER
// ================================
export const hardDeleteAccount = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (userId.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You can't delete yourself ❌" });
    }

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found ❌" });

    if (user.adminLevel === 0 && req.user.adminLevel !== 0) {
      return res.status(403).json({ success: false, message: "Can't delete super admin ❌" });
    }

    await UserModel.deleteOne({ _id: userId });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully ✅",
    });
  } catch (err) {
    next(err);
  }
};

// ================================
// 💳 APPROVE PAYMENT
// ================================
export const approvePayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    const payment = await ManualPaymentModel.findById(paymentId);
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found ❌" });

    if (payment.status !== "pending") {
      return res.status(400).json({ success: false, message: "Payment already processed ❌" });
    }

    payment.status = "approved";
    payment.approvedAt = new Date();
    payment.approvedBy = req.user._id;
    await payment.save();

    const user = await UserModel.findById(payment.userId);
    if (user) {
      if (payment.coins > 0) {
        user.coins = (user.coins || 0) + payment.coins;
      }
      if (payment.plan) {
        user.plan = payment.plan;
        if (payment.plan === "premium") {
          user.premiumExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        } else if (payment.plan === "pro") {
          user.premiumExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        }
      }
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: "Payment approved ✅",
      data: { payment, user },
    });
  } catch (err) {
    next(err);
  }
};

// ================================
// ❌ REJECT PAYMENT
// ================================
export const rejectPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;

    const payment = await ManualPaymentModel.findById(paymentId);
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found ❌" });

    if (payment.status !== "pending") {
      return res.status(400).json({ success: false, message: "Payment already processed ❌" });
    }

    payment.status = "rejected";
    payment.rejectedAt = new Date();
    payment.rejectedBy = req.user._id;
    payment.rejectReason = reason || "No reason provided";
    await payment.save();

    return res.status(200).json({
      success: true,
      message: "Payment rejected ❌",
      data: payment,
    });
  } catch (err) {
    next(err);
  }
};

// ================================
// ⏳ GET PENDING PAYMENTS
// ================================
export const getPendingPayments = async (req, res, next) => {
  try {
    const page = +req.query.page || 1;
    const limit = +req.query.limit || 10;
    const skip = (page - 1) * limit;

    const payments = await ManualPaymentModel.find({ status: "pending" })
      .populate("userId", "email username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ManualPaymentModel.countDocuments({ status: "pending" });

    return res.status(200).json({
      success: true,
      message: "Pending payments",
      data: payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ================================
// 🔐 CHANGE PASSWORD
// ================================
export const changeAdminPassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const admin = await UserModel.findById(req.user._id);
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found ❌" });

    const isValid = await compareHash({
      plaintext: oldPassword,
      ciphertext: admin.password,
      algo: HashEnum.Argon,
    });

    if (!isValid) {
      return res.status(400).json({ success: false, message: "Wrong old password ❌" });
    }

    const hash = await generateHash({
      plaintext: newPassword,
      algo: HashEnum.Argon,
    });

    admin.password = hash;
    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully 🔥",
    });
  } catch (err) {
    next(err);
  }
};

// ================================
// 👑 CHANGE USER ROLE
// ================================
export const changeUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (![0, 1].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role ❌" });
    }

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found ❌" });

    if (user.adminLevel === 0 && req.user.adminLevel !== 0) {
      return res.status(403).json({ success: false, message: "Can't modify super admin ❌" });
    }

    user.role = role;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Role updated 🔥",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};