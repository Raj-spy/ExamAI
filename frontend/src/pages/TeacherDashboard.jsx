 import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function TeacherDashboard() {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [testId, setTestId] = useState("");
  const [testLink, setTestLink] = useState("");
  const [joinedStudents, setJoinedStudents] = useState([]);

  // 🔹 Restore data from localStorage on load
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("teacherDashboard"));
    if (saved) {
      setTitle(saved.title || "");
      setQuestions(saved.questions || []);
      setTestId(saved.testId || "");
      setTestLink(saved.testLink || "");
    }
  }, []);

  // 🔹 Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(
      "teacherDashboard",
      JSON.stringify({ title, questions, testId, testLink })
    );
  }, [title, questions, testId, testLink]);

  // 🔹 Fetch joined students from Supabase
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

    // Realtime listener for new student joins
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

  // ➕ Add new question
  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: ["", "", "", ""], correctAnswer: null },
    ]);
  };

  // ✏️ Update question or option
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

  // ❌ Delete question
  const deleteQuestion = (index) => {
    if (window.confirm("Delete this question?")) {
      const updated = questions.filter((_, i) => i !== index);
      setQuestions(updated);
    }
  };

  // ✅ Validation before creating test
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

  // 🚀 Create Test
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
  };

  // 🔄 Reset everything
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

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
        👩‍🏫 Teacher Dashboard
      </h1>

      {/* ---------------- CREATE TEST ---------------- */}
      <div className="border p-4 rounded-lg shadow-sm mb-6 bg-white">
        <label className="block mb-2 font-semibold text-gray-700">
          Test Title:
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 w-full rounded mb-4"
          placeholder="Enter test title"
        />

        {/* ---------------- QUESTIONS ---------------- */}
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="border p-4 mb-4 rounded-lg bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <label className="font-semibold">
                Question {qIndex + 1}
              </label>
              <button
                onClick={() => deleteQuestion(qIndex)}
                className="text-red-600 hover:underline text-sm"
              >
                ❌ Delete
              </button>
            </div>

            <input
              type="text"
              value={q.question}
              onChange={(e) =>
                updateQuestion(qIndex, "question", e.target.value)
              }
              className="border p-2 w-full rounded mb-3"
              placeholder="Enter question"
            />

            {q.options.map((opt, oIndex) => (
              <div key={oIndex} className="flex items-center mb-2">
                <input
                  type="radio"
                  name={`correct-${qIndex}`}
                  checked={q.correctAnswer === oIndex}
                  onChange={() =>
                    updateQuestion(qIndex, "correctAnswer", oIndex)
                  }
                />
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                  className="border p-2 rounded w-full ml-2"
                  placeholder={`Option ${oIndex + 1}`}
                />
              </div>
            ))}
          </div>
        ))}

        <button
          onClick={addQuestion}
          className="bg-blue-600 text-white px-4 py-2 rounded mr-3"
        >
          ➕ Add Question
        </button>

        <button
          onClick={createTest}
          className="bg-green-600 text-white px-4 py-2 rounded mr-3"
        >
          🚀 Create Test
        </button>

        {testLink && (
          <button
            onClick={resetTest}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            🧹 Reset Test
          </button>
        )}
      </div>

      {/* ---------------- TEST LINK ---------------- */}
      {testLink && (
        <div className="p-4 bg-green-50 border rounded mb-6">
          <p>
            <strong>Share Test Link:</strong>
          </p>
          <a
            href={testLink}
            className="text-blue-600 underline break-all"
            target="_blank"
            rel="noreferrer"
          >
            {testLink}
          </a>

          <div className="mt-4 flex gap-3">
            <a
              href={`/results/${testId}`}
              className="bg-purple-600 text-white px-4 py-2 rounded"
            >
              📊 View Results
            </a>
          </div>
        </div>
      )}

      {/* ---------------- STUDENTS ---------------- */}
      {joinedStudents.length > 0 && (
        <div className="p-4 bg-blue-50 border rounded">
          <h2 className="text-lg font-semibold mb-3">
            👩‍🎓 Students Joined ({joinedStudents.length})
          </h2>
          <ul className="list-disc pl-5">
            {joinedStudents.map((s) => (
              <li key={s.id}>
                {s.student_name || "Unnamed Student"} –{" "}
                <span className="text-gray-500 text-sm">ID: {s.id}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
