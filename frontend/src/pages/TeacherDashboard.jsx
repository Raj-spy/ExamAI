 import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function TeacherDashboard() {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [testId, setTestId] = useState("");
  const [testLink, setTestLink] = useState("");
  const [joinedStudents, setJoinedStudents] = useState([]);
  const [aiTopic, setAiTopic] = useState("");
  const [aiQuestionCount, setAiQuestionCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const checkLogin = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) navigate("/teacher-auth");
    };
    checkLogin();
  }, [navigate]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("teacherDashboard"));
    if (saved) {
      setTitle(saved.title || "");
      setQuestions(saved.questions || []);
      setTestId(saved.testId || "");
      setTestLink(saved.testLink || "");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "teacherDashboard",
      JSON.stringify({ title, questions, testId, testLink })
    );
  }, [title, questions, testId, testLink]);

  useEffect(() => {
    if (!testId) return;
    const fetchStudents = async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("test_id", testId);

      if (!error && data) {
        setJoinedStudents(data);
      }
    };

    fetchStudents();

    const channel = supabase
      .channel("students-join")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "students" },
        (payload) => {
          if (payload.new.test_id === testId) {
            setJoinedStudents((prev) => [...prev, payload.new]);
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [testId]);

  // AI Generate Questions calling your backend server endpoint securely
  const generateQuestionsWithAI = async () => {
    if (!aiTopic.trim()) {
      alert("Please enter a topic for AI generation.");
      return;
    }
    setIsGenerating(true);
    try {
       const response = await axios.post("http://localhost:5000/api/generate-ai-questions", {
  topic: aiTopic,
  count: aiQuestionCount,  // <-- comma here
});  // <-- semicolon here

const aiText = response.data.choices[0].message.content;  // <-- semicolon here
const generatedQuestions = parseAiQuestions(aiText);
setQuestions(generatedQuestions);
alert("✅ AI-generated questions added!");

    } catch (error) {
      console.error("Error generating questions:", error);
      alert("Failed to generate questions. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Parse AI-generated questions from backend response text
  const parseAiQuestions = (text) => {
    const lines = text.split("\n");
    const questions = [];
    let currentQuestion = null;
    let options = [];
    let correctOption = null;

    lines.forEach((line) => {
      if (line.startsWith("Question:")) {
        if (currentQuestion) {
          questions.push({
            question: currentQuestion,
            options,
            correctAnswer: correctOption,
          });
        }
        currentQuestion = line.replace("Question: ", "").trim();
        options = [];
        correctOption = null;
      } else if (line.match(/^[A-D]\)/)) {
        const isCorrect = line.includes("(Correct)");
        const option = line.replace("(Correct)", "").trim();
        options.push(option);
        if (isCorrect) {
          correctOption = options.length - 1;
        }
      }
    });

    if (currentQuestion) {
      questions.push({
        question: currentQuestion,
        options,
        correctAnswer: correctOption,
      });
    }

    return questions;
  };

  // Question editing helpers
  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: ["", "", "", ""], correctAnswer: null },
    ]);
  };

  const updateQuestion = (index, key, value) => {
    const updated = [...questions];
    updated[index][key] = value;
    setQuestions(updated);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const deleteQuestion = (index) => {
    if (window.confirm("Delete this question?")) {
      const updated = questions.filter((_, i) => i !== index);
      setQuestions(updated);
    }
  };

  // Validation before creating test
  const validateTest = () => {
    if (!title.trim()) {
      alert("Please enter a test title!");
      return false;
    }
    if (questions.length === 0) {
      alert("Add at least one question before creating a test!");
      return false;
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        alert(`Question ${i + 1} is blank!`);
        return false;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          alert(`Option ${j + 1} in Question ${i + 1} is blank!`);
          return false;
        }
      }
      if (q.correctAnswer === null) {
        alert(`Please select a correct answer for Question ${i + 1}!`);
        return false;
      }
    }
    return true;
  };

  // Create test in Supabase
  const createTest = async () => {
    if (!validateTest()) return;
    const { data, error } = await supabase.from("tests").insert([{ title, questions }]).select();
    if (error) {
      alert("Failed to create test. Try again.");
      return;
    }
    const id = data[0].id;
    setTestId(id);
    setTestLink(`${window.location.origin}/student/${id}`);
    alert("✅ Test created successfully!");
  };

  // Reset everything
  const resetTest = () => {
    if (window.confirm("Are you sure you want to reset and start a new test?")) {
      localStorage.removeItem("teacherDashboard");
      setTitle("");
      setQuestions([]);
      setTestId("");
      setTestLink("");
      setJoinedStudents([]);
      alert("🧹 Test reset successfully!");
    }
  };

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("teacherDashboard");
    alert("Logged out successfully!");
    navigate("/teacher-auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 md:px-0">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 tracking-tight">👩‍🏫 Teacher Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg shadow-lg transition-all duration-150"
          >
            🚪 Logout
          </button>
        </div>

        {/* AI Test Generator */}
        <section className="bg-white border border-blue-100 rounded-2xl shadow-lg p-8 mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-3">🤖 AI Test Generator</h2>
          <div className="mb-6">
            <label className="block mb-2 text-gray-700 font-medium">Topic</label>
            <input
              type="text"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              className="border border-gray-300 p-3 w-full rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter topic for AI test generation..."
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 text-gray-700 font-medium">Number of Questions</label>
            <input
              type="number"
              value={aiQuestionCount}
              onChange={(e) => setAiQuestionCount(e.target.value)}
              min="1"
              max="20"
              className="border border-gray-300 p-3 w-full rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={generateQuestionsWithAI}
            disabled={isGenerating}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg shadow transition-all duration-200"
          >
            {isGenerating ? "Generating..." : "Generate Test with AI"}
          </button>
        </section>

        {/* Test Creator */}
        <section className="bg-white border border-blue-100 rounded-2xl shadow-lg p-8 mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-3">🧾 Create New Test</h2>
          <div className="mb-8">
            <label className="block mb-2 text-gray-700 font-medium">Test Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border border-gray-300 p-3 w-full rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter test title..."
            />
          </div>

          {questions.map((q, qIndex) => (
            <article key={qIndex} className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6 shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">Question {qIndex + 1}</h3>
                <button
                  onClick={() => deleteQuestion(qIndex)}
                  className="text-red-500 hover:text-red-700 text-base font-medium"
                >
                  ❌ Delete
                </button>
              </div>
              <input
                type="text"
                value={q.question}
                onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                className="border border-gray-300 p-3 w-full rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter question..."
              />
              <div className="grid md:grid-cols-2 gap-4 mb-2">
                {q.options.map((opt, oIndex) => (
                  <label key={oIndex} className="flex items-center bg-white border border-gray-200 rounded-lg p-3 gap-2 hover:bg-blue-50 transition">
                    <input
                      type="radio"
                      name={`correct-${qIndex}`}
                      checked={q.correctAnswer === oIndex}
                      onChange={() => updateQuestion(qIndex, "correctAnswer", oIndex)}
                      className="accent-blue-600"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                      className="w-full bg-transparent outline-none text-gray-700 text-base"
                      placeholder={`Option ${oIndex + 1}`}
                    />
                  </label>
                ))}
              </div>
            </article>
          ))}

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={addQuestion}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow transition-all duration-200"
            >
              ➕ Add Question
            </button>
            <button
              onClick={createTest}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow transition-all duration-200"
            >
              🚀 Create Test
            </button>
            {testLink && (
              <button
                onClick={resetTest}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-all duration-200 shadow"
              >
                🧹 Reset Test
              </button>
            )}
          </div>
        </section>

        {testLink && (
          <section className="bg-green-50 border border-green-200 rounded-xl p-7 mb-10 shadow">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <p className="font-semibold text-green-700 mb-2">✅ Test Created!</p>
                <p className="text-gray-700 mb-2">Share this test link:</p>
                <a href={testLink} target="_blank" rel="noreferrer" className="text-blue-600 underline break-all font-medium">
                  {testLink}
                </a>
              </div>
              <div className="mt-4 md:mt-0">
                <button
                  onClick={() => navigate(`/results/${testId}`)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg shadow transition-all duration-200"
                >
                  📊 View Results
                </button>
              </div>
            </div>
          </section>
        )}

        {joinedStudents.length > 0 && (
          <section className="bg-blue-50 border border-blue-200 rounded-xl p-7 shadow">
            <h2 className="text-lg font-bold text-gray-800 mb-4">👩‍🎓 Students Joined ({joinedStudents.length})</h2>
            <ul className="divide-y divide-gray-200">
              {joinedStudents.map((s) => (
                <li key={s.id} className="py-2 text-gray-700 flex justify-between items-center">
                  <span>{s.student_name || "Unnamed Student"}</span>
                  <span className="text-gray-500 text-sm">• ID: {s.id}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
