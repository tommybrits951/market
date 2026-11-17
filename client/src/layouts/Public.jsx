import { useContext } from "react";
import MarketContext from "../context/MarketContext";
import { Outlet, Navigate } from "react-router";

export default function Public() {
  const { auth, loading } = useContext(MarketContext);

  if (loading) return null;

  if (auth) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
