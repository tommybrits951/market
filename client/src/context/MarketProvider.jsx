import MarketContext from "./MarketContext";
import useAuth from "../hooks/useAuth";

export default function MarketProvider({ children }) {
  const { auth, setAuth, loading } = useAuth();

  return (
    <MarketContext.Provider
      value={{
        auth,
        setAuth,
        loading,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
}
