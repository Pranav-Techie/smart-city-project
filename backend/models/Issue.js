const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    description: {
      type: String,
      required: true
    },

    category: {
      type: String,
      required: true
    },

    image: {
      type: String // Phase 8
    },

    // ✅ PHASE 9 — LOCATION (IMPORTANT)
   location: {
  lat: Number,
  lng: Number
},

    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved"],
      default: "pending"
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Issue", issueSchema);
