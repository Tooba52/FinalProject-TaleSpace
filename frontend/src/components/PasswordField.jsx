import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Import FontAwesomeIcon for displaying the eye icon
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"; // Import specific icons (eye and eye-slash)

// PasswordField component handles displaying the password field with toggleable visibility
const PasswordField = ({
  showPassword,
  setShowPassword,
  password,
  setPassword,
  setIsPasswordStarted,
}) => (
  <div className="password-container">
    {/* Label for the password input field */}
    <label htmlFor="password" className="form-label">
      Password
    </label>
    {/* Password input field */}
    <input
      className="form-input"
      type={showPassword ? "text" : "password"} // Toggle between text (visible) and password (hidden) based on showPassword state
      value={password} // Controlled input: the value of the input is tied to the state variable password
      onChange={(e) => {
        setPassword(e.target.value); // Update the password state whenever the user types
        setIsPasswordStarted(true); // Set that the user has started typing the password
      }}
      placeholder="" // Placeholder is kept empty here (optional)
    />
    {/* Password visibility toggle button */}
    <span
      className="password-toggle"
      onClick={() => setShowPassword(!showPassword)} // Toggle showPassword state when clicked
    >
      {/* Display the appropriate icon: eye (visible password) or eye-slash (hidden password) */}
      <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
    </span>
  </div>
);

export default PasswordField; // Export the PasswordField component to use in other parts of the app
