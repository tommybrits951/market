import MarketContext from "./MarketContext";
import useAuth from "../hooks/useAuth";

export default function MarketProvider({ children }) {
  const { auth, setAuth } = useAuth();

  return (
    <MarketContext.Provider
      value={{
        auth,
        setAuth,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
}
