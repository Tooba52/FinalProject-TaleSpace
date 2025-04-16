import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";
import LoadingIndicator from "./LoadingIndicator";
import { validatePassword } from "./utils";
import PasswordField from "./PasswordField";
import FormFields from "./FormFields";

// Form component for login or registration
const Form = ({ route, method }) => {
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPasswordStarted, setIsPasswordStarted] = useState(false);
  const navigate = useNavigate();

  // Determine form title based on method (login or register)
  const name = method === "login" ? "Login" : "Register";
  const formTitle =
    method === "login" ? "Welcome Back!" : "Welcome To TaleSpace!";

  // Handle form submission
  const handleSubmit = async (e) => {
    setLoading(true); //
    e.preventDefault();

    // Password validation check using the imported utility function
    if (!validatePassword(password)) {
      alert(
        "Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character."
      );
      return;
    }

    // Create the payload based on the method (login or register)
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

    try {
      const res = await api.post(route, payload);
      if (method === "login") {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);

        navigate("/"); // Redirect to the home page after login
      } else {
        navigate("/login"); // Redirect to the login page after successful registration
      }
    } catch (error) {
      if (error.response) {
        const errorData = error.response.data;
        if (errorData.email) {
          alert(errorData.email[0]);
        } else if (errorData.detail) {
          alert(errorData.detail);
        } else {
          alert("An unknown error occurred. Please try again.");
        }
      } else {
        alert("Network error or no response from server.");
      }
    }
  };

  return (
    <div className="loginform-layout">
      <form onSubmit={handleSubmit} className="loginform-container">
        <h1>{formTitle}</h1>
        {/* Registration fields (only shown for register) */}
        <FormFields
          method={method}
          firstName={firstName}
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
          dateOfBirth={dateOfBirth}
          setDateOfBirth={setDateOfBirth}
        />
        {/* Email field */}
        <label htmlFor="email" className="loginform-label">
          Email
        </label>
        <input
          className="loginform-input"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder=""
        />
        {/* Password field */}
        <PasswordField
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          password={password}
          setPassword={setPassword}
          setIsPasswordStarted={setIsPasswordStarted}
        />
        {/* Login options */}
        {method === "login" && (
          <div className="forgot-password">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
        )}
        {/* Submit button */}
        <button className="loginform-button" type="submit">
          {name}
        </button>
        {loading && <LoadingIndicator />}
        {/* Form footer links */}
        {method === "login" && (
          <p className="login-links">
            Don't have an account? <Link to="/register">Sign up now</Link>
          </p>
        )}
        {method === "register" && (
          <p className="login-links">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        )}
      </form>
    </div>
  );
};

export default Form;
