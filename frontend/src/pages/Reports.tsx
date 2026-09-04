import { useEffect, useState } from "react";
import { generateReport, listReports, type Report } from "../services/reportService";

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadReports = () => {
    listReports()
      .then(setReports)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateReport(30);
      loadReports();
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1>Voice of Customer Reports</h1>
        <button onClick={handleGenerate} disabled={generating}>
          {generating ? "Generating..." : "+ Generate New Report"}
        </button>
      </div>

      {loading ? (
        <p>Loading reports...</p>
      ) : reports.length === 0 ? (
        <p>No reports yet — click "Generate New Report" to create one.</p>
      ) : (
        reports.map((report) => (
          <div key={report._id} style={{ background: "#f9f9f9", padding: 20, borderRadius: 8, marginBottom: 20 }}>
            <h3>{report.title}</h3>
            <p style={{ whiteSpace: "pre-wrap" }}>{report.contentJson.narrative}</p>
          </div>
        ))
      )}
    </div>
  );
}