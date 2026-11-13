import { useContext } from "react";
import MarketContext from "../context/MarketContext";
import { Outlet, Navigate } from "react-router";

export default function Private() {
  const { auth } = useContext(MarketContext);
  if (auth === null) {
    console.log(auth);
    return <Navigate to={"/public/login"} />;
  }

  return <Outlet />;
}
