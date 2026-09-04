import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Inbox from "./pages/Inbox";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AskLoop from "./pages/AskLoop";
import Themes from "./pages/Themes";
import Reports from "./pages/Reports";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/ask" element={<AskLoop />} />
            <Route path="/themes" element={<Themes />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;