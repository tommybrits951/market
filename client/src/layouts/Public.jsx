import { useContext } from "react";
import MarketContext from "../context/MarketContext";
import { Outlet, Navigate } from "react-router";

export default function Public() {
  const { auth } = useContext(MarketContext);

  if (auth !== null) {
    return <Navigate to={"/"} />;
  }
  return <Outlet />;
}
