import React, { useState } from "react";

export default function StudentDashboard() {
  const tests = JSON.parse(localStorage.getItem("tests")) || [];
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (id, ans) => {
    setAnswers({ ...answers, [id]: ans });
  };

  const handleSubmit = () => {
    localStorage.setItem("studentAnswers", JSON.stringify(answers));
    setSubmitted(true);
  };

  if (submitted)
    return (
      <div className="text-center mt-10">
        <h2 className="text-xl font-semibold">✅ Test Submitted!</h2>
        <p>View results in the Results tab.</p>
      </div>
    );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">👨‍🎓 Student Dashboard</h2>
      {tests.length === 0 && <p>No test available yet.</p>}
      {tests.map((q, i) => (
        <div key={q.id} className="mb-6 border-b pb-2">
          <p className="font-semibold">
            {i + 1}. {q.question}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {q.options.map(
              (opt, idx) =>
                opt && (
                  <button
                    key={idx}
                    onClick={() => handleSelect(q.id, opt)}
                    className={`px-3 py-1 border rounded ${
                      answers[q.id] === opt ? "bg-blue-300" : ""
                    }`}
                  >
                    {opt}
                  </button>
                )
            )}
          </div>
        </div>
      ))}
      {tests.length > 0 && (
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Submit Test
        </button>
      )}
    </div>
  );
}
