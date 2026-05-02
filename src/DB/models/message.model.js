import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      minlength: [2, "Message must be at least 2 characters long"],
      maxlength: [500, "Message must be less than 500 characters long"],
      trim: true,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    isAnonymous: {
      type: Boolean,
      default: true,
    },

    isRevealed: {
      type: Boolean,
      default: false,
    },

    // ✅ التصحيح: likes تكون Number فقط
    likes: {
      type: Number,
      default: 0,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    revealedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },

    deletedAt: Date,
    ipAddress: String,

    // ✅ ADDED: حقول الكشف (Reveal System)
    revealRequestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    revealRequestedAt: {
      type: Date,
      default: null,
    },

    revealedAt: {
      type: Date,
      default: null,
    },

    revealCode: {
      type: String,
      default: null,
    },

    isRevealApproved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const MessageModel = mongoose.model("Message", messageSchema);

export default MessageModel;