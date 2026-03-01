const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5062";

export type AuthResponse = { token: string };

export const authApi = {
  async login(payload: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `Login failed: ${res.status}`);
    }

    return res.json();
  },

  async register(payload: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `Register failed: ${res.status}`);
    }

    return res.json();
  },

  async forgotPassword(payload: {
    email: string;
  }): Promise<{ message: string; devResetToken?: string | null }> {
    const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `Forgot password failed: ${res.status}`);
    }

    return res.json();
  },

  async resetPassword(payload: {
    token: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `Reset password failed: ${res.status}`);
    }

    return res.json();
  },
};
