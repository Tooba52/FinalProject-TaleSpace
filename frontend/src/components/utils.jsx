export const validatePassword = (password) => {
  // Regular expression to validate the password
  const passwordRequirements =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

  // Test the password against the regex
  return passwordRequirements.test(password);
};
