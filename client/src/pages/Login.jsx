import { useContext, useState } from "react";
import { Link } from "react-router";
import MarketContext from "../context/MarketContext";
import axios from "../utils/axios";

const initForm = {
  email: "",
  password: "",
};

export default function Login() {
  const { setAuth } = useContext(MarketContext);
  const [formData, setFormData] = useState(initForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function change(e) {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  }

  async function submit(e) {
    e.preventDefault();
    const email = formData.email.trim().toLowerCase();
    if (!email || !formData.password)
      return setError("Email and password are required");

    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post("/users/login", {
        email,
        password: formData.password,
      });
      // Setting auth makes the Public layout redirect to the dashboard
      setAuth(data);
    } catch (err) {
      setError(err.response?.data?.message || "Sign in failed");
      setFormData({ ...formData, password: "" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="absolute w-full md:w-1/2 left-0 md:left-1/4 top-24 bg-orange-500 rounded-lg shadow-2xl">
      <h3 className="text-white text-center text-4xl my-5 underline font-bold">
        Sign In
      </h3>
      <form className="text-center" onSubmit={submit}>
        <label className="text-lg text-white">
          Email
          <br />
          <input
            className="rounded bg-white p-1"
            type="email"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={change}
            required
          />
        </label>
        <br />
        <label className="text-lg text-white">
          Password
          <br />
          <input
            className="rounded bg-white p-1"
            type="password"
            name="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={change}
            required
          />
        </label>
        <br />
        {error && (
          <p className="mx-auto mt-3 w-fit rounded bg-red-100 p-2 text-red-700">
            {error}
          </p>
        )}
        <div className="flex justify-around p-3">
          <Link
            to={"/public/register"}
            className="text-lg text-cyan-300 underline"
          >
            New User? Register here.
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="text-lg text-white bg-cyan-500 p-2 rounded-lg shadow-2xl hover:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Submit"}
          </button>
        </div>
      </form>
    </main>
  );
}
