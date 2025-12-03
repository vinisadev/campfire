import { useState, useEffect } from "react";
import "./App.css";
import CollectionTree from "./components/CollectionTree";
import AuthEditor from "./components/AuthEditor";
import {
  GetOpenCollections,
  GetCollection,
  CreateCollection,
  OpenCollection,
  CloseCollection,
  UpdateCollection,
  DeleteCollection,
  CreateFolder,
  CreateRequest,
  UpdateItem,
  DeleteItem,
} from "../wailsjs/go/main/CollectionService";
import { SendRequest } from "../wailsjs/go/main/HTTPClient";

function App() {
  // Collection state
  const [collections, setCollections] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Request editor state
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [activeTab, setActiveTab] = useState("params");
  const [activeResponseTab, setActiveResponseTab] = useState("body");

  // Request configuration state
  const [params, setParams] = useState([
    { key: "", value: "", enabled: true, id: 1 },
  ]);
  const [headers, setHeaders] = useState([
    { key: "", value: "", enabled: true, id: 1 },
  ]);
  const [body, setBody] = useState("");
  const [auth, setAuth] = useState({ type: "none" });

  // Response state
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const methods = ["GET", "POST", "PUT", "PATCH", "DELETE"];

  // Format bytes to human-readable string
  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Format response body (pretty print JSON if possible)
  const formatResponseBody = (body) => {
    if (!body) return "";
    try {
      const parsed = JSON.parse(body);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return body;
    }
  };

  // Load collections on mount
  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const cols = await GetOpenCollections();
      setCollections(cols || []);
    } catch (err) {
      console.error("Failed to load collections:", err);
    }
  };

  const refreshCollection = async (collectionId) => {
    try {
      const col = await GetCollection(collectionId);
      setCollections((prev) =>
        prev.map((c) => (c.id === collectionId ? col : c))
      );
    } catch (err) {
      console.error("Failed to refresh collection:", err);
    }
  };

  // Collection handlers
  const handleCreateCollection = async () => {
    const name = prompt("Collection name:");
    if (!name) return;

    try {
      const col = await CreateCollection(name);
      if (col) {
        setCollections((prev) => [...prev, col]);
      }
    } catch (err) {
      // User cancelled the dialog
      if (!err.includes("no file selected")) {
        console.error("Failed to create collection:", err);
      }
    }
  };

  const handleOpenCollection = async () => {
    try {
      const col = await OpenCollection();
      if (col) {
        // Check if already open
        if (!collections.find((c) => c.id === col.id)) {
          setCollections((prev) => [...prev, col]);
        }
      }
    } catch (err) {
      // User cancelled the dialog
      if (!err.includes("no file selected")) {
        console.error("Failed to open collection:", err);
      }
    }
  };

  const handleCloseCollection = async (collectionId) => {
    try {
      await CloseCollection(collectionId);
      setCollections((prev) => prev.filter((c) => c.id !== collectionId));
      if (selectedRequest?.collectionId === collectionId) {
        setSelectedRequest(null);
        resetEditor();
      }
    } catch (err) {
      console.error("Failed to close collection:", err);
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    if (!confirm("Delete this collection file permanently?")) return;

    try {
      await DeleteCollection(collectionId);
      setCollections((prev) => prev.filter((c) => c.id !== collectionId));
      if (selectedRequest?.collectionId === collectionId) {
        setSelectedRequest(null);
        resetEditor();
      }
    } catch (err) {
      console.error("Failed to delete collection:", err);
    }
  };

  // Folder handlers
  const handleCreateFolder = async (collectionId, parentId) => {
    const name = prompt("Folder name:");
    if (!name) return;

    try {
      await CreateFolder(collectionId, parentId, name);
      await refreshCollection(collectionId);
    } catch (err) {
      console.error("Failed to create folder:", err);
    }
  };

  // Request handlers
  const handleCreateRequest = async (collectionId, parentId) => {
    const name = prompt("Request name:");
    if (!name) return;

    try {
      const item = await CreateRequest(collectionId, parentId, name);
      await refreshCollection(collectionId);
      handleSelectRequest({ ...item, collectionId });
    } catch (err) {
      console.error("Failed to create request:", err);
    }
  };

  const handleRenameItem = async (collectionId, itemId, currentName) => {
    const newName = prompt("New name:", currentName);
    if (!newName || newName === currentName) return;

    if (itemId === "") {
      // Renaming collection
      try {
        await UpdateCollection(collectionId, newName);
        setCollections((prev) =>
          prev.map((c) => (c.id === collectionId ? { ...c, name: newName } : c))
        );
      } catch (err) {
        console.error("Failed to rename collection:", err);
      }
    } else {
      // Renaming item
      try {
        await UpdateItem(collectionId, itemId, newName, null);
        await refreshCollection(collectionId);
      } catch (err) {
        console.error("Failed to rename item:", err);
      }
    }
  };

  const handleDeleteItem = async (collectionId, itemId) => {
    if (!confirm("Delete this item?")) return;

    try {
      await DeleteItem(collectionId, itemId);
      await refreshCollection(collectionId);
      if (selectedRequest?.id === itemId) {
        setSelectedRequest(null);
        resetEditor();
      }
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  const handleSelectRequest = (item) => {
    if (item.type !== "request") return;

    setSelectedRequest(item);

    // Load request data into editor
    const req = item.request || {};
    setMethod(req.method || "GET");
    setUrl(req.url || "");
    setBody(req.body || "");
    setAuth(req.auth || { type: "none" });

    // Convert headers/params to editor format
    const toEditorFormat = (items) => {
      if (!items || items.length === 0) {
        return [{ key: "", value: "", enabled: true, id: 1 }];
      }
      return items.map((item, index) => ({
        ...item,
        id: index + 1,
      }));
    };

    setHeaders(toEditorFormat(req.headers));
    setParams(toEditorFormat(req.params));
    setResponse(null);
  };

  const resetEditor = () => {
    setMethod("GET");
    setUrl("");
    setBody("");
    setHeaders([{ key: "", value: "", enabled: true, id: 1 }]);
    setParams([{ key: "", value: "", enabled: true, id: 1 }]);
    setAuth({ type: "none" });
    setResponse(null);
  };

  // Save current request
  const saveCurrentRequest = async () => {
    if (!selectedRequest) return;

    const requestData = {
      method,
      url,
      body,
      headers: headers
        .filter((h) => h.key)
        .map(({ key, value, enabled }) => ({ key, value, enabled })),
      params: params
        .filter((p) => p.key)
        .map(({ key, value, enabled }) => ({ key, value, enabled })),
      auth,
    };

    try {
      await UpdateItem(
        selectedRequest.collectionId,
        selectedRequest.id,
        "",
        requestData
      );
      await refreshCollection(selectedRequest.collectionId);
    } catch (err) {
      console.error("Failed to save request:", err);
    }
  };

  const handleSend = async () => {
    if (!url) {
      setResponse({
        error: "Please enter a URL",
        status: 0,
        statusText: "",
        time: 0,
        size: 0,
        body: "",
        headers: [],
      });
      return;
    }

    // Save before sending
    await saveCurrentRequest();

    setLoading(true);
    setResponse(null);

    try {
      const requestData = {
        method,
        url,
        body,
        headers: headers
          .filter((h) => h.key && h.enabled)
          .map(({ key, value, enabled }) => ({ key, value, enabled })),
        params: params
          .filter((p) => p.key && p.enabled)
          .map(({ key, value, enabled }) => ({ key, value, enabled })),
        auth,
      };

      const result = await SendRequest(requestData);

      setResponse({
        status: result.status,
        statusText: result.statusText,
        time: result.time,
        size: result.size,
        body: result.body,
        headers: result.headers || [],
        error: result.error,
      });
    } catch (err) {
      setResponse({
        error: err.toString(),
        status: 0,
        statusText: "Error",
        time: 0,
        size: 0,
        body: "",
        headers: [],
      });
    } finally {
      setLoading(false);
    }
  };

  // Key-value editor helpers
  const addKvRow = (setter, items) => {
    const newId = Math.max(...items.map((i) => i.id), 0) + 1;
    setter([...items, { key: "", value: "", enabled: true, id: newId }]);
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
            type="checkbox"
            className="kv-checkbox"
            checked={item.enabled !== false}
            onChange={(e) =>
              updateKvRow(setter, items, item.id, "enabled", e.target.checked)
            }
          />
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

        <div className="sidebar-actions">
          <button
            className="sidebar-action-btn"
            onClick={handleCreateCollection}
            title="Create new collection"
          >
            <span>+</span>
            <span>New</span>
          </button>
          <button
            className="sidebar-action-btn"
            onClick={handleOpenCollection}
            title="Open existing collection"
          >
            <span>📂</span>
            <span>Open</span>
          </button>
        </div>

        <CollectionTree
          collections={collections}
          selectedRequestId={selectedRequest?.id}
          onSelectRequest={handleSelectRequest}
          onCreateCollection={handleCreateCollection}
          onOpenCollection={handleOpenCollection}
          onCloseCollection={handleCloseCollection}
          onCreateFolder={handleCreateFolder}
          onCreateRequest={handleCreateRequest}
          onRenameItem={handleRenameItem}
          onDeleteItem={handleDeleteItem}
          onDeleteCollection={handleDeleteCollection}
        />
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

        {/* Request name indicator */}
        {selectedRequest && (
          <div className="request-name-bar">
            <span className="request-name-label">{selectedRequest.name}</span>
            <button className="save-btn" onClick={saveCurrentRequest}>
              Save
            </button>
          </div>
        )}

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
                  className={`tab ${activeTab === "headers" ? "active" : ""}`}
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
                  {auth?.type && auth.type !== "none" && (
                    <span className="tab-badge auth-badge">✓</span>
                  )}
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
                  <AuthEditor auth={auth} onChange={setAuth} />
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

                {response && !response.error && (
                  <div className="response-meta">
                    <span
                      className={`response-status ${
                        response.status < 400 ? "success" : "error"
                      }`}
                    >
                      {response.status} {response.statusText}
                    </span>
                    <span className="response-info">{response.time}ms</span>
                    <span className="response-info">
                      {formatBytes(response.size)}
                    </span>
                  </div>
                )}
              </div>

              {response ? (
                response.error ? (
                  <div className="response-error">
                    <div className="response-error-icon">⚠️</div>
                    <div className="response-error-message">
                      {response.error}
                    </div>
                  </div>
                ) : (
                  <div className="response-body">
                    {activeResponseTab === "body" &&
                      formatResponseBody(response.body)}
                    {activeResponseTab === "headers" && (
                      <div className="response-headers-list">
                        {response.headers && response.headers.length > 0 ? (
                          response.headers.map((header, index) => (
                            <div key={index} className="response-header-row">
                              <span className="response-header-key">
                                {header.key}:
                              </span>
                              <span className="response-header-value">
                                {header.value}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="empty-state-text">
                            No response headers
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
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
