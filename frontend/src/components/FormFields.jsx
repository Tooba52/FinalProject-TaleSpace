// Form fields
const FormFields = ({
  method,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  dateOfBirth,
  setDateOfBirth,
}) => {
  // If the method is "login", return null
  if (method === "login") {
    return null; 
  }

  // If the method is "register", return  fields for first name, last name, and date of birth
  return (
    <>
      {/* First Name Input */}
      <label htmlFor="firstName" className="loginform-label">
        First Name
      </label>
      <input
        className="loginform-input"
        type="text"
        value={firstName} 
        onChange={(e) => setFirstName(e.target.value)}
      />

      {/* Last Name Input */}
      <label htmlFor="lastName" className="loginform-label">
        Last Name
      </label>
      <input
        className="loginform-input"
        type="text"
        value={lastName} 
        onChange={(e) => setLastName(e.target.value)} 
      />

      {/* Date of Birth Input */}
      <label htmlFor="dob" className="loginform-label">
        Date of Birth
      </label>
      <input
        className="loginform-input dob-input"
        id="dob"
        type="date"
        value={dateOfBirth} 
        onChange={(e) => setDateOfBirth(e.target.value)} 
      />
    </>
  );
};

export default FormFields;
