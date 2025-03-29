export const validatePassword = (password) => {
  // Regular expression to validate the password
  const passwordRequirements =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  // Test the password against the regex
  return passwordRequirements.test(password);
};

export const logout = () => {
  // Clear tokens from localStorage
  localStorage.removeItem(ACCESS_TOKEN);
  localStorage.removeItem(REFRESH_TOKEN);

  // Optionally, redirect to login page
  window.location.href = "/login";
};
