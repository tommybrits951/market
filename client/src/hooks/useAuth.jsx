import { useState, useEffect } from "react";
import axios from "../utils/axios";

export default function useAuth() {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    auth === null &&
      axios
        .get("/users/refresh")
        .then((res) => setAuth(res.data))
        .catch((err) => console.log(err));
  }, [auth, setAuth]);

  return { auth, setAuth };
}
