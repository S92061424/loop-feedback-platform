import { useEffect, useState } from "react";
import { getThemes, type Theme } from "../services/themeService";

export default function Themes() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getThemes()
      .then(setThemes)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading themes...</p>;

  return (
    <div>
      <h1>Themes</h1>
      {themes.length === 0 ? (
        <p>No themes yet — add some feedback to see themes emerge.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #ccc", textAlign: "left" }}>
              <th style={{ padding: 8 }}>Theme</th>
              <th style={{ padding: 8 }}>Feedback Count</th>
            </tr>
          </thead>
          <tbody>
            {themes
              .sort((a, b) => b.count - a.count)
              .map((theme) => (
                <tr key={theme._id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: 8 }}>{theme.name}</td>
                  <td style={{ padding: 8 }}>{theme.count}</td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}