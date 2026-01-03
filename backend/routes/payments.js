const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");

const Course = require("../models/Course");
const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const Payment = require("../models/Payment"); // ✅ ADDED
const { protect } = require("../middleware/auth");

const { createClerkClient } = require("@clerk/clerk-sdk-node");

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ======================
   CREATE ORDER
====================== */
router.post("/create-order", protect, async (req, res) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(Number(course.price) * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    res.json({ orderId: order.id, amount: order.amount });
  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);
    res.status(500).json({ message: "Order creation failed" });
  }
});

/* ======================
   VERIFY PAYMENT + ENROLL
====================== */
router.post("/verify", protect, async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    courseId,
  } = req.body;

  try {
    // 🔐 Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    // 📘 Find course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // 👤 Find or auto-sync student
    let student = await User.findOne({ clerkId: req.user.id });

    if (!student) {
      const clerkUser = await clerkClient.users.getUser(req.user.id);

      student = await User.create({
        clerkId: req.user.id,
        name: clerkUser.fullName || "User",
        email: clerkUser.emailAddresses[0].emailAddress,
        role: "student",
      });
    }

    // ✅ CREATE / ENSURE ENROLLMENT
    await Enrollment.findOneAndUpdate(
      { userId: student._id, courseId: course._id },
      { userId: student._id, courseId: course._id },
      { upsert: true, new: true }
    );

    // ✅ STORE PAYMENT RECORD (CRITICAL FIX)
    await Payment.create({
      userId: student._id,
      courseId: course._id,
      instructorId: course.instructorId,
      amount: Number(course.price),
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    // 💰 Credit instructor (kept as-is)
    const instructor = await User.findOne({
      clerkId: course.instructorId,
    });

    if (instructor) {
      instructor.earnings =
        (instructor.earnings || 0) + Number(course.price);
      await instructor.save();
    }

    res.json({ message: "Payment verified & enrolled successfully" });
  } catch (err) {
    console.error("PAYMENT VERIFY ERROR:", err);
    res.status(500).json({ message: "Enrollment failed" });
  }
});

module.exports = router;
