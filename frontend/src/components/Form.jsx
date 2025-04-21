// Code resued from: 
// Author: Tech With Tim
// Video Title: Django & React Web App Tutorial - Authentication, Databases, Deployment & More...
// Video Link:  https://www.youtube.com/watch?v=c-QsfbznSXI 
// Code reused Lines - 7-156, changes made include ??

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";
import LoadingIndicator from "./LoadingIndicator";
import { validatePassword } from "./utils";
import PasswordField from "./PasswordField";
import FormFields from "./FormFields";

// form for login or registration
const Form = ({ route, method }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPasswordStarted, setIsPasswordStarted] = useState(false);
  const navigate = useNavigate();

  // determine form based on method (login or register)
  const name = method === "login" ? "Login" : "Register";
  const formTitle =
    method === "login" ? "Welcome Back!" : "Welcome To TaleSpace!";

  // handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // password validation check
    if (!validatePassword(password)) {
      setLoading(false);
      alert(
        "Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character."
      );
      return;
    }

    // create payload based on method (login or register)
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
      // start API request
      const res = await api.post(route, payload);
      setLoading(false);

      if (method === "login") {
        // iif login is successful, store tokens
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/"); // redirect to the home page
      } else {
        navigate("/login"); // redirect to the login page after registration
      }
    } catch (error) {
      setLoading(false); // stop loading after API call ends (error or success)

      // error handeling
      if (error.response) {
        const errorData = error.response.data;

        if (error.response.status === 401) {
          alert("Incorrect email or password.");
        } else if (errorData.email) {
          const emailError = errorData.email[0];
          if (emailError === "Account with this email does not exist.") {
            alert("Account does not exist.");
          } else if (emailError === "user with this email already exists.") {
            alert("An account with this email already exists.");
          } else {
            alert(emailError);
          }
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
        {/* registration fields (only shown for register) */}
        <FormFields
          method={method}
          firstName={firstName}
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
          dateOfBirth={dateOfBirth}
          setDateOfBirth={setDateOfBirth}
        />
        {/* email field */}
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
        {/* password field */}
        <PasswordField
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          password={password}
          setPassword={setPassword}
          setIsPasswordStarted={setIsPasswordStarted}
        />
        {/* submit button */}
        <button className="loginform-button" type="submit">
          {name}
        </button>
        {loading && <LoadingIndicator />}
        {/* form footer links */}
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
