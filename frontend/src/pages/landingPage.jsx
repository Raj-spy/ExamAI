 import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="font-inter bg-[#F7F8FA] min-h-screen flex flex-col">
      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-10 py-6 bg-white shadow-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-extrabold text-blue-700 tracking-tight select-none">
            Exam<span className="text-blue-500">AI</span>
          </span>
        </div>
        <button
          onClick={() => navigate("/teacher-auth")}
          className="bg-blue-700 hover:bg-blue-800 px-6 py-2 rounded-lg text-white font-bold shadow transition"
        >
          Login / Signup
        </button>
      </nav>

      {/* HERO */}
      <header className="flex flex-col md:flex-row-reverse py-20 px-8 gap-14 mx-auto max-w-7xl w-full items-center">
        <img
          src="https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=500&q=80"
          alt="ExamAI dashboard"
          className="rounded-3xl shadow-lg w-full md:w-[400px] object-cover"
        />
        <div className="text-center md:text-left flex-1">
          <h1 className="font-extrabold text-5xl sm:text-6xl text-[#15193A] mb-6">
            Smarter Online Exams <br />
            Powered by <span className="text-blue-700">AI</span>
          </h1>
          <p className="text-xl text-gray-700 mb-7 max-w-xl mx-auto md:mx-0">
            Effortlessly create, assign, monitor, and analyze AI-driven assessments. Instantly generate questions, auto-grade, detect cheating, and get visual analytics—all on one beautiful platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button
              onClick={() => navigate("/teacher-auth")}
              className="px-8 py-3 text-lg bg-blue-700 rounded-lg text-white font-bold shadow hover:bg-blue-800 transition"
            >
              Try For Free
            </button>
            <a
              href="#features"
              className="px-8 py-3 text-lg bg-white border-2 border-blue-700 rounded-lg text-blue-700 font-bold hover:bg-blue-50 transition"
            >
              Explore Features
            </a>
          </div>
        </div>
      </header>

      {/* VIDEO SECTION */}
      <section className="flex flex-col items-center py-16 bg-white border-y border-gray-100" id="video">
        <h2 className="text-3xl md:text-4xl font-bold text-blue-700 mb-3">See ExamAI in Action</h2>
        <p className="text-gray-600 mb-6 max-w-2xl text-center">
          Watch how you can automate question generation, monitor live results, and ensure fairness—all in minutes.
        </p>
        <div className="w-full flex justify-center">
          <div className="aspect-w-16 aspect-h-9 w-full max-w-3xl rounded-xl overflow-hidden shadow-lg border border-gray-200">
            {/* Replace with your own video or Youtube embed */}
            <iframe
              src="https://www.youtube.com/embed/_fKF1ZmE2h4?rel=0" // <<<-- put any product demo video
              title="ExamAI Demo"
              allow="autoplay; encrypted-media"
              className="w-full h-full"
              allowFullScreen
              frameBorder="0"
            />
          </div>
        </div>
      </section>

      {/* INFO + FEATURES */}
      <section className="py-24 px-4 bg-[#F7F8FA]" id="features">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-3">
              Why Top Educators Prefer ExamAI
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built for teachers by a team with 10+ years’ experience in frontend/UX, ExamAI brings you what truly matters:
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
            {[
              {
                icon: "🧠",
                title: "Smart AI Question Generation",
                desc: "Enter a topic and let AI create custom, difficulty-balanced questions in seconds.",
                color: "from-blue-50 to-blue-100",
              },
              {
                icon: "📊",
                title: "Real-Time Performance Analytics",
                desc: "Monitor each student, view class trends, and download insights straight from your dashboard.",
                color: "from-emerald-50 to-emerald-100",
              },
              {
                icon: "🎥",
                title: "AI Anti-Cheat Detection",
                desc: "Auto-flag suspicious activity with webcam, tab-tracking, and behavioral analytics.",
                color: "from-indigo-50 to-indigo-100",
              },
              {
                icon: "⌚",
                title: "Auto-Grading & Instant Feedback",
                desc: "Reduce your workload. All tests are graded instantly—students and teachers get immediate feedback.",
                color: "from-purple-50 to-purple-100",
              },
              {
                icon: "🗂️",
                title: "Easy Sharing, Scheduling, & Exports",
                desc: "Generate a shareable test link, import/export results, and schedule exams with reminders.",
                color: "from-orange-50 to-orange-100",
              },
              {
                icon: "🔒",
                title: "Modern, Safe & Intuitive UI",
                desc: "Designed with accessibility in mind—big readable fonts, color-blind safe palette, and seamless navigation.",
                color: "from-pink-50 to-pink-100",
              },
            ].map((f, i) => (
              <div
                key={f.title}
                className={`rounded-xl p-8 bg-gradient-to-br ${f.color} shadow hover:shadow-lg transition max-w-xs`}
              >
                <div className="text-4xl mb-3">{f.icon}</div>
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-gray-700">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ + INFO DIV */}
      <section className="bg-white py-16 border-t border-b border-gray-200 px-4" id="faq">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Info Div */}
          <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-extrabold mb-3 text-gray-800">
              Built for Teachers, <span className="text-blue-600">by UX Professionals</span>
            </h2>
            <p className="text-gray-600 mb-4">
              Your teaching time is valuable. ExamAI saves you hours every week. Experience a minimal, distraction-free interface, powerful automation, and trusted grade security.
            </p>
            <ul className="text-gray-700 pl-5 space-y-2 list-disc">
              <li>Big, comfortable font, accessible to all ages.</li>
              <li>Dark mode ready. Zero unnecessary clicks.</li>
              <li>One-click link sharing, even on mobile.</li>
              <li>Export analytics to PDF/Excel for reports.</li>
            </ul>
            <button
              onClick={() => navigate("/teacher-auth")}
              className="mt-8 bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold text-base shadow transition"
            >
              Start For Free &rarr;
            </button>
          </div>
          {/* FAQ */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-gray-800">Frequently Asked Questions</h3>
            <div className="space-y-6">
              <QnA
                q="Can I create tests for any subject?"
                a="Yes, ExamAI works for all school, university, and coaching subjects."
              />
              <QnA
                q="What data do you collect for anti-cheat?"
                a="Only essential metadata: tab switches, focus loss, and optionally webcam feeds if enabled—with student consent."
              />
              <QnA
                q="Is it free for teachers?"
                a="Absolutely! All core features are free. Power users can unlock advanced analytics and larger student quotas with Pro."
              />
              <QnA
                q="Do students need to sign up?"
                a="No student signup required. Share a test link; name entry is all that’s needed."
              />
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#15193A] text-white py-8 text-center mt-auto select-none">
        <div className="mb-3 flex justify-center gap-4 flex-wrap">
          <span className="uppercase tracking-wide font-bold text-blue-400">ExamAI</span>
          <span className="text-gray-200">|</span>
          <a href="#features" className="hover:text-blue-300 transition">Features</a>
          <a href="#faq" className="hover:text-blue-300 transition">FAQ</a>
          <a href="mailto:support@examai.com" className="hover:text-blue-300 transition">Contact Support</a>
        </div>
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} ExamAI — Crafted by UI/UX professionals who care deeply about teacher success.
        </p>
      </footer>
    </div>
  );
}

function QnA({ q, a }) {
  return (
    <div>
      <dt className="font-semibold text-gray-800">{q}</dt>
      <dd className="text-gray-600">{a}</dd>
    </div>
  );
}
