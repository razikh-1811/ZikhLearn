const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const { createClerkClient } = require("@clerk/clerk-sdk-node");

const Course = require("../models/Course");
const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const Payment = require("../models/Payment"); // ✅ USED
const { protect } = require("../middleware/auth");

/* =====================================================
   CLERK ADMIN CLIENT
===================================================== */
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

/* =====================================================
   ADMIN EMAILS
===================================================== */
const ADMIN_EMAILS = ["razikh1811@gmail.com"];

/* =====================================================
   MULTER CONFIG
===================================================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, "_")}`);
  },
});

const upload = multer({ storage });

const courseUploadFields = upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "files", maxCount: 50 },
]);

/* =====================================================
   ROLE SYNC
===================================================== */
router.post("/sync-role", protect, async (req, res) => {
  const { role } = req.body;

  try {
    const clerkUser = await clerkClient.users.getUser(req.user.id);
    const email = clerkUser.emailAddresses?.[0]?.emailAddress;
    const name = clerkUser.fullName || "User";

    if (!email) {
      return res.status(400).json({ message: "Email missing in Clerk" });
    }

    const finalRole = ADMIN_EMAILS.includes(email) ? "admin" : role;

    await clerkClient.users.updateUserMetadata(req.user.id, {
      publicMetadata: { role: finalRole },
    });

    const user = await User.findOneAndUpdate(
      { clerkId: req.user.id },
      { clerkId: req.user.id, name, email, role: finalRole },
      { upsert: true, new: true }
    );

    res.json({ success: true, role: user.role });
  } catch (err) {
    console.error("Role sync error:", err);
    res.status(500).json({ message: "Role sync failed" });
  }
});

/* =====================================================
   ENROLL COURSE
===================================================== */
router.post("/:id/enroll", protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const student = await User.findOne({ clerkId: req.user.id });
    if (!student) return res.status(400).json({ message: "User not synced" });

    const alreadyEnrolled = await Enrollment.findOne({
      userId: student._id,
      courseId: course._id,
    });

    if (alreadyEnrolled) {
      return res.json({ enrolled: true });
    }

    await Enrollment.create({
      userId: student._id,
      courseId: course._id,
    });

    res.json({ success: true, enrolled: true });
  } catch (err) {
    console.error("Enrollment error:", err);
    res.status(500).json({ message: "Enrollment failed" });
  }
});

/* =====================================================
   FACULTY CREATE COURSE
===================================================== */
router.post("/upload", protect, courseUploadFields, async (req, res) => {
  try {
    const faculty = await User.findOne({ clerkId: req.user.id });

    if (!faculty || faculty.role !== "faculty") {
      return res.status(403).json({ message: "Faculty only" });
    }

    const { title, description, price, category, curriculum } = req.body;

    const thumbnail = req.files?.thumbnail
      ? `/uploads/${req.files.thumbnail[0].filename}`
      : "";

    let fileIndex = 0;
    const parsedCurriculum = JSON.parse(curriculum).map((chapter) => ({
      chapterTitle: chapter.chapterTitle,
      lessons: chapter.lessons.map((lesson) => {
        if (req.files.files?.[fileIndex]) {
          const filePath = `/uploads/${req.files.files[fileIndex].filename}`;
          fileIndex++;
          return { ...lesson, contentUrl: filePath };
        }
        return lesson;
      }),
    }));

    const course = await Course.create({
      title,
      description,
      price,
      category,
      thumbnail,
      curriculum: parsedCurriculum,
      instructorId: req.user.id,
      instructorName: faculty.name,
      enrolledStudents: [],
    });

    res.status(201).json(course);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});

/* =====================================================
   FACULTY UPDATE COURSE
===================================================== */
router.put("/:id", protect, courseUploadFields, async (req, res) => {
  try {
    const faculty = await User.findOne({ clerkId: req.user.id });
    if (!faculty || faculty.role !== "faculty") {
      return res.status(403).json({ message: "Faculty only" });
    }

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.instructorId !== req.user.id) {
      return res.status(403).json({ message: "Not your course" });
    }

    const { title, description, price, category, curriculum } = req.body;

    if (title) course.title = title;
    if (description) course.description = description;
    if (price) course.price = price;
    if (category) course.category = category;

    if (req.files?.thumbnail) {
      course.thumbnail = `/uploads/${req.files.thumbnail[0].filename}`;
    }

    if (curriculum && course.enrolledStudents.length === 0) {
      course.curriculum = JSON.parse(curriculum);
    }

    await course.save();
    res.json({ success: true, message: "Course updated" });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Update failed" });
  }
});

/* =====================================================
   FACULTY DELETE COURSE
===================================================== */
router.delete("/:id", protect, async (req, res) => {
  try {
    const faculty = await User.findOne({ clerkId: req.user.id });

    if (!faculty || faculty.role !== "faculty") {
      return res.status(403).json({ message: "Faculty only" });
    }

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.instructorId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Course.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Course deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
});

/* =====================================================
   INSTRUCTOR COURSES
===================================================== */
router.get("/instructor", protect, async (req, res) => {
  const courses = await Course.find({ instructorId: req.user.id });
  res.json(courses);
});

/* =====================================================
   ✅ INSTRUCTOR ANALYTICS (EXTENDED ONLY)
===================================================== */
router.get("/instructor/stats", protect, async (req, res) => {
  try {
    const payments = await Payment.find({
      instructorId: req.user.id,
    }).populate("courseId");

    let totalRevenue = 0;
    const studentSet = new Set();
    const courseMap = {};

   payments.forEach((p) => {
  // 🔥 SAFETY CHECK (THIS IS THE FIX)
  if (!p.courseId) return;

  totalRevenue += p.amount;
  studentSet.add(p.userId.toString());

  const courseId = p.courseId._id.toString();

  if (!courseMap[courseId]) {
    courseMap[courseId] = {
      courseId,
      title: p.courseId.title,
      price: p.amount,
      students: 0,
      revenue: 0,
    };
  }

  courseMap[courseId].students += 1;
  courseMap[courseId].revenue += p.amount;
});


    res.json({
      students: studentSet.size,
      revenue: totalRevenue,
      courses: Object.values(courseMap), // ✅ NEW
    });
  } catch (err) {
    console.error("Instructor stats error:", err);
    res.status(500).json({ message: "Stats failed" });
  }
});

/* =====================================================
   STUDENT COURSES
===================================================== */
router.get("/enrolled", protect, async (req, res) => {
  const user = await User.findOne({ clerkId: req.user.id });
  if (!user) return res.json([]);

  const enrollments = await Enrollment.find({ userId: user._id }).populate(
    "courseId"
  );

  res.json(enrollments.map((e) => e.courseId));
});

/* =====================================================
   PUBLIC
===================================================== */
router.get("/", async (req, res) => {
  const courses = await Course.find();
  res.json(courses);
});

router.get("/:id", async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: "Course not found" });
  res.json(course);
});

module.exports = router;
