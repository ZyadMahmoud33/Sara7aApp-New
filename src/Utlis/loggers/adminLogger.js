import AdminLogModel from "../../DB/models/adminLog.model.js";

// ================================
// 📌 VALID ACTIONS
// ================================
const VALID_ACTIONS = [
  "APPROVE_PAYMENT",
  "REJECT_PAYMENT",
  "FREEZE_USER",
  "RESTORE_USER",
  "DELETE_USER",
  "CHANGE_ROLE",
  "CHANGE_PASSWORD",
];

// ================================
// 🧠 CREATE ADMIN LOG
// ================================
export const createAdminLog = async ({
  adminId,
  action,
  targetId = null,
  data = {},
  ip = "",
  userAgent = "",
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
    });

  } catch (err) {
    console.error("❌ CREATE LOG ERROR:", err.message);
  }
};

// ================================
// 🧾 MAIN LOGGER FUNCTION
// ================================
export const logAdminAction = async ({
  adminId,
  action,
  targetId = null,
  data = {},
  req = {},
}) => {
  try {
    const ip =
      req?.ip ||
      req?.headers?.["x-forwarded-for"] ||
      req?.socket?.remoteAddress ||
      "";

    const userAgent = req?.headers?.["user-agent"] || "";

    await createAdminLog({
      adminId,
      action,
      targetId,
      data,
      ip,
      userAgent,
    });

  } catch (err) {
    console.error("❌ LOG ACTION ERROR:", err.message);
  }
};

// ================================
// 📥 GET ADMIN LOGS (WITH PAGINATION)
// ================================
export const getAdminLogs = async (req, res, next) => {
  try {
    const page = +req.query.page || 1;
    const limit = +req.query.limit || 20;

    const skip = (page - 1) * limit;

    const logs = await AdminLogModel.find()
      .populate("adminId", "email username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AdminLogModel.countDocuments();

    return res.status(200).json({
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