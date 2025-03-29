// Functional component for form fields, accepts props for managing input values and method type
const FormFields = ({
  method,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  dateOfBirth,
  setDateOfBirth,
}) => {
  // If the method is "login", return null, as no extra fields are needed for login
  if (method === "login") {
    return null; // No extra fields for login
  }

  // If the method is "register", return the fields for first name, last name, and date of birth
  return (
    <>
      {/* First Name Input */}
      <label htmlFor="firstName" className="form-label">
        First Name
      </label>
      <input
        className="form-input"
        type="text"
        value={firstName} // Controlled input using state value
        onChange={(e) => setFirstName(e.target.value)} // Update state with user input
      />

      {/* Last Name Input */}
      <label htmlFor="lastName" className="form-label">
        Last Name
      </label>
      <input
        className="form-input"
        type="text"
        value={lastName} // Controlled input using state value
        onChange={(e) => setLastName(e.target.value)} // Update state with user input
      />

      {/* Date of Birth Input */}
      <label htmlFor="dob" className="form-label">
        Date of Birth
      </label>
      <input
        className="form-input dob-input"
        id="dob"
        type="date" // Input type set to date for date picker
        value={dateOfBirth} // Controlled input using state value
        onChange={(e) => setDateOfBirth(e.target.value)} // Update state with user input
      />
    </>
  );
};

export default FormFields; // Export the component for use in other parts of the app
