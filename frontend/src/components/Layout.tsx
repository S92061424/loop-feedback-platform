import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <aside style={{ width: 220, background: "#1a1a2e", color: "white", padding: 20 }}>
        <h2 style={{ marginBottom: 30 }}>LOOP</h2>
        <nav style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Link to="/dashboard" style={{ color: "white" }}>Dashboard</Link>
          <Link to="/inbox" style={{ color: "white" }}>Inbox</Link>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: 30 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <span>Welcome, {user?.name} ({user?.role})</span>
          <button onClick={handleLogout}>Log out</button>
        </div>
        <Outlet />
      </main>
    </div>
  );
}