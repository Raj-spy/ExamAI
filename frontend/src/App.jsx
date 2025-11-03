 // frontend/src/App.jsx
import { Routes, Route } from "react-router-dom";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentTest from "./pages/StudentTest";
import ResultsPage from "./pages/ResultsPage";
import TeacherAuth from "./pages/TeacherAuth";
import LandingPage from "./pages/LandingPage"; // make sure the file name matches exactly (capitalization matters)

export default function App() {
  return (
    <Routes>
      {/* 👇 landing page is now the default route */}
      <Route path="/" element={<LandingPage />} />

      <Route path="/teacher-auth" element={<TeacherAuth />} />
      <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
      <Route path="/student/:testId" element={<StudentTest />} />
      <Route path="/results/:testId" element={<ResultsPage />} />
    </Routes>
  );
}
