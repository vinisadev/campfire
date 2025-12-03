import "./AuthEditor.css";

const AUTH_TYPES = [
  { value: "none", label: "No Auth", icon: "🚫" },
  { value: "basic", label: "Basic Auth", icon: "🔑" },
  { value: "bearer", label: "Bearer Token", icon: "🎫" },
  { value: "apikey", label: "API Key", icon: "🔐" },
];

export default function AuthEditor({ auth, onChange }) {
  const authType = auth?.type || "none";

  const updateAuth = (updates) => {
    onChange({ ...auth, ...updates });
  };

  const renderAuthForm = () => {
    switch (authType) {
      case "basic":
        return (
          <div className="auth-form">
            <div className="auth-form-group">
              <label className="auth-label">Username</label>
              <input
                type="text"
                className="auth-input"
                placeholder="Enter username"
                value={auth?.basicUsername || ""}
                onChange={(e) => updateAuth({ basicUsername: e.target.value })}
              />
            </div>
            <div className="auth-form-group">
              <label className="auth-label">Password</label>
              <input
                type="password"
                className="auth-input"
                placeholder="Enter Password"
                value={auth?.basicPassword || ""}
                onChange={(e) => updateAuth({ basicPassword: e.target.value })}
              />
            </div>
            <div className="auth-info">
              <span className="auth-info-icon">ℹ️</span>
              <span>
                Credentials will be Base64 encoded and sent as an Authorization
                header.
              </span>
            </div>
          </div>
        );

      case "bearer":
        return (
          <div className="auth-form">
            <div className="auth-form-group">
              <label className="auth-label">Token</label>
              <input
                type="text"
                className="auth-input"
                placeholder="Enter token"
                value={auth?.bearerToken || ""}
                onChange={(e) => updateAuth({ bearerToken: e.target.value })}
              />
            </div>
            <div className="auth-form-group">
              <label className="auth-label">Prefix</label>
              <input
                type="text"
                className="auth-input"
                placeholder="Bearer"
                value={auth?.bearerPrefix || ""}
                onChange={(e) => updateAuth({ bearerPrefix: e.target.value })}
              />
              <span className="auth-hint">Leave empty to use "Bearer"</span>
            </div>
            <div className="auth-info">
              <span className="auth-info-icon">ℹ️</span>
              <span>
                Token will be sent as: Authorization:{" "}
                {auth?.bearerPrefix || "Bearer"} {"<token>"}
              </span>
            </div>
          </div>
        );

      case "apikey":
        return (
          <div className="auth-form">
            <div className="auth-form-group">
              <label className="auth-label">Add to</label>
              <div className="auth-radio-group">
                <label className="auth-radio">
                  <input
                    type="radio"
                    name="apiKeyLocation"
                    value="header"
                    checked={(auth?.apiKeyLocation || "header") === "header"}
                    onChange={(e) =>
                      updateAuth({ apiKeyLocation: e.target.value })
                    }
                  />
                  <span>Header</span>
                </label>
                <label className="auth-radio">
                  <input
                    type="radio"
                    name="apiKeyLocation"
                    value="query"
                    checked={auth?.apiKeyLocation === "query"}
                    onChange={(e) =>
                      updateAuth({ apiKeyLocation: e.target.value })
                    }
                  />
                  <span>Query Param</span>
                </label>
              </div>
            </div>
            <div className="auth-form-group">
              <label className="auth-label">Key</label>
              <input
                type="text"
                className="auth-input"
                placeholder="e.g., X-API-Key"
                value={auth?.apiKeyKey || ""}
                onChange={(e) => updateAuth({ apiKeyKey: e.target.value })}
              />
            </div>
            <div className="auth-form-group">
              <label className="auth-label">Value</label>
              <input
                type="text"
                className="auth-input"
                placeholder="Enter API key value"
                value={auth?.apiKeyValue || ""}
                onChange={(e) => updateAuth({ apiKeyValue: e.target.value })}
              />
            </div>
            <div className="auth-info">
              <span className="auth-info-icon">ℹ️</span>
              <span>
                {(auth?.apiKeyLocation || "header") === "header"
                  ? `Key will be sent as header: ${
                      auth?.apiKeyKey || "<key>"
                    }: ${auth?.apiKeyValue || "<value>"}`
                  : `Key will be added as query param: ?${
                      auth?.apiKeyKey || "<key>"
                    }=${auth?.apiKeyValue || "<value>"}`}
              </span>
            </div>
          </div>
        );

      case "none":
      default:
        return (
          <div className="auth-none">
            <div className="auth-none-icon">🔓</div>
            <div className="auth-none-text">No authentication</div>
            <div className="auth-none-subtext">
              This request will be sent without any authentication headers.
            </div>
          </div>
        );
    }
  };

  return (
    <div className="auth-editor">
      <div className="auth-type-selector">
        <label className="auth-type-label">Type</label>
        <div className="auth-type-options">
          {AUTH_TYPES.map((type) => (
            <button
              key={type.value}
              className={`auth-type-option ${
                authType === type.value ? "active" : ""
              }`}
              onClick={() => updateAuth({ type: type.value })}
            >
              <span className="auth-type-icon">{type.icon}</span>
              <span className="auth-type-name">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="auth-config">{renderAuthForm()}</div>
    </div>
  );
}
