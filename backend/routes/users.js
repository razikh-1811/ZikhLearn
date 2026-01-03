const express = require("express");
const router = express.Router();
const { createClerkClient } = require("@clerk/clerk-sdk-node");

const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

const { protect } = require("../middleware/auth");

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

/* ================= SYNC USER ================= */
router.post("/sync-user", protect, async (req, res) => {
  try {
    const clerkId = req.user.id;

    let user = await User.findOne({ clerkId });

    if (!user) {
      const clerkUser = await clerkClient.users.getUser(clerkId);

      user = await User.create({
        clerkId,
        name: clerkUser.fullName || "User",
        email: clerkUser.emailAddresses[0].emailAddress,
        role: "student",
      });
    }

    res.json(user);
  } catch (err) {
    console.error("User sync error:", err);
    res.status(500).json({ message: "User sync failed" });
  }
});

/* ================= ADMIN: ALL USERS ================= */
router.get("/all", protect, async (req, res) => {
  const admin = await User.findOne({ clerkId: req.user.id, role: "admin" });
  if (!admin) return res.status(403).json({ message: "Admin only" });

  const users = await User.find();
  res.json(users);
});

/* ================= ADMIN: CHANGE ROLE ================= */
router.put("/admin/change-role/:userId", protect, async (req, res) => {
  const admin = await User.findOne({ clerkId: req.user.id, role: "admin" });
  if (!admin) return res.status(403).json({ message: "Admin only" });

  const { role } = req.body;
  if (!["student", "faculty"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const user = await User.findByIdAndUpdate(
    req.params.userId,
    { role },
    { new: true }
  );

  res.json({ success: true, user });
});

/* ================= ADMIN: BLOCK / UNBLOCK ================= */
router.put("/admin/block/:userId", protect, async (req, res) => {
  const admin = await User.findOne({ clerkId: req.user.id, role: "admin" });
  if (!admin) return res.status(403).json({ message: "Admin only" });

  const user = await User.findById(req.params.userId);
  user.isBlocked = !user.isBlocked;
  await user.save();

  res.json({ success: true, blocked: user.isBlocked });
});

/* ================= ADMIN: DELETE COURSE ================= */
router.delete("/admin/:id", protect, async (req, res) => {
  const admin = await User.findOne({ clerkId: req.user.id, role: "admin" });
  if (!admin) return res.status(403).json({ message: "Admin only" });

  await Course.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

/* ================= PROFILE STATUS (ONLY FIX HERE) ================= */
router.get("/profile-status", protect, async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.user.id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ FIX: read enrollments from Enrollment collection
    const enrollments = await Enrollment.find({ userId: user._id });

    res.json({
      role: user.role,
      enrolledCourses: enrollments.map(e => e.courseId.toString()),
    });
  } catch (error) {
    console.error("Profile status error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= ADMIN ANALYTICS ================= */
router.get("/admin/analytics", protect, async (req, res) => {
  try {
    const admin = await User.findOne({
      clerkId: req.user.id,
      role: "admin",
    });

    if (!admin) {
      return res.status(403).json({ message: "Admin only" });
    }

    const totalUsers = await User.countDocuments();
    const students = await User.countDocuments({ role: "student" });
    const faculty = await User.countDocuments({ role: "faculty" });

    const courses = await Course.find();

    let enrollments = 0;
    let revenue = 0;

    const topCourses = courses.map((course) => {
      const studentsCount = course.enrolledStudents?.length || 0;
      const courseRevenue = studentsCount * Number(course.price || 0);

      enrollments += studentsCount;
      revenue += courseRevenue;

      return {
        title: course.title,
        students: studentsCount,
        revenue: courseRevenue,
      };
    });

    topCourses.sort((a, b) => b.students - a.students);

    res.json({
      users: {
        total: totalUsers,
        students,
        faculty,
      },
      courses: courses.length,
      enrollments,
      revenue,
      topCourses: topCourses.slice(0, 5),
    });
  } catch (err) {
    console.error("Admin analytics error:", err);
    res.status(500).json({ message: "Analytics failed" });
  }
});

module.exports = router;
