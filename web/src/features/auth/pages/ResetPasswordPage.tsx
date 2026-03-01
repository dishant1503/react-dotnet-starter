import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../services/authApi";

export function ResetPasswordPage() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setError(null);
    setLoading(true);

    try {
      const res = await authApi.resetPassword({ token, newPassword });
      setMsg(res.message);

      setTimeout(() => nav("/login", { replace: true }), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="authWrap">
      <div className="authCard">
        <h1 className="authTitle">Reset password</h1>

        {!token ? (
          <>
            <div className="errorBox">
              Missing token. Use the reset link again.
            </div>
            <p className="authFooter">
              Go to <Link to="/forgot-password">Forgot password</Link>
            </p>
          </>
        ) : (
          <form onSubmit={onSubmit} className="authForm">
            <label>
              New password
              <input
                className="input"
                autoFocus
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
              />
            </label>

            <button className="btn btnPrimary" disabled={loading} type="submit">
              {loading ? "Saving..." : "Set new password"}
            </button>

            {msg && <div className="success">{msg}</div>}
            {error && <div className="errorBox">{error}</div>}

            <p className="authFooter">
              Back to <Link to="/login">Login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
