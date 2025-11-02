 // frontend/src/App.jsx
import { Routes, Route } from "react-router-dom";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentTest from "./pages/StudentTest";
import ResultsPage from "./pages/ResultsPage";
import TeacherAuth from "./pages/TeacherAuth";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<TeacherDashboard />} />
         <Route path="/student/:testId" element={<StudentTest />} />
         <Route path="/results/:testId" element={<ResultsPage />} />
         <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher-auth" element={<TeacherAuth />} />
     </Routes>
  );
}
