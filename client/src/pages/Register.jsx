import { useContext, useState } from "react";
import { Link } from "react-router";
import FormInput from "../components/FormInput";
import MarketContext from "../context/MarketContext";
import axios from "../utils/axios";

const MIN_AGE = 13;

// Fields mirror what server/controllers/userController.js register() reads.
// All of them are required by the server.
const initForm = {
  email: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  phone: "",
  postal: "",
  acceptTerms: false,
  acceptPrivacy: false,
};

// Latest date of birth allowed (user must be at least MIN_AGE), as YYYY-MM-DD
function maxDob() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - MIN_AGE);
  return d.toISOString().slice(0, 10);
}

const digits = (str) => str.replace(/\D/g, "");

function validate(f) {
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return "Invalid email address";
  if (f.password.length < 8) return "Password must be at least 8 characters";
  if (f.password !== f.confirmPassword) return "Passwords do not match";
  if (!f.firstName.trim() || !f.lastName.trim())
    return "First and last name are required";
  if (!f.dateOfBirth) return "Date of birth is required";
  if (f.dateOfBirth > maxDob())
    return `You must be at least ${MIN_AGE} years old`;
  if (digits(f.phone).length !== 10)
    return "Phone number must be 10 digits";
  if (!/^\d{5}$/.test(f.postal.trim())) return "Postal code must be 5 digits";
  if (!f.acceptTerms || !f.acceptPrivacy)
    return "You must accept the Terms of Service and Privacy Policy";
  return null;
}

// The User model stores phone and postal as digit-only strings
function buildPayload(f) {
  return {
    email: f.email.trim().toLowerCase(),
    password: f.password,
    firstName: f.firstName.trim(),
    lastName: f.lastName.trim(),
    dateOfBirth: f.dateOfBirth,
    phone: digits(f.phone),
    postal: f.postal.trim(),
  };
}

export default function Register() {
  const { setAuth } = useContext(MarketContext);
  const [formData, setFormData] = useState(initForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function change(e) {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  }

  async function submit(e) {
    e.preventDefault();
    const validationError = validate(formData);
    if (validationError) return setError(validationError);

    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post(
        "/users/register",
        buildPayload(formData),
      );
      // Setting auth makes the Public layout redirect to the dashboard
      setAuth(data);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto my-10 w-full md:w-2/3 lg:w-1/2 bg-orange-500 rounded-lg shadow-2xl p-6">
      <h3 className="text-white text-center text-4xl mb-5 font-bold">
        Register
      </h3>

      <form onSubmit={submit} className="space-y-6" noValidate>
        <fieldset className="space-y-3">
          <legend className="text-xl font-semibold text-white mb-2">
            Account
          </legend>
          <FormInput
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={change}
            autoComplete="email"
            required
          />
          <div className="grid gap-3 md:grid-cols-2">
            <FormInput
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={change}
              minLength={8}
              autoComplete="new-password"
              required
            />
            <FormInput
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={change}
              autoComplete="new-password"
              required
            />
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-xl font-semibold text-white mb-2">
            Personal Info
          </legend>
          <div className="grid gap-3 md:grid-cols-2">
            <FormInput
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={change}
              maxLength={50}
              autoComplete="given-name"
              required
            />
            <FormInput
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={change}
              maxLength={50}
              autoComplete="family-name"
              required
            />
            <FormInput
              label="Date of Birth"
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={change}
              max={maxDob()}
              required
            />
            <FormInput
              label="Phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={change}
              placeholder="5551234567"
              autoComplete="tel-national"
              required
            />
            <FormInput
              label="Postal Code"
              name="postal"
              value={formData.postal}
              onChange={change}
              inputMode="numeric"
              maxLength={5}
              autoComplete="postal-code"
              required
            />
          </div>
        </fieldset>

        <fieldset className="space-y-2 text-white">
          <legend className="text-xl font-semibold mb-2">Consent</legend>
          {[
            ["acceptTerms", "I accept the Terms of Service *"],
            ["acceptPrivacy", "I accept the Privacy Policy *"],
          ].map(([name, text]) => (
            <label key={name} className="flex items-center gap-2">
              <input
                type="checkbox"
                name={name}
                checked={formData[name]}
                onChange={change}
                className="h-4 w-4 accent-cyan-500"
              />
              {text}
            </label>
          ))}
        </fieldset>

        {error && (
          <p className="rounded bg-red-100 p-2 text-center text-red-700">
            {error}
          </p>
        )}

        <div className="flex items-center justify-around">
          <Link to={"/public/login"} className="text-lg text-cyan-300 underline">
            Already registered? Sign in.
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="text-lg text-white bg-cyan-500 p-2 rounded-lg shadow-2xl hover:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </div>
      </form>
    </main>
  );
}
