// backend/src/Utlis/loggers/admin.log.service.js
import AdminLogModel from "../../DB/models/adminLog.model.js";
import UserModel from "../../DB/models/user.model.js";

const VALID_ACTIONS = [
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

// ================================
// 🧠 CREATE LOG
// ================================
export const createAdminLog = async ({
  adminId,
  action,
  targetId = null,
  data = {},
  ip = "",
  userAgent = "",
  endpoint = "",
  method = "",
}) => {
  try {
    if (!adminId || !action) return;

    if (!VALID_ACTIONS.includes(action)) {
      console.warn("⚠️ Invalid admin action:", action);
      return;
    }

    await AdminLogModel.create({
      adminId,
      action,
      targetId,
      data,
      ip,
      userAgent,
      endpoint,
      method,
    });
  } catch (err) {
    console.error("❌ LOG ERROR:", err.message);
  }
};

// ================================
// 🧾 LOG WRAPPER (SAFE)
// ================================
export const logAdminAction = async ({
  adminId,
  action,
  targetId = null,
  data = {},
  req = {},
}) => {
  try {
    await createAdminLog({
      adminId,
      action,
      targetId,
      data,
      ip: req?.ip || req?.headers?.["x-forwarded-for"] || "",
      userAgent: req?.headers?.["user-agent"] || "",
      endpoint: req?.originalUrl || req?.url || "",
      method: req?.method || "",
    });
  } catch (err) {
    console.error("❌ logAdminAction ERROR:", err.message);
  }
};

// ================================
// 📥 GET ALL LOGS (WITH PAGINATION & FILTERS)
// ================================
export const getAdminLogs = async (req, res, next) => {
  try {
    const page = +req.query.page || 1;
    const limit = +req.query.limit || 20;
    const { search = "", action = "", startDate = "", endDate = "" } = req.query;

    const skip = (page - 1) * limit;
    const filter = {};

    if (action && action !== "all") filter.action = action;

    if (startDate) {
      filter.createdAt = { ...filter.createdAt, $gte: new Date(startDate) };
    }
    if (endDate) {
      filter.createdAt = { ...filter.createdAt, $lte: new Date(endDate) };
    }

    let query = AdminLogModel.find(filter)
      .populate("adminId", "email username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (search) {
      const users = await UserModel.find({
        email: { $regex: search, $options: "i" }
      });
      const userIds = users.map(u => u._id);
      if (userIds.length > 0) {
        query = query.or([{ adminId: { $in: userIds } }]);
      }
    }

    const logs = await query;
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
    console.error("getAdminLogs error:", err);
    next(err);
  }
};

// ================================
// 📊 GET LOGS STATISTICS
// ================================
export const getAdminLogsStats = async (req, res, next) => {
  try {
    const total = await AdminLogModel.countDocuments();

    const last24Hours = await AdminLogModel.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    const lastWeek = await AdminLogModel.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    const lastMonth = await AdminLogModel.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    const byAction = {};
    for (const action of VALID_ACTIONS) {
      byAction[action] = await AdminLogModel.countDocuments({ action });
    }

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
    console.error("getAdminLogsStats error:", err);
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

    const headers = ["Action", "Admin Email", "Target ID", "IP Address", "Data", "Timestamp"];
    const rows = logs.map(log => [
      log.action,
      log.adminId?.email || "Unknown",
      log.targetId || "",
      log.ip || "",
      JSON.stringify(log.data || {}),
      new Date(log.createdAt).toISOString(),
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
      return res.status(404).json({ success: false, message: "Log not found ❌" });
    }

    return res.status(200).json({
      success: true,
      message: "Log fetched ✅",
      data: log,
    });
  } catch (err) {
    console.error("getLogById error:", err);
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