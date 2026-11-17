import MarketContext from "./MarketContext";
import useAuth from "../hooks/useAuth";

export default function MarketProvider({ children }) {
  const { auth, setAuth, loading, user, setUser } = useAuth();

  return (
    <MarketContext.Provider
      value={{
        auth,
        setAuth,
        loading,
        user,
        setUser,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
}
