 import React from "react";

export default function ResultsDashboard() {
  const tests = JSON.parse(localStorage.getItem("tests")) || [];
  const answers = JSON.parse(localStorage.getItem("studentAnswers")) || {};
  const score = tests.filter((q) => answers[q.id] === q.correct).length;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">📊 Results Dashboard</h2>
      <p>Total Questions: {tests.length}</p>
      <p>Correct Answers: {score}</p>
      <p>Score: {((score / tests.length) * 100 || 0).toFixed(0)}%</p>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Answer Breakdown:</h3>
        {tests.map((q, i) => (
          <div key={q.id} className="border-b py-2">
            <p>
              {i + 1}. {q.question}
            </p>
            <p>
              🧍‍♂️ Student:{" "}
              <b
                className={
                  answers[q.id] === q.correct ? "text-green-600" : "text-red-500"
                }
              >
                {answers[q.id] || "No Answer"}
              </b>
            </p>
            <p>✅ Correct: {q.correct}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
