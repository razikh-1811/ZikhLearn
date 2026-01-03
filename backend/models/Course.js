const mongoose = require("mongoose");

const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  contentUrl: { type: String, required: true },
  contentType: {
    type: String,
    enum: ["video", "pdf"],
    default: "video",
  },
});

const ChapterSchema = new mongoose.Schema({
  chapterTitle: { type: String, required: true },
  lessons: [LessonSchema],
});

const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, default: "Engineering" },
    thumbnail: String,

    instructorId: {
      type: String,
      required: true,
    },

    instructorName: String,

    curriculum: [ChapterSchema],

    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", CourseSchema);
