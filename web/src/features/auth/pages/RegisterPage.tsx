import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getErrorMessage } from "../../../api/errors";
import { authApi } from "../services/authApi";

export function RegisterPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Ensure fields are NOT prefilled
  useEffect(() => {
    setEmail("");
    setPassword("");
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError("Email and password are required.");
      return;
    }
    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await authApi.register({ email: cleanEmail, password });

      // Redirect to login + show one-time success message
      navigate("/login?register=1", {
        replace: true,
        state: { registerd: true },
      });
    } catch (e: unknown) {
      setError(getErrorMessage(e) || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authWrap">
      <div className="card">
        <h1 className="authTitle">Register</h1>

        <form onSubmit={onSubmit} className="authForm">
          <label className="label">
            Email
            <input
              autoFocus
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              inputMode="email"
            />
          </label>

          <label className="label">
            Password
            <input
              className="input"
              value={password}
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </label>

          <button disabled={loading} type="submit" className="btn btnPrimary">
            {loading ? "Creating..." : "Create account"}
          </button>

          {error && <div className="error">{error}</div>}
        </form>

        <p className="authFooter">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
