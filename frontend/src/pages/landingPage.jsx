import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* ---------- NAVBAR ---------- */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-blue-700">ExamAI</h1>
        <button
          onClick={() => navigate("/teacher-auth")}
          className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Login / Signup
        </button>
      </nav>

      {/* ---------- HERO SECTION ---------- */}
      <main className="flex flex-col items-center justify-center flex-grow text-center px-6">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-4 leading-snug">
          Simplify Online Tests <br /> with Smart AI Tools
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mb-8">
          Create, monitor, and analyze student tests in real-time.
          AI-assisted questions, cheating detection, and performance feedback — all in one place.
        </p>

        <button
          onClick={() => navigate("/teacher-auth")}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105"
        >
          🚀 Let’s Get Started
        </button>
      </main>

      {/* ---------- FEATURES SECTION ---------- */}
      <section className="py-16 bg-white text-center">
        <h3 className="text-3xl font-bold text-gray-800 mb-10">
          Why Choose ExamAI?
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto px-6">
          <div className="p-6 bg-blue-50 rounded-xl shadow-sm hover:shadow-md transition">
            <h4 className="text-xl font-semibold text-blue-700 mb-2">🧠 AI-Powered Tests</h4>
            <p className="text-gray-600">
              Automatically generate and evaluate questions using smart algorithms.
            </p>
          </div>

          <div className="p-6 bg-blue-50 rounded-xl shadow-sm hover:shadow-md transition">
            <h4 className="text-xl font-semibold text-blue-700 mb-2">📊 Real-Time Results</h4>
            <p className="text-gray-600">
              Instantly view and track each student’s performance as they submit their tests.
            </p>
          </div>

          <div className="p-6 bg-blue-50 rounded-xl shadow-sm hover:shadow-md transition">
            <h4 className="text-xl font-semibold text-blue-700 mb-2">🎥 Anti-Cheat Monitoring</h4>
            <p className="text-gray-600">
              Use AI and webcam detection to ensure a fair and secure test environment.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="bg-blue-600 text-white py-4 text-center mt-auto">
        <p className="text-sm">
          © {new Date().getFullYear()} ExamAI — Built for Teachers, Powered by Intelligence ⚡
        </p>
      </footer>
    </div>
  );
}
