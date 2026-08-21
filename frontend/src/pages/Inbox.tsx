import { useEffect, useState } from "react";
import { getFeedbackList, createFeedbackItem, type Feedback } from "../services/feedbackService";

export default function Inbox() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [channelFilter, setChannelFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // New feedback form
  const [content, setContent] = useState("");
  const [channel, setChannel] = useState("support_ticket");
  const [customerLabel, setCustomerLabel] = useState("");
  const [showForm, setShowForm] = useState(false);

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const data = await getFeedbackList({
        page,
        limit: 10,
        channel: channelFilter || undefined,
        status: statusFilter || undefined,
      });
      setItems(data.items);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      console.error("Failed to load feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, [page, channelFilter, statusFilter]);

  const handleAddFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createFeedbackItem({ content, channel, customerLabel });
      setContent("");
      setCustomerLabel("");
      setShowForm(false);
      loadFeedback();
    } catch (err) {
      console.error("Failed to create feedback:", err);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1>Feedback Inbox</h1>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add Feedback"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddFeedback} style={{ marginBottom: 20, padding: 15, border: "1px solid #ccc", borderRadius: 6 }}>
          <div style={{ marginBottom: 10 }}>
            <label>Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              style={{ width: "100%", padding: 8 }}
            />
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <label>Channel</label>
              <select value={channel} onChange={(e) => setChannel(e.target.value)} style={{ width: "100%", padding: 8 }}>
                <option value="support_ticket">Support Ticket</option>
                <option value="app_store_review">App Store Review</option>
                <option value="nps_survey">NPS Survey</option>
                <option value="sales_call_note">Sales Call Note</option>
                <option value="social_mention">Social Mention</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label>Customer Label</label>
              <input
                value={customerLabel}
                onChange={(e) => setCustomerLabel(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              />
            </div>
          </div>
          <button type="submit">Submit</button>
        </form>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
        <select value={channelFilter} onChange={(e) => { setChannelFilter(e.target.value); setPage(1); }}>
          <option value="">All Channels</option>
          <option value="support_ticket">Support Ticket</option>
          <option value="app_store_review">App Store Review</option>
          <option value="nps_survey">NPS Survey</option>
          <option value="sales_call_note">Sales Call Note</option>
          <option value="social_mention">Social Mention</option>
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="NEW">New</option>
          <option value="REVIEWED">Reviewed</option>
          <option value="ACTIONED">Actioned</option>
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <p>No feedback found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #ccc", textAlign: "left" }}>
              <th style={{ padding: 8 }}>Content</th>
              <th style={{ padding: 8 }}>Channel</th>
              <th style={{ padding: 8 }}>Customer</th>
              <th style={{ padding: 8 }}>Sentiment</th>
              <th style={{ padding: 8 }}>Status</th>
              <th style={{ padding: 8 }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 8, maxWidth: 300 }}>{item.content}</td>
                <td style={{ padding: 8 }}>{item.channel}</td>
                <td style={{ padding: 8 }}>{item.customerLabel || "-"}</td>
                <td style={{ padding: 8 }}>{item.sentiment || "-"}</td>
                <td style={{ padding: 8 }}>{item.status}</td>
                <td style={{ padding: 8 }}>{new Date(item.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 15, alignItems: "center" }}>
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
        <span>Page {page} of {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}