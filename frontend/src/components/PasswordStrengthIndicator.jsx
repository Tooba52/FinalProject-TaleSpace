import React from "react"; // Import React to create a functional component
import zxcvbn from "zxcvbn"; // Import the zxcvbn library for password strength estimation

// Password strength component to indicate strength levels
function PasswordStrengthIndicator({ password }) {
  // Calculate the strength score of the password using zxcvbn
  const score = zxcvbn(password).score;

  // Define the strength levels based on the score (0 to 4)
  const strengthLevels = ["Weak", "Fair", "Good", "Strong", "Very Strong"];

  // Return a div displaying the strength level if a password is provided
  return password ? (
    <div className={`strength-meter strength-${score}`}>
      {/* Display the corresponding strength level based on the score */}
      {strengthLevels[score]}
    </div>
  ) : null; // If no password is provided, render nothing
}

export default PasswordStrengthIndicator; // Export the component for use in other files
