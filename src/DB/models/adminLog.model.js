// backend/src/DB/models/adminLog.model.js
import mongoose from "mongoose";

const adminLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    action: {
      type: String,
      required: true,
      enum: [
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
      ],
      index: true,
    },

    targetId: {
      type: mongoose.Types.ObjectId,
      index: true,
    },

    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    ip: {
      type: String,
      default: "unknown",
    },

    userAgent: {
      type: String,
      default: "unknown",
    },

    endpoint: {
      type: String,
      default: "",
    },

    method: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

adminLogSchema.index({ adminId: 1, createdAt: -1 });
adminLogSchema.index({ action: 1, createdAt: -1 });
adminLogSchema.index({ createdAt: -1 });

adminLogSchema.statics.createLog = async function ({
  adminId,
  action,
  targetId = null,
  data = {},
  ip = "unknown",
  userAgent = "unknown",
  endpoint = "",
  method = "",
}) {
  return this.create({
    adminId,
    action,
    targetId,
    data,
    ip,
    userAgent,
    endpoint,
    method,
  });
};

const AdminLogModel = mongoose.model("AdminLog", adminLogSchema);

export default AdminLogModel;