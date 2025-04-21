import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

// passwordField component
const PasswordField = ({
  showPassword,
  setShowPassword,
  password,
  setPassword,
  setIsPasswordStarted,
}) => (
  <div className="password-container">
    {/* label for password input field */}
    <label htmlFor="password" className="loginform-label">
      Password
    </label>
    {/* password input field */}
    <input
      className="loginform-input"
      type={showPassword ? "text" : "password"}
      value={password}
      onChange={(e) => {
        setPassword(e.target.value);
        setIsPasswordStarted(true);
      }}
    />
    {/* password visibility toggle button */}
    <span
      className="password-toggle"
      onClick={() => setShowPassword(!showPassword)}
    >
      {/* display correct icon*/}
      <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
    </span>
  </div>
);

export default PasswordField;
