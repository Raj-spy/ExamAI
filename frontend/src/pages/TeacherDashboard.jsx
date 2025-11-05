 import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function TeacherDashboard() {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [testId, setTestId] = useState("");
  const [testLink, setTestLink] = useState("");
  const [joinedStudents, setJoinedStudents] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [activeTab, setActiveTab] = useState("create");

  const navigate = useNavigate();

  // ✅ Check login session
  useEffect(() => {
    const checkLogin = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) navigate("/teacher-auth");
    };
    checkLogin();
  }, [navigate]);

  // ✅ Restore saved data
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("teacherDashboard"));
    if (saved) {
      setTitle(saved.title || "");
      setQuestions(saved.questions || []);
      setTestId(saved.testId || "");
      setTestLink(saved.testLink || "");
    }
  }, []);

  // lll
  // Add inside useEffect in TeacherDashboard
const [questionStats, setQuestionStats] = useState({});

useEffect(() => {
  if (!testId) return;

  const fetchQuestionStats = async () => {
    const { data, error } = await supabase
      .from("question_responses")
      .select("question_index, is_correct")
      .eq("test_id", testId);

    if (error) return;
    // Aggregate stats
    const stats = {};
    data.forEach(({ question_index, is_correct }) => {
      if (!stats[question_index]) stats[question_index] = { total: 0, wrong: 0 };
      stats[question_index].total += 1;
      if (!is_correct) stats[question_index].wrong += 1;
    });
    setQuestionStats(stats);
  };
  fetchQuestionStats();
}, [testId]);


  // ✅ Persist data
  useEffect(() => {
    localStorage.setItem(
      "teacherDashboard",
      JSON.stringify({ title, questions, testId, testLink })
    );
  }, [title, questions, testId, testLink]);

  // ✅ Fetch students & results
  useEffect(() => {
    if (!testId) return;

    async function fetchStudents() {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("test_id", testId);
      if (!error && data) setJoinedStudents(data);
    }

    async function fetchResults() {
      const { data, error } = await supabase
        .from("results")
        .select("*")
        .eq("test_id", testId);
      if (!error && data) setTestResults(data);
    }

    fetchStudents();
    fetchResults();

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

  // ✅ Add question
  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { question: "", options: ["", "", "", ""], correctAnswer: null },
    ]);
  };

  // ✅ Update question text or correct answer
  const updateQuestion = (index, key, value) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };

  // ✅ Update option
  const updateOption = (qIndex, oIndex, value) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIndex] = {
        ...updated[qIndex],
        options: updated[qIndex].options.map((opt, i) =>
          i === oIndex ? value : opt
        ),
      };
      return updated;
    });
  };

  // ✅ Fixed Delete Question (fully functional now)
  const deleteQuestion = (index) => {
    if (window.confirm("🗑️ Delete this question?")) {
      setQuestions((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // ✅ Validate before creating test
  const validateTest = () => {
    if (!title.trim()) {
      alert("Please enter a test title!");
      return false;
    }
    if (questions.length === 0) {
      alert("Add at least one question before creating a test!");
      return false;
    }
    for (let q of questions) {
      if (!q.question.trim()) {
        alert("Some question is blank!");
        return false;
      }
      if (q.options.some((opt) => !opt.trim())) {
        alert("Some option is blank!");
        return false;
      }
      if (q.correctAnswer === null) {
        alert("Please select correct answer for all questions!");
        return false;
      }
    }
    return true;
  };

  // ✅ Create Test
  const createTest = async () => {
    if (!validateTest()) return;
    const { data, error } = await supabase
      .from("tests")
      .insert([{ title, questions }])
      .select();
    if (error) {
      alert("Failed to create test. Try again.");
      return;
    }
    const id = data[0].id;
    setTestId(id);
    setTestLink(`${window.location.origin}/student/${id}`);
    alert("✅ Test created successfully!");
    setActiveTab("students");
  };

  // ✅ Reset Test
  const resetTest = () => {
    if (window.confirm("Reset and start a new test?")) {
      localStorage.removeItem("teacherDashboard");
      setTitle("");
      setQuestions([]);
      setTestId("");
      setTestLink("");
      setJoinedStudents([]);
      setTestResults([]);
      alert("🧹 Test reset successfully!");
      setActiveTab("create");
    }
  };

  // ✅ Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("teacherDashboard");
    alert("Logged out successfully!");
    navigate("/teacher-auth");
  };

  // ✅ Analytics Helper
  const getAverageScoresPerTopic = () => {
    const topicSums = {};
    const topicCounts = {};
    testResults.forEach(({ topic_scores }) => {
      if (!topic_scores) return;
      Object.entries(topic_scores).forEach(([topic, score]) => {
        topicSums[topic] = (topicSums[topic] || 0) + score;
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      });
    });
    return Object.entries(topicSums).map(([topic, sum]) => ({
      topic,
      average: ((sum / topicCounts[topic]) * 100).toFixed(1),
    }));
  };

  // ✅ UI Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12">
      <div className="max-w-6xl mx-auto px-4 md:px-0">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700">
            👩‍🏫 Teacher Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg shadow"
          >
            🚪 Logout
          </button>
        </div>

        {/* Tabs */}
        <nav className="flex space-x-6 border-b border-gray-300 mb-8">
          {[
            { key: "create", label: "Create Test" },
            { key: "students", label: `Students Joined (${joinedStudents.length})` },
            { key: "analytics", label: "Analytics" },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`pb-2 font-semibold ${
                activeTab === tab.key
                  ? "border-b-4 border-blue-600 text-blue-700"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Create Test Section */}
        {activeTab === "create" && (
          <section className="bg-white border border-blue-100 rounded-2xl shadow-lg p-8 mb-10">
            <h2 className="text-xl font-semibold mb-6 border-b pb-3">🧾 Create New Test</h2>

            <label className="block mb-2 text-gray-700 font-medium">Test Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border border-gray-300 p-3 w-full rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter test title..."
            />

            {questions.map((q, idx) => (
              <article
                key={idx}
                className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6 shadow"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-800">Question {idx + 1}</h3>
                  <button
                    type="button"
                    onClick={() => deleteQuestion(idx)}
                    className="text-red-500 hover:text-red-700 font-medium"
                  >
                    ❌ Delete
                  </button>
                </div>

                <input
                  type="text"
                  value={q.question}
                  onChange={(e) =>
                    updateQuestion(idx, "question", e.target.value)
                  }
                  className="border border-gray-300 p-3 w-full rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter question..."
                />

                <div className="grid md:grid-cols-2 gap-4 mb-2">
                  {q.options.map((opt, i) => (
                    <label
                      key={i}
                      className="flex items-center bg-white border border-gray-200 rounded-lg p-3 gap-2 hover:bg-blue-50 transition"
                    >
                      <input
                        type="radio"
                        name={`correct-${idx}`}
                        checked={q.correctAnswer === i}
                        onChange={() =>
                          updateQuestion(idx, "correctAnswer", i)
                        }
                        className="accent-blue-600"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) =>
                          updateOption(idx, i, e.target.value)
                        }
                        className="w-full bg-transparent outline-none text-gray-700"
                        placeholder={`Option ${i + 1}`}
                      />
                    </label>
                  ))}
                </div>
              </article>
            ))}

            <div className="flex gap-3 mt-6">
              <button
                onClick={addQuestion}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow transition"
              >
                ➕ Add Question
              </button>
              <button
                onClick={createTest}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow transition"
              >
                🚀 Create Test
              </button>
              {testLink && (
                <button
                  onClick={resetTest}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg shadow transition"
                >
                  🧹 Reset Test
                </button>
              )}
            </div>

            {testLink && (
              <section className="bg-green-50 border border-green-200 rounded-xl p-6 mt-6 shadow">
                <p className="font-semibold text-green-700 mb-2">
                  ✅ Test Created!
                </p>
                <p className="text-gray-700 mb-2">Share this test link:</p>
                <a
                  href={testLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline break-words"
                >
                  {testLink}
                </a>
                <div className="mt-4">
                  <button
                    onClick={() => navigate(`/results/${testId}`)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg shadow transition"
                  >
                    📊 View Results
                  </button>
                </div>
              </section>
            )}
          </section>
        )}

        {/* Students Tab */}
        {activeTab === "students" && (
          <section className="bg-blue-50 border border-blue-200 rounded-xl p-7 shadow">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              👩‍🎓 Students Joined ({joinedStudents.length})
            </h2>
            <ul className="divide-y divide-gray-200">
              {joinedStudents.map(({ id, student_name }) => (
                <li
                  key={id}
                  className="py-2 text-gray-700 flex justify-between items-center"
                >
                  <span>{student_name || "Unnamed Student"}</span>
                  <span className="text-gray-500 text-sm">• ID: {id}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Analytics Tab */}
        {/* In Analytics Tab */}
<div className="mt-8">
  <h3 className="font-semibold text-gray-800 mb-3">Per-Question Weaknesses</h3>
  {questions.map((q, idx) => {
    const stats = questionStats[idx] || { total: 0, wrong: 0 };
    const percentWrong = stats.total > 0 ? ((stats.wrong / stats.total) * 100).toFixed(1) : 0;
    return (
      <div key={idx} className="mb-3">
        <span className="font-semibold">Q{idx + 1}: {q.question}</span>
        <span className="ml-3 text-red-700 font-bold">{percentWrong}% students wrong</span>
        {percentWrong > 50 && <span className="ml-2 text-yellow-600 font-semibold">← Weakness!</span>}
      </div>
    );
  })}
</div>

        {activeTab === "analytics" && (
          <section className="bg-white border border-gray-300 rounded-2xl shadow p-8">
            <h2 className="text-xl font-semibold mb-6 border-b pb-3">
              📊 Detailed Analytics
            </h2>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">
                Average Score Per Student
              </h3>
              {testResults.length === 0 && (
                <p className="text-gray-600">No results available.</p>
              )}
              {testResults.map(({ student_name, score, total }, idx) => {
                const percent = total ? ((score / total) * 100).toFixed(1) : 0;
                return (
                  <div key={idx} className="mb-4">
                    <p className="text-gray-700 font-medium">{student_name}</p>
                    <div className="w-full bg-gray-200 rounded h-4">
                      <div
                        className="bg-blue-600 h-4 rounded"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      {percent}% ({score}/{total})
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8">
              <h3 className="font-semibold text-gray-800 mb-3">
                Average Score Per Topic
              </h3>
              {(() => {
                const topics = getAverageScoresPerTopic();
                if (topics.length === 0)
                  return <p className="text-gray-600">No topic data available.</p>;
                return topics.map(({ topic, average }, idx) => (
                  <div key={idx} className="mb-4">
                    <p className="text-gray-700 font-medium capitalize">
                      {topic}
                    </p>
                    <div className="w-full bg-gray-200 rounded h-4">
                      <div
                        className="bg-green-600 h-4 rounded"
                        style={{ width: `${average}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      {average}% average score
                    </p>
                  </div>
                ));
              })()}
            </div>
          </section>
        )}
      </div>
    </div>
    
  );
}
