 // frontend/src/pages/ResultsPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function ResultsPage() {
  const { testId } = useParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchResults = async () => {
    const cleanId = testId?.trim();
    console.log("🟢 Fetching results for testId:", cleanId, "typeof:", typeof cleanId);

    try {
      // ✅ Step 1: Query results
      const { data: rawResults, error: rawError } = await supabase
        .from("results")
        .select("*")
        .eq("test_id", cleanId);

      if (rawError) {
        console.error("❌ Supabase error:", rawError.message);
        setResults([]);
        return;
      }

      console.log("📦 Raw results:", rawResults);

      if (!rawResults || rawResults.length === 0) {
        console.warn("⚠️ No matching rows found for this testId");
        setResults([]);
        return;
      }

      // ✅ Step 2: Fetch student names for matched student_ids
      const studentIds = rawResults.map((r) => r.student_id);
      const { data: studentsData, error: studentsError } = await supabase
        .from("students")
        .select("id, student_name")
        .in("id", studentIds);

      if (studentsError) {
        console.error("⚠️ Students fetch error:", studentsError.message);
      }

      // ✅ Step 3: Merge student names with results
      const mergedResults = rawResults.map((r) => ({
        ...r,
        student_name:
          studentsData?.find((s) => s.id === r.student_id)?.student_name ||
          "Unknown",
      }));

      console.log("✅ Final merged results:", mergedResults);
      setResults(mergedResults);
    } catch (err) {
      console.error("🔥 Unexpected fetch error:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (testId) fetchResults();
  }, [testId]);

  if (loading)
    return (
      <div className="p-10 text-center text-gray-600 text-lg">
        Loading results...
      </div>
    );

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">
        📈 Test Results
      </h1>

      {results.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">
          No results found yet.
        </p>
      ) : (
        <table className="w-full border-collapse border border-gray-300 shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">Student Name</th>
              <th className="border border-gray-300 px-4 py-2">Score</th>
              <th className="border border-gray-300 px-4 py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">
                  {r.student_name}
                </td>
                <td className="border border-gray-300 px-4 py-2 font-semibold">
                  {r.score}
                </td>
                <td className="border border-gray-300 px-4 py-2">{r.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="text-center mt-6">
        <a
          href="/"
          className="text-blue-600 underline hover:text-blue-800 text-sm"
        >
          ← Back to Teacher Dashboard
        </a>
      </div>
    </div>
  );
}
