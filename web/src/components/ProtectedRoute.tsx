import { Navigate } from "react-router-dom";

type Props = {
  children: React.ReactNode;
};

export function ProtectedRoute({ children }: Props) {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
