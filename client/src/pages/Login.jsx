import { useState } from "react";
import FormInput from "../components/FormInput";
import { Link, useNavigate } from "react-router";

const initForm = {
  email: "",
  password: "",
};

export default function Login() {
  const [formData, setFormData] = useState(initForm);

  function change(e) {
    const { name, value } = e.target;
    return setFormData({ ...formData, [name]: value });
  }

  return (
    <main className="absolute w-full md:w-1/2 left-0 md:left-1/4 top-24 bg-orange-500 rounded-lg shadow-2xl">
      <h3 className="text-white text-center text-4xl my-5 underlind font-bold">
        Sign In
      </h3>
      <form className="text-center">
        <label className="text-lg text-white">
          Email
          <br />
          <input
            className="rounded bg-white p-1"
            type="email"
            name="email"
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
            value={formData.password}
            onChange={change}
            required
          />
        </label>
        <br />
        <div className="flex justify-around p-3">
          <Link
            to={"/public/register"}
            className="text-lg text-cyan-300 underline"
          >
            New User? Register here.
          </Link>
          <button className="text-lg text-white bg-cyan-500 p-2 rounded-lg shadow-2xl hover:scale-95 cursor-pointer">
            Submit
          </button>
        </div>
      </form>
    </main>
  );
}
