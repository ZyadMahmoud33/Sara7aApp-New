import mongoose from "mongoose";

const manualPaymentSchema = new mongoose.Schema(
  {
    // ===============================
    // 👤 USER
    // ===============================
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ===============================
    // 💎 PLAN
    // ===============================
    plan: {
      type: String,
      enum: ["pro", "premium"],
      required: true,
    },

    // ===============================
    // 💳 PAYMENT METHOD
    // ===============================
    method: {
    type: String,
    enum: ["vodafone", "vodafone_cash", "instapay"],
    required: true,
    lowercase: true,
    trim: true,
    },

    // ===============================
    // 💰 MONEY
    // ===============================
    amount: {
      type: Number,
      min: 1,
    },

    coins: {
      type: Number,
      default: 0,
      min: 0,
    },

    senderNumber: {
      type: String,
      trim: true,
    },

    // ===============================
    // 🖼 PROOF
    // ===============================
    screenshot: {
      type: String,
      required: true,
    },

    // ===============================
    // 📊 STATUS
    // ===============================
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    // ===============================
    // 👮 ADMIN ACTIONS
    // ===============================
    approvedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },

    approvedAt: Date,

    rejectedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    rejectReason: String,

    rejectedAt: Date,
  },
  {
    timestamps: true,
  }
);

// ===============================
// 🔥 PRE SAVE (AUTO LOGIC)
// ===============================
manualPaymentSchema.pre("save", function () {
  if (!this.coins) {
    if (this.plan === "pro") this.coins = 100;
    if (this.plan === "premium") this.coins = 300;
  }
});

// ===============================
// 🔥 INDEXES
// ===============================
manualPaymentSchema.index({ userId: 1, status: 1 });

const ManualPaymentModel =
  mongoose.models.ManualPayment ||
  mongoose.model("ManualPayment", manualPaymentSchema);

export default ManualPaymentModel;