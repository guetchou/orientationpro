import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import RiasecTest from "./pages/RiasecTest";
import EmotionalTest from "./pages/EmotionalTest";
import MultipleIntelligenceTest from "./pages/MultipleIntelligenceTest";
import LearningStyleTest from "./pages/LearningStyleTest";
import TestResults from "./pages/TestResults";
import { DashboardLayout } from "./components/DashboardLayout";
import "./App.css";

console.info("Application starting...");

function App() {
  console.info("App component rendered");

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/results" element={<TestResults />} />
        </Route>
        <Route path="/test-riasec" element={<RiasecTest />} />
        <Route path="/test-emotional" element={<EmotionalTest />} />
        <Route path="/test-multiple" element={<MultipleIntelligenceTest />} />
        <Route path="/test-learning" element={<LearningStyleTest />} />
      </Routes>
    </Router>
  );
}

export default App;