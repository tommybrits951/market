import { useContext } from "react";
import MarketContext from "../context/MarketContext";
import { Outlet, Navigate, useLocation } from "react-router";

export default function Private() {
  const { auth, loading } = useContext(MarketContext);
  const location = useLocation();

  if (loading) return null;

  if (!auth) {
    return <Navigate to="/public/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
