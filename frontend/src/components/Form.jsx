import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";
import LoadingIndicator from "./LoadingIndicator";
import zxcvbn from "zxcvbn";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

// Password strength component to indicate strength levels
function PasswordStrengthIndicator({ password }) {
  const score = zxcvbn(password).score;
  const strengthLevels = ["Weak", "Fair", "Good", "Strong", "Very Strong"];

  return password ? (
    <div className={`strength-meter strength-${score}`}>
      {strengthLevels[score]}
    </div>
  ) : null;
}

function Form({ route, method }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPasswordStarted, setIsPasswordStarted] = useState(false);
  const navigate = useNavigate();

  // Determine form title based on method
  const name = method === "login" ? "Login" : "Register";

  const formTitle =
    method === "login" ? "Welcome Back!" : "Welcome To TaleSpace!";

  // Form submission logic
  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    // Password validation check
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
        ? { email, password }
        : {
            email,
            password,
            first_name: firstName,
            last_name: lastName,
            date_of_birth: dateOfBirth,
          };

    // API request handling
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
      if (error.response) {
        const errorData = error.response.data;

        if (errorData.email) {
          alert(errorData.email[0]); // Displays "Email already exists" or similar messages
        } else if (errorData.detail) {
          alert(errorData.detail); // For general API error messages
        } else {
          alert("An unknown error occurred. Please try again.");
        }
      } else {
        alert("Network error or no response from server.");
      }
    }
  };

  return (
    <div className="form-layout">
      <form onSubmit={handleSubmit} className="form-container">
        <h1>{formTitle}</h1>

        {/* Registration fields */}
        {name === "Register" && (
          <>
            <label htmlFor="firstName" className="form-label">
              First Name
            </label>
            <input
              className="form-input"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder=""
            />
            <label htmlFor="lastName" className="form-label">
              Last Name
            </label>
            <input
              className="form-input"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder=""
            />
            <label htmlFor="dob" className="form-label">
              Date of Birth
            </label>
            <input
              className="form-input dob-input"
              id="dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </>
        )}

        {/* Email input */}
        <label htmlFor="email" className="form-label">
          Email
        </label>
        <input
          className="form-input"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder=""
        />

        {/* Password input with toggle visibility */}
        <div className="password-container">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            className="form-input"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setIsPasswordStarted(true);
            }}
            placeholder=""
          />
          <span
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
          </span>
        </div>

        {/* Password strength indicator for registration */}
        {name === "Register" && isPasswordStarted && (
          <PasswordStrengthIndicator password={password} />
        )}

        {/* "Remember me" and "Forgot password?" for login */}
        {name === "Login" && (
          <div className="options-container">
            <div className="remember-me">
              <label htmlFor="rememberMe">
                Remember me
                <label className="toggle-switch">
                  <input type="checkbox" id="rememberMe" />
                  <span className="slider"></span>
                </label>
              </label>
            </div>

            <div className="forgot-password">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
          </div>
        )}

        {loading && <LoadingIndicator />}

        {/* Form submit button */}
        <button className="form-button" type="submit">
          {name}
        </button>

        {/* Account navigation links */}
        {name === "Login" && (
          <p className="links">
            Don't have an account? <Link to="/register">Sign up now</Link>
          </p>
        )}
        {name === "Register" && (
          <p className="links">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        )}
      </form>
    </div>
  );
}

export default Form;
