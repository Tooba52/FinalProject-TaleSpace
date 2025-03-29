import { useState } from "react"; // Import React's useState hook
import { Link, useNavigate } from "react-router-dom"; // Import Link for navigation and useNavigate for programmatic navigation
import api from "../api"; // Import the API instance to make requests
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants"; // Import constants for token storage
import "../styles/Form.css"; // Import CSS styles
import LoadingIndicator from "./LoadingIndicator"; // Import LoadingIndicator component
import { validatePassword } from "./utils"; // Import the password validation utility
import PasswordStrengthIndicator from "./PasswordStrengthIndicator"; // Import PasswordStrengthIndicator component
import PasswordField from "./PasswordField"; // Import PasswordField component
import FormFields from "./FormFields"; // Import FormFields component to render additional user info for registration

function Form({ route, method }) {
  // State variables to manage form inputs
  const [email, setEmail] = useState(""); // For email input field
  const [password, setPassword] = useState(""); // For password input field
  const [showPassword, setShowPassword] = useState(false); // Toggle for password visibility
  const [firstName, setFirstName] = useState(""); // For first name input (only for registration)
  const [lastName, setLastName] = useState(""); // For last name input (only for registration)
  const [dateOfBirth, setDateOfBirth] = useState(""); // For date of birth input (only for registration)
  const [loading, setLoading] = useState(false); // Loading state for API requests
  const [isPasswordStarted, setIsPasswordStarted] = useState(false); // To track if password field has been modified
  const navigate = useNavigate(); // Hook to programmatically navigate to different routes

  // Determine form title based on method (login or register)
  const name = method === "login" ? "Login" : "Register";
  const formTitle =
    method === "login" ? "Welcome Back!" : "Welcome To TaleSpace!";

  // Handle form submission
  const handleSubmit = async (e) => {
    setLoading(true); // Set loading to true when the form is submitted
    e.preventDefault(); // Prevent default form submission behavior

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

    // Make the API request
    try {
      const res = await api.post(route, payload); // Send request with appropriate payload
      if (method === "login") {
        localStorage.setItem(ACCESS_TOKEN, res.data.access); // Store the access token on successful login
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh); // Store the refresh token

        navigate("/"); // Redirect to the home page after login
      } else {
        navigate("/login"); // Redirect to the login page after successful registration
      }
    } catch (error) {
      // Handle error if API request fails
      if (error.response) {
        const errorData = error.response.data;
        if (errorData.email) {
          alert(errorData.email[0]); // If email already exists, display the error message
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
        {/* Render additional fields for registration only */}
        <FormFields
          method={method}
          firstName={firstName}
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
          dateOfBirth={dateOfBirth}
          setDateOfBirth={setDateOfBirth}
        />
        {/* Email input field */}
        <label htmlFor="email" className="form-label">
          Email
        </label>
        <input
          className="form-input"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)} // Update email state on change
          placeholder=""
        />
        {/* Password input field with visibility toggle */}
        <PasswordField
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          password={password}
          setPassword={setPassword}
          setIsPasswordStarted={setIsPasswordStarted}
        />
        {/* Show password strength indicator for registration */}
        {method === "register" && isPasswordStarted && (
          <PasswordStrengthIndicator password={password} />
        )}
        {/* "Remember me" and "Forgot password?" for login */}
        {method === "login" && (
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
        {loading && <LoadingIndicator />}{" "}
        {/* Show loading indicator while waiting for API response */}
        {/* Submit button */}
        <button className="form-button" type="submit">
          {name}
        </button>
        {/* Links for switching between login and registration */}
        {method === "login" && (
          <p className="links">
            Don't have an account? <Link to="/register">Sign up now</Link>
          </p>
        )}
        {method === "register" && (
          <p className="links">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        )}
      </form>
    </div>
  );
}

export default Form;
