export const validatePassword = (password) => {
  // regular expression to validate  password
  const passwordRequirements =
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#\?!@\$%\^&\*-]).{8,}$/;
  // test the password against the regex
  return passwordRequirements.test(password);
};
