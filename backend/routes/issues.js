const express = require("express");
const router = express.Router();
const Issue = require("../models/Issue");
const upload = require("../middleware/upload");

// ✅ SOCKET MANAGER (FIXED)
const socket = require("../socket");

/*
================================
CREATE ISSUE
POST /api/issues
================================
*/
router.post("/", async (req, res) => {
  try {
    const { title, description, category, lat, lng } = req.body;

    if (!title || !description || !category || !lat || !lng) {
      return res.status(400).json({
        msg: "All fields including location are required"
      });
    }

    const issue = new Issue({
      title,
      description,
      category,
      location: {
        lat,
        lng
      },
      reportedBy: req.user.userId
    });

    await issue.save();

    res.status(201).json({
      msg: "Issue reported successfully",
      issue
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

/*
================================
UPLOAD ISSUE IMAGE
POST /api/issues/:id/image
================================
*/
router.post("/:id/image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No image uploaded" });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ msg: "Issue not found" });
    }

    issue.image = req.file.filename;
    await issue.save();

    res.json({
      msg: "Image uploaded successfully",
      image: issue.image
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

/*
================================
GET ALL ISSUES
GET /api/issues
================================
*/
router.get("/", async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(issues);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

/*
================================
GET MY ISSUES
GET /api/issues/my
================================
*/
router.get("/my", async (req, res) => {
  try {
    const issues = await Issue.find({
      reportedBy: req.user.userId
    }).sort({ createdAt: -1 });

    res.json(issues);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

/*
================================
UPDATE ISSUE STATUS (ADMIN)
PUT /api/issues/:id/status
================================
*/
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ msg: "Status is required" });
    }

    if (!["pending", "in-progress", "resolved"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!issue) {
      return res.status(404).json({ msg: "Issue not found" });
    }

    // ✅ REAL-TIME EVENT
    const io = socket.getIO();
    io.emit("issueUpdated", issue);

    res.json({
      msg: "Status updated successfully",
      issue
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
