import React from "react"; 
import zxcvbn from "zxcvbn"; 

// Password strength component to indicate strength levels
function PasswordStrengthIndicator({ password }) {
  // Calculate the strength score
  const score = zxcvbn(password).score;

  // Define the strength levels
  const strengthLevels = ["Weak", "Fair", "Good", "Strong", "Very Strong"];

  return password ? (
    <div className={`strength-meter strength-${score}`}>
      {/* Display strength level based on score */}
      {strengthLevels[score]}
    </div>
  ) : null; //
}

export default PasswordStrengthIndicator; 
