import { useState, useEffect } from "react";
import axios from "../utils/axios";

export default function useAuth() {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  // Try to restore the session once on mount (refresh-token cookie).
  useEffect(() => {
    axios
      .get("/users/refresh")
      .then((res) => {
        setUser(res.data.user);
        setAuth(res.data);
      })
      .catch(() => setAuth(null))
      .finally(() => setLoading(false));
  }, []);

  return { auth, setAuth, loading, user, setUser };
}
