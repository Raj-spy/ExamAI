 const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
  testId: String,
  questions: Array,
  students: [
    {
      name: String,
      score: Number,
      redFlag: { type: Boolean, default: false },
    },
  ],
});

module.exports = mongoose.model("Test", testSchema);
