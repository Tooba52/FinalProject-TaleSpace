import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";
import LoadingIndicator from "./LoadingIndicator";
import zxcvbn from "zxcvbn";

function PasswordStrengthIndicator({ password }) {
  const score = zxcvbn(password).score;
  const strengthLevels = ["Weak", "Fair", "Good", "Strong", "Very Strong"];

  return password ? ( // Only show if password exists
    <div className={`strength-meter strength-${score}`}>
      {strengthLevels[score]}
    </div>
  ) : null; // Hide meter if no password is entered
}

function Form({ route, method }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPasswordStarted, setIsPasswordStarted] = useState(false); // New state for tracking password entry
  const navigate = useNavigate();

  const name = method === "login" ? "Login" : "Register";

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    const passwordRequirements =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRequirements.test(password)) {
      alert(
        "Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character."
      );
      return;
    }

    const payload =
      method === "login"
        ? { email, password } // Only include these for login
        : {
            email,
            password,
            first_name: firstName,
            last_name: lastName,
            date_of_birth: dateOfBirth,
          }; // Include full data for registration

    try {
      const res = await api.post(route, payload);
      if (method === "login") {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/");
      } else {
        navigate("/login");
      }
    } catch (error) {
      alert(error.response?.data?.detail || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h1>{name}</h1>

      {name === "Register" && (
        <>
          <input
            className="form-input"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First Name"
          />
          <input
            className="form-input"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last Name"
          />
          <input
            className="form-input"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            placeholder="Date of Birth"
          />
        </>
      )}

      <input
        className="form-input"
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        className="form-input"
        type="password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setIsPasswordStarted(true); // Activate meter only after typing starts
        }}
        placeholder="Password"
      />

      {/* Show the strength meter ONLY for registration and after password entry begins */}
      {name === "Register" && isPasswordStarted && (
        <PasswordStrengthIndicator password={password} />
      )}

      {loading && <LoadingIndicator />}
      <button className="form-button" type="submit">
        {name}
      </button>
    </form>
  );
}

export default Form;
