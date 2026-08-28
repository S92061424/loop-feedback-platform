import { useEffect, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { getDashboardStats, type DashboardStats } from "../services/dashboardService";

const SENTIMENT_COLORS = { POS: "#22c55e", NEU: "#eab308", NEG: "#ef4444" };

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((err) => console.error("Failed to load dashboard stats:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (!stats) return <p>Failed to load dashboard data.</p>;

  const sentimentData = [
    { name: "Positive", value: stats.sentimentBreakdown.POS, color: SENTIMENT_COLORS.POS },
    { name: "Neutral", value: stats.sentimentBreakdown.NEU, color: SENTIMENT_COLORS.NEU },
    { name: "Negative", value: stats.sentimentBreakdown.NEG, color: SENTIMENT_COLORS.NEG },
  ];

  return (
    <div>
      <h1>Dashboard</h1>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: 20, marginBottom: 30 }}>
        <StatCard label="Total Feedback" value={stats.totalItems} />
        <StatCard label="New This Week" value={stats.newThisWeek} />
        <StatCard label="% Negative" value={`${stats.percentNegative}%`} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
        {/* Volume over time */}
        <div style={{ background: "#f9f9f9", padding: 20, borderRadius: 8 }}>
          <h3>Volume Over Time (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.volumeOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sentiment breakdown */}
        <div style={{ background: "#f9f9f9", padding: 20, borderRadius: 8 }}>
          <h3>Sentiment Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={sentimentData} dataKey="value" nameKey="name" outerRadius={80} label>
                {sentimentData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top themes */}
        <div style={{ background: "#f9f9f9", padding: 20, borderRadius: 8, gridColumn: "span 2" }}>
          <h3>Top Themes</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.topThemes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ background: "#1a1a2e", color: "white", padding: 20, borderRadius: 8, flex: 1, textAlign: "center" }}>
      <div style={{ fontSize: 28, fontWeight: "bold" }}>{value}</div>
      <div style={{ fontSize: 14, opacity: 0.8 }}>{label}</div>
    </div>
  );
}