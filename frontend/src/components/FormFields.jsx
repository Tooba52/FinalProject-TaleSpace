// form fields
const FormFields = ({
  method,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  dateOfBirth,
  setDateOfBirth,
}) => {
  // if method is "login", return null
  if (method === "login") {
    return null;
  }

  // if method is "register", return fields
  return (
    <>
      {/* first Name Input */}
      <label htmlFor="firstName" className="loginform-label">
        First Name
      </label>
      <input
        className="loginform-input"
        type="text"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />

      {/* last Name Input */}
      <label htmlFor="lastName" className="loginform-label">
        Last Name
      </label>
      <input
        className="loginform-input"
        type="text"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />

      {/* date of Birth Input */}
      <label htmlFor="dob" className="loginform-label">
        Date of Birth
      </label>
      <input
        className="loginform-input dob-input"
        id="dob"
        type="date"
        value={dateOfBirth}
        onChange={(e) => setDateOfBirth(e.target.value)}
        max={new Date().toISOString().split("T")[0]}
        min="1900-01-01"
      />
    </>
  );
};

export default FormFields;
