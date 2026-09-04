import { useState } from "react";
import { askQuestion, type AskResponse } from "../services/askService";

export default function AskLoop() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AskResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const data = await askQuestion(question);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Ask LOOP</h1>
      <p>Ask a question about your customer feedback — answers are grounded only in real data.</p>

      <form onSubmit={handleAsk} style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. What are users saying about onboarding?"
          style={{ flex: 1, padding: 10 }}
          required
        />
        <button type="submit" disabled={loading}>{loading ? "Asking..." : "Ask"}</button>
      </form>

      {result && (
        <div style={{ background: "#f9f9f9", padding: 20, borderRadius: 8 }}>
          <h3>Answer</h3>
          <p>{result.answer}</p>

          {result.sources.length > 0 && (
            <>
              <h4>Sources</h4>
              <ul>
                {result.sources.map((s) => (
                  <li key={s.id}>
                    <strong>[{s.channel}, {s.sentiment || "unclassified"}]</strong> {s.content}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}