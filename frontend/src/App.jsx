import { useState } from "react";
import "./App.css";

function App() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [activeTab, setActiveTab] = useState("params");
  const [activeResponseTab, setActiveResponseTab] = useState("body");

  // Request configuration state
  const [params, setParams] = useState([{ key: "", value: "", id: 1 }]);
  const [headers, setHeaders] = useState([{ key: "", value: "", id: 1 }]);
  const [body, setBody] = useState("");

  // Response state
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const methods = ["GET", "POST", "PUT", "PATCH", "DELETE"];

  const handleSend = () => {
    // TODO: Implement actual request sending
    setLoading(true);
    setTimeout(() => {
      setResponse({
        status: 200,
        statusText: "OK",
        time: 142,
        size: "1.2 KB",
        body: JSON.stringify({ message: "Response will appear here" }, null, 2),
      });
      setLoading(false);
    }, 500);
  };

  const addKvRow = (setter, items) => {
    const newId = Math.max(...items.map((i) => i.id), 0) + 1;
    setter([...items, { key: "", value: "", id: newId }]);
  };

  const updateKvRow = (setter, items, id, field, value) => {
    setter(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const removeKvRow = (setter, items, id) => {
    if (items.length > 1) {
      setter(items.filter((item) => item.id !== id));
    }
  };

  const renderKvEditor = (items, setter) => (
    <div className="kv-editor">
      {items.map((item) => (
        <div className="kv-row" key={item.id}>
          <input
            type="text"
            className="key-input"
            placeholder="Key"
            value={item.key}
            onChange={(e) =>
              updateKvRow(setter, items, item.id, "key", e.target.value)
            }
          />
          <input
            type="text"
            placeholder="Value"
            value={item.value}
            onChange={(e) =>
              updateKvRow(setter, items, item.id, "value", e.target.value)
            }
          />
          <button
            className="kv-remove-btn"
            onClick={() => removeKvRow(setter, items, item.id)}
          >
            ×
          </button>
        </div>
      ))}
      <button className="kv-add-btn" onClick={() => addKvRow(setter, items)}>
        + Add Row
      </button>
    </div>
  );

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🔥</span>
            <span className="logo-text">Campfire</span>
          </div>
        </div>

        <div className="sidebar-content">
          <div className="sidebar-section">
            <div className="sidebar-section-title">Requests</div>
            <div className="request-list">
              <div className="request-item active">
                <span className="request-method get">GET</span>
                <span className="request-name">New Request</span>
              </div>
            </div>
            <button className="new-request-btn">
              <span>+</span>
              <span>New Request</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="main-panel">
        {/* Request Bar */}
        <div className="request-bar">
          <select
            className={`method-selector ${method.toLowerCase()}`}
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            {methods.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <input
            type="text"
            className="url-input"
            placeholder="Enter request URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <button className="send-btn" onClick={handleSend} disabled={loading}>
            {loading ? "Sending..." : "Send"}
          </button>
        </div>

        {/* Workspace */}
        <div className="workspace">
          <div className="split-view">
            {/* Request Section */}
            <section className="request-section">
              <div className="tabs">
                <button
                  className={`tab ${activeTab === "params" ? "active" : ""}`}
                  onClick={() => setActiveTab("params")}
                >
                  Params
                  {params.some((p) => p.key) && (
                    <span className="tab-badge">
                      {params.filter((p) => p.key).length}
                    </span>
                  )}
                </button>
                <button
                  className={`tab ${activeTab} === 'headers' ? 'active' : ''}`}
                  onClick={() => setActiveTab("headers")}
                >
                  Headers
                  {headers.some((h) => h.key) && (
                    <span className="tab-badge">
                      {headers.filter((h) => h.key).length}
                    </span>
                  )}
                </button>
                <button
                  className={`tab ${activeTab === "body" ? "active" : ""}`}
                  onClick={() => setActiveTab("body")}
                >
                  Body
                </button>
                <button
                  className={`tab ${activeTab === "auth" ? "active" : ""}`}
                  onClick={() => setActiveTab("auth")}
                >
                  Auth
                </button>
              </div>

              <div className="tab-content">
                {activeTab === "params" && renderKvEditor(params, setParams)}
                {activeTab === "headers" && renderKvEditor(headers, setHeaders)}
                {activeTab === "body" && (
                  <textarea
                    className="body-editor"
                    placeholder="Request body (JSON, XML, etc.)"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                  />
                )}
                {activeTab === "auth" && (
                  <div className="empty-state">
                    <div className="empty-state-icon">🔐</div>
                    <div className="empty-state-text">Authentication</div>
                    <div className="empty-state-subtext">
                      Auth configuration coming soon
                    </div>
                  </div>
                )}
              </div>
            </section>

            <div className="resizer" />

            {/* Response Section */}
            <section className="response-section response-panel">
              <div className="response-header">
                <div
                  className="tabs"
                  style={{ padding: 0, borderBottom: "none" }}
                >
                  <button
                    className={`tab ${
                      activeResponseTab === "body" ? "active" : ""
                    }`}
                    onClick={() => setActiveResponseTab("body")}
                  >
                    Response Body
                  </button>
                  <button
                    className={`tab ${
                      activeResponseTab === "headers" ? "active" : ""
                    }`}
                    onClick={() => setActiveResponseTab("headers")}
                  >
                    Response Headers
                  </button>
                </div>

                {response && (
                  <div className="response-meta">
                    <span
                      className={`response-status ${
                        response.status < 400 ? "success" : "error"
                      }`}
                    >
                      {response.status} {response.statusText}
                    </span>
                    <span className="response-info">{response.time}</span>
                    <span className="response-info">{response.size}</span>
                  </div>
                )}
              </div>

              {response ? (
                <div className="response-body">
                  {activeResponseTab === "body" && response.body}
                  {activeResponseTab === "headers" &&
                    "Response headers will appear here"}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">⚡</div>
                  <div className="empty-state-text">
                    Enter a URL and hit Send
                  </div>
                  <div className="empty-state-subtext">
                    Response will appear here
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
