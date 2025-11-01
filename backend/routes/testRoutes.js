 const express = require("express");
const router = express.Router();

// In-memory store
let tests = [];        // { id, title, questions: [ { question, options, correctAnswer } ] }
let results = [];      // { testId, studentName, score, total, timestamp }
let testStudents = {}; // { testId: [ { studentName, joinedAt, flagged, reason, time } ] }

// -------------------------------
// CREATE TEST (Teacher)
// -------------------------------
router.post("/create", (req, res) => {
  const { title, questions } = req.body;

  if (!title?.trim() || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ message: "Title and at least one question required" });
  }

  const formattedQuestions = questions.map((q, i) => ({
    question: q.question?.trim() || `Question ${i + 1}`,
    options: q.options && q.options.length === 4 ? q.options : ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: typeof q.correctAnswer === "number" ? q.correctAnswer : 0,
  }));

  const testId = Date.now().toString();
  const newTest = { id: testId, title, questions: formattedQuestions };
  tests.push(newTest);
  testStudents[testId] = [];

  console.log("✅ Test Created:", newTest);
  return res.status(201).json({ message: "Test created successfully", testId });
});

// -------------------------------
// GET TEST DETAILS
// -------------------------------
router.get("/:id", (req, res) => {
  const test = tests.find((t) => t.id === req.params.id);
  if (!test) return res.status(404).json({ message: "Test not found" });
  return res.json(test);
});

// -------------------------------
// STUDENT JOINS TEST
// -------------------------------
router.post("/:id/join", (req, res) => {
  const { studentName } = req.body;
  const id = req.params.id;

  if (!studentName?.trim()) {
    return res.status(400).json({ message: "Student name required" });
  }

  if (!testStudents[id]) testStudents[id] = [];

  const joinedAt = new Date().toISOString();
  const existing = testStudents[id].find((s) => s.studentName === studentName);

  if (existing) {
    existing.joinedAt = joinedAt;
    existing.flagged = false;
    existing.reason = "";
    existing.time = "";
  } else {
    testStudents[id].push({ studentName, joinedAt, flagged: false, reason: "", time: "" });
  }

  console.log(`👨‍🎓 ${studentName} joined test ${id} at ${joinedAt}`);
  return res.json({ message: "Joined test", studentName, joinedAt });
});

// -------------------------------
// FLAG STUDENT
// -------------------------------
router.post("/:id/flag", (req, res) => {
  const { studentName, reason } = req.body;
  const id = req.params.id;

  if (!studentName?.trim()) return res.status(400).json({ message: "studentName required" });
  if (!testStudents[id]) testStudents[id] = [];

  const student = testStudents[id].find((s) => s.studentName === studentName);
  const time = new Date().toISOString();

  if (student) {
    student.flagged = true;
    student.reason = reason || "Suspicious activity";
    student.time = time;
  } else {
    testStudents[id].push({
      studentName,
      joinedAt: time,
      flagged: true,
      reason: reason || "Suspicious activity",
      time,
    });
  }

  console.log(`⚠️ Flagged: ${studentName} on test ${id} | Reason: ${reason}`);
  return res.json({ message: "Flag recorded" });
});

// -------------------------------
// SUBMIT TEST
// -------------------------------
router.post("/:id/submit", (req, res) => {
  const { studentName, answers } = req.body;
  const id = req.params.id;
  const test = tests.find((t) => t.id === id);

  if (!test) return res.status(404).json({ message: "Test not found" });
  if (!Array.isArray(answers)) return res.status(400).json({ message: "Answers must be array" });

  let score = 0;
  test.questions.forEach((q, idx) => {
    if (q.correctAnswer === answers[idx]) score++;
  });

  const result = {
    testId: id,
    studentName: studentName?.trim() || "Anonymous",
    score,
    total: test.questions.length,
    timestamp: new Date().toISOString(),
  };

  results.push(result);
  console.log("📩 Result Submitted:", result);
  return res.json({ message: "Submitted successfully", score, total: test.questions.length });
});

// -------------------------------
// VIEW RESULTS
// -------------------------------
router.get("/:id/results", (req, res) => {
  const id = req.params.id;
  const testResults = results.filter((r) => r.testId === id);
  return res.json(testResults);
});

// -------------------------------
// MONITOR FLAGS
// -------------------------------
router.get("/:id/students", (req, res) => {
  const id = req.params.id;
  return res.json(testStudents[id] || []);
});

module.exports = router;
