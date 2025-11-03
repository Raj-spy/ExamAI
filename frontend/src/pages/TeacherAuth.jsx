 import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function TeacherAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("✅ Signup successful! Now login.");
        setIsSignup(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        alert("✅ Login successful!");
        navigate("/teacher-dashboard");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Auth Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-8 md:px-16 py-12 bg-white shadow-lg z-10">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl font-extrabold text-blue-700 select-none">
              Exam<span className="text-blue-500">AI</span>
            </span>
            <span className="inline-block ml-2 text-2xl">👩‍🏫</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-blue-700 mb-2 tracking-tight">
            {isSignup ? "Teacher Signup" : "Teacher Login"}
          </h1>
          <p className="mb-7 text-gray-500 text-sm">
            {isSignup
              ? "Create your free ExamAI account"
              : "Sign in to manage your online tests"}
          </p>
          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="name@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 p-3 transition outline-none text-gray-900 bg-gray-50"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 p-3 transition outline-none text-gray-900 bg-gray-50"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-lg font-bold text-lg shadow bg-blue-700 text-white transition hover:bg-blue-800"
            >
              {isSignup ? "Sign Up" : "Login"}
            </button>
          </form>
          <hr className="my-7 border-gray-200" />
          <p className="text-center text-gray-600 text-sm mb-1">
            {isSignup ? (
              <>
                Already have an account?{" "}
                <button
                  className="text-blue-600 hover:text-blue-800 underline font-semibold"
                  onClick={() => setIsSignup(false)}
                  type="button"
                >
                  Login
                </button>
              </>
            ) : (
              <>
                Don’t have an account?{" "}
                <button
                  className="text-blue-600 hover:text-blue-800 underline font-semibold"
                  onClick={() => setIsSignup(true)}
                  type="button"
                >
                  Sign up
                </button>
              </>
            )}
          </p>
          {isSignup && (
            <p className="text-xs text-center text-gray-400 mt-3">
              Password must be 8+ characters and strong.
            </p>
          )}
        </div>
      </div>

      {/* Right side - Gradient/Visual */}
      <div className="hidden md:flex w-1/2 min-h-screen items-center justify-center bg-gradient-to-tr from-blue-700 via-blue-500 to-emerald-400 relative">
        <div className="text-white px-8 py-16 max-w-md text-center">
          <h2 className="text-3xl font-extrabold mb-4 tracking-tight drop-shadow-xl">
            Welcome to ExamAI for Teachers
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Build the future of online assessment.<br />
            Enjoy instant test creation, reliable analytics, and effortless student management in a modern, trusted platform.
          </p>
          {/* (Optional) Big decorative icon */}
          <div className="text-[90px] drop-shadow-2xl mb-4 select-none opacity-80">
            📊
          </div>
        </div>
        {/* Decorative SVG Waves */}
        <svg
          className="absolute bottom-0 left-0 w-full"
          height="100"
          viewBox="0 0 500 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0 80 C150 100 350 0 500 80 L500 100 L0 100 Z" fill="#fff" fillOpacity="0.12" />
        </svg>
      </div>
    </div>
  );
}
