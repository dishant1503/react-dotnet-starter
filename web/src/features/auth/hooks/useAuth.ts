export function useAuth() {
  const login = (token: string) => {
    localStorage.setItem("token", token);
  };

  const logout = () => {
    localStorage.removeItem("token");
  };

  const getToken = () => localStorage.getItem("token");

  return { login, logout, getToken };
}
