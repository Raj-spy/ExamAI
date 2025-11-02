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
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-96">
        <h1 className="text-2xl font-bold text-center mb-4 text-blue-700">
          👩‍🏫 {isSignup ? "Teacher Signup" : "Teacher Login"}
        </h1>

        <form onSubmit={handleAuth}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded w-full mb-3"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded w-full mb-3"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white w-full py-2 rounded"
          >
            {isSignup ? "Sign Up" : "Login"}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <button
                className="text-blue-600 underline"
                onClick={() => setIsSignup(false)}
              >
                Login
              </button>
            </>
          ) : (
            <>
              Don’t have an account?{" "}
              <button
                className="text-blue-600 underline"
                onClick={() => setIsSignup(true)}
              >
                Sign up
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
