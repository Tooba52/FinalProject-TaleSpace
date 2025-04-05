import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"; 

// PasswordField component
const PasswordField = ({
  showPassword,
  setShowPassword,
  password,
  setPassword,
  setIsPasswordStarted,
}) => (
  <div className="password-container">
    {/* Label for the password input field */}
    <label htmlFor="password" className="loginform-label">
      Password
    </label>
    {/* Password input field */}
    <input
      className="loginform-input"
      type={showPassword ? "text" : "password"} 
      value={password} 
      onChange={(e) => {
        setPassword(e.target.value); 
        setIsPasswordStarted(true); 
      }}
      placeholder="" 
    />
    {/* Password visibility toggle button */}
    <span
      className="password-toggle"
      onClick={() => setShowPassword(!showPassword)} 
    >
      {/* Display the appropriate icon*/}
      <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
    </span>
  </div>
);

export default PasswordField;
