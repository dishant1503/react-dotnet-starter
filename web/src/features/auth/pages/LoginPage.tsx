import { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { authApi } from "../services/authApi";

export function LoginPage() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();

  const justRegistered = searchParams.get("register") === "1"; // ✅ matches your URL

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (justRegistered) {
      const url = new URL(window.location.href);
      url.searchParams.delete("register");
      window.history.replaceState({}, "", url.pathname);
    }
  }, [justRegistered]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      const data = await authApi.login({ email, password });
      localStorage.setItem("token", data.token);
      nav("/tasks");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="authWrap">
      <div className="card">
        <h1 className="authTitle">Login</h1>

        {justRegistered && (
          <div className="success">Registration successful. Please log in.</div>
        )}

        <form onSubmit={onSubmit} className="authForm">
          <label className="label">
            Email
            <input
              autoFocus
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="label">
            Password
            <input
              className="input"
              value={password}
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <div className="authLinkRight">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          <button disabled={loading} type="submit" className="btn btnPrimary">
            {loading ? "Logging in..." : "Login"}
          </button>

          {error && <div className="errorBox">{error}</div>}
        </form>

        <p className="authFooter">
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
