const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Course = require("../models/Course");
const Payment = require("../models/Payment"); // ✅ ADDED
const { protect } = require("../middleware/auth");

/* =====================================================
   ADMIN GUARD (email allowlist)
===================================================== */
const ADMIN_EMAILS = [
  "razikh1811@gmail.com",
  "razikh.admin@gmail.com",
];

const adminOnly = async (req, res, next) => {
  const user = await User.findOne({ clerkId: req.user.id });
  if (!user || !ADMIN_EMAILS.includes(user.email)) {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

/* =====================================================
   ✅ ADMIN ANALYTICS (FIXED & EXTENDED)
===================================================== */
router.get("/analytics", protect, adminOnly, async (req, res) => {
  try {
    /* ===== BASIC COUNTS ===== */
    const totalUsers = await User.countDocuments();
    const students = await User.countDocuments({ role: "student" });
    const faculty = await User.countDocuments({ role: "faculty" });
    const courses = await Course.countDocuments();

    /* ===== PAYMENTS ===== */
    const payments = await Payment.find()
      .populate("courseId", "title price instructorName")
      .populate("userId", "name email");

    const totalRevenue = payments.reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0
    );

    const totalEnrollments = payments.length;

    /* ===== COURSE-WISE REVENUE ===== */
    const courseRevenueMap = {};

    payments.forEach((p) => {
      const courseId = p.courseId?._id?.toString();
      if (!courseId) return;

      if (!courseRevenueMap[courseId]) {
        courseRevenueMap[courseId] = {
          courseId,
          title: p.courseId.title,
          instructor: p.courseId.instructorName,
          price: p.courseId.price,
          enrollments: 0,
          revenue: 0,
        };
      }

      courseRevenueMap[courseId].enrollments += 1;
      courseRevenueMap[courseId].revenue += Number(p.amount || 0);
    });

    const courseRevenue = Object.values(courseRevenueMap);

    /* ===== RESPONSE ===== */
    res.json({
      users: {
        total: totalUsers,
        students,
        faculty,
      },
      courses,
      enrollments: totalEnrollments,
      revenue: totalRevenue,

      courseRevenue, // ✅ revenue per course
      recentPayments: payments.slice(-10).reverse(), // ✅ last 10 payments
    });
  } catch (err) {
    console.error("Admin analytics error:", err);
    res.status(500).json({ message: "Analytics failed" });
  }
});

module.exports = router;
