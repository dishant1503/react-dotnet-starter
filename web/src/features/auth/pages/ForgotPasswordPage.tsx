import { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../services/authApi";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isDev = import.meta.env.DEV;

  // DEV only: backend returns token in Development env
  const [devToken, setDevToken] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setError(null);
    setDevToken(null);

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.forgotPassword({ email });
      setMsg(res.message);
      setDevToken(res.devResetToken ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="authWrap">
      <div className="authCard">
        <h1 className="authTitle">Forgot password</h1>

        <form onSubmit={onSubmit} className="authForm">
          <label>
            Email
            <input
              className="input"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>

          <button className="btn btnPrimary" disabled={loading} type="submit">
            {loading ? "Sending..." : "Send reset link"}
          </button>

          {msg && <div className="success">{msg}</div>}
          {error && <div className="errorBox">{error}</div>}

          {isDev && devToken && (
            <div className="devPanel">
              <strong>DEV token:</strong>
              <code className="devToken">{devToken}</code>
              <div style={{ marginTop: 8 }}>
                Open:{" "}
                <Link
                  to={`/reset-password?token=${encodeURIComponent(devToken)}`}
                >
                  Reset password page
                </Link>
              </div>
            </div>
          )}
        </form>

        <p className="authFooter">
          Back to <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
