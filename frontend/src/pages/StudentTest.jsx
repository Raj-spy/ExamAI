 import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function StudentTest() {
  const { testId } = useParams();

  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState(null);
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [joined, setJoined] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  const studentNameRef = useRef("");
  studentNameRef.current = studentName;

  // FETCH TEST DETAILS
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const { data, error } = await supabase
          .from("tests")
          .select("*")
          .eq("id", testId)
          .single();

        if (error || !data) {
          console.error("❌ Test fetch error:", error);
          alert("Test not found or expired.");
          return;
        }

        // Parse JSON if stored as string
        const questions = Array.isArray(data.questions)
          ? data.questions
          : JSON.parse(data.questions || "[]");

        setTest({ ...data, questions });
        setAnswers(new Array(questions.length).fill(null));
      } catch (err) {
        console.error("❌ Fetch exception:", err);
        alert("Test not found or expired.");
      }
    };

    fetchTest();
  }, [testId]);

  // JOIN TEST
   // JOIN TEST
const joinTest = async () => {
  if (!studentName.trim()) return alert("Please enter your name first!");

  try {
    // 1️⃣ Add student record
    const { data, error } = await supabase
      .from("students")
      .insert([{ student_name: studentName, test_id: testId, current_test_id: testId }]) // added current_test_id
      .select();

    if (error) {
      console.error("Join test error:", error);
      alert("Could not join test. Please try again.");
      return;
    }

    console.log("Student joined:", data);

    // 2️⃣ Store info locally
    setStudentId(data[0].id);
    localStorage.setItem("student_id", data[0].id);
    localStorage.setItem("student_name", studentName);
    localStorage.setItem("test_id", testId);

    // 3️⃣ Realtime visible to teacher
    await supabase
      .from("students")
      .update({ current_test_id: testId })
      .eq("id", data[0].id);

    setJoined(true);
    alert("✅ Joined test successfully!");
  } catch (err) {
    console.error("Unexpected error while joining test:", err);
    alert("Something went wrong while joining the test.");
  }
};


  // FLAGGING BEHAVIOUR
  const sendFlag = async (reason) => {
    try {
      await supabase.from("flags").insert([
        {
          test_id: testId,
          student_name: studentNameRef.current || "Anonymous",
          reason,
          created_at: new Date().toISOString(),
        },
      ]);
      console.log("🚨 Flag sent:", reason);
    } catch (err) {
      console.error("Flag send error:", err);
    }
  };

  // MONITORING LOGIC
  useEffect(() => {
    if (!joined) return;

    const handleBlur = () => sendFlag("Switched tab or lost window focus");
    const handleVisibility = () => {
      if (document.hidden) sendFlag("Tab switched or minimized");
    };
    const handleBeforeUnload = () => sendFlag("Tried to reload or close the page");

    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [joined]);

  // HANDLE ANSWERS
  const handleAnswer = (index, value) => {
    const copy = [...answers];
    copy[index] = value;
    setAnswers(copy);
  };

  // SUBMIT TEST
  const submitTest = async () => {
    if (!joined) return alert("Please start the test first!");
    if (answers.includes(null) && !window.confirm("Some questions are unanswered. Submit anyway?"))
      return;

    try {
      const correctCount = test.questions.filter(
        (q, i) => q.correctAnswer === answers[i]
      ).length;

      const currStudentId = studentId || localStorage.getItem("student_id");

      const { error } = await supabase.from("results").insert([
        {
          student_id: currStudentId,
          test_id: testId,
          score: correctCount,
          total: test.questions.length,
        },
      ]);

      if (error) throw error;

      setScore(correctCount);
      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting test:", err);
      alert("Error submitting test.");
    }
  };

  // RENDER
  if (!test) return <p className="p-8">Loading test...</p>;

  if (!joined) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">{test.title}</h1>
        <label className="block mb-1 text-gray-700">Enter your name:</label>
        <input
          type="text"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          className="border p-2 w-full mb-4 rounded"
          placeholder="Your full name"
        />
        <button
          onClick={joinTest}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          ✅ Start Test
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{test.title}</h1>
      <p className="mb-4 text-gray-600">
        Student: <strong>{studentName}</strong>
      </p>

      {test.questions.map((q, idx) => (
        <div key={idx} className="border p-4 mb-4 rounded">
          <p className="font-medium mb-2">
            {idx + 1}. {q.question}
          </p>
          {q.options.map((opt, i) => (
            <label key={i} className="block cursor-pointer mb-1">
              <input
                type="radio"
                name={`q-${idx}`}
                checked={answers[idx] === i}
                onChange={() => handleAnswer(idx, i)}
                disabled={submitted}
              />
              <span className="ml-2">{opt}</span>
            </label>
          ))}
        </div>
      ))}

      {!submitted ? (
        <button
          onClick={submitTest}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          🚀 Submit Test
        </button>
      ) : (
        <div className="mt-6 p-4 bg-blue-50 border rounded">
          <h2 className="text-lg font-semibold">✅ Test Submitted</h2>
          <p>
            Your Score:{" "}
            <strong>
              {score} / {test.questions.length}
            </strong>
          </p>
        </div>
      )}
    </div>
  );
}
