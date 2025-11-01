// models/Result.js
import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
  testId: String,
  studentName: String,
  answers: [Number],  // index-wise student answers
  score: Number,
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Result", resultSchema);
