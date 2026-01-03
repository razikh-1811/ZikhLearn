const express = require("express");
const router = express.Router();
const { createClerkClient } = require("@clerk/clerk-sdk-node");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

// Initialize Clerk Admin Client
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY
});

/**
 * @route   POST /api/auth/sync-user
 * @desc    Sync Clerk user to MongoDB (called after login if needed)
 * @access  Private (Clerk)
 */
router.post("/sync-user", protect, async (req, res) => {
  try {
    const clerkId = req.user.id;

    let user = await User.findOne({ clerkId });

    if (!user) {
      user = await User.create({
        clerkId,
        name: req.user.name,
        email: req.user.email,
        role: "student" // default, will be updated later
      });
    }

    res.json({ message: "User synced", user });
  } catch (err) {
    console.error("User Sync Error:", err);
    res.status(500).json({ message: "Failed to sync user" });
  }
});

/**
 * ❌ REMOVED ROUTES
 * - /register
 * - /login
 * - JWT logic
 * - password handling
 *
 * Clerk handles authentication completely.
 */

module.exports = router;
