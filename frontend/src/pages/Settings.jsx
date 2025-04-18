import { useState, useEffect } from "react";
import api from "../api";
import "../styles/Settings.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { validatePassword } from "../components/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

function Settings() {
  // State for user profile data and UI handling
  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordError, setPasswordError] = useState(null);

  // Fetch user profile data when component mounts
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Function to fetch user's profile data from API
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("access");
      if (!token) return; // If no token, don't fetch
      const res = await api.get("/api/user/profile/");
      setUserData({
        first_name: res.data.first_name || "",
        last_name: res.data.last_name || "",
        email: res.data.email || "",
      });
    } catch {
      setError("Failed to load profile data.");
    } finally {
      setLoading(false); // Stop loading after data fetch
    }
  };

  // Handle form submission, updating profile or password
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setPasswordError(null);

    // If password fields are shown, validate password
    if (showPasswordFields && passwordData.new_password) {
      if (!validatePassword(passwordData.new_password)) {
        setPasswordError("Password must be stronger.");
        return;
      }
      if (passwordData.new_password !== passwordData.confirm_password) {
        setPasswordError("Passwords do not match.");
        return;
      }
    }

    // Data to send to the backend
    const dataToSend = {
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
    };

    // If password fields are shown, include password data
    if (showPasswordFields) {
      dataToSend.current_password = passwordData.current_password;
      dataToSend.new_password = passwordData.new_password;
    }

    try {
      // API call to update user profile data
      await api.put("/api/user/profile/", dataToSend);
      setShowPasswordFields(false); // Hide password fields after update
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setPasswordError(null);
      alert("Settings updated.");
    } catch {
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setError("Failed to update settings.");
    }
  };

  // Handle input changes for user profile fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle input changes for password fields
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Function to handle account deletion
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm("Delete account permanently?");
    if (!confirmed) return;

    const currentPassword = prompt("Enter current password to confirm:");
    if (!currentPassword) return;

    try {
      const res = await api.delete("/api/user/delete-account/", {
        data: { current_password: currentPassword },
        validateStatus: () => true,
      });

      // Handle account deletion success/failure
      if (res.status === 200 || res.status === 204) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        alert("Account deleted.");
        window.location.href = "/login";
      } else if (res.status === 401) {
        setError("Incorrect password.");
        alert("Incorrect password.");
      } else {
        setError("Could not delete account.");
        alert("Deletion failed.");
      }
    } catch {
      setError("Unexpected error occurred.");
      alert("Something went wrong.");
    }
  };

  // Toggle visibility of password fields
  const togglePasswordFields = () => {
    setShowPasswordFields(!showPasswordFields);
    setPasswordError(null);
    if (!showPasswordFields) {
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    }
  };

  // Loading state handling
  if (loading) {
    return <div className="settings-page">Loading...</div>;
  }

  return (
    <div className="settings-page">
      <Navbar />
      <div className="settings-container">
        <h2>Account Settings</h2>

        {/* Display error message if there's an error */}
        {error && <div className="error-message">{error}</div>}

        {/* Settings form */}
        <form onSubmit={handleSubmit} className="settings-form">
          {/* Profile information section */}
          <section className="settings-section">
            <h3>Profile Information</h3>
            <div className="settings-form-group">
              <label htmlFor="first_name">First Name</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={userData.first_name}
                onChange={handleInputChange}
              />
            </div>

            <div className="settings-form-group">
              <label htmlFor="last_name">Last Name</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={userData.last_name}
                onChange={handleInputChange}
              />
            </div>

            <div className="settings-form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={userData.email}
                onChange={handleInputChange}
              />
            </div>
          </section>

          {/* Account actions section */}
          <section className="settings-section">
            <h3>Account Actions</h3>
            <div className="settings-form-group">
              <button
                type="button"
                className="action-link"
                onClick={togglePasswordFields}
              >
                {showPasswordFields
                  ? "Cancel Password Change"
                  : "Change Password"}
              </button>
            </div>

            {/* Show password change fields if toggled */}
            {showPasswordFields && (
              <>
                {/* Current password field */}
                <div className="form-group password-container">
                  <label htmlFor="current_password">Current Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      id="current_password"
                      name="current_password"
                      value={passwordData.current_password}
                      onChange={handlePasswordChange}
                    />
                    <span
                      className="password-toggle"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                    >
                      <FontAwesomeIcon
                        icon={showCurrentPassword ? faEyeSlash : faEye}
                      />
                    </span>
                  </div>
                </div>

                {/* New password field */}
                <div className="form-group password-container">
                  <label htmlFor="new_password">New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="new_password"
                      name="new_password"
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                    />
                    <span
                      className="password-toggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      <FontAwesomeIcon
                        icon={showNewPassword ? faEyeSlash : faEye}
                      />
                    </span>
                  </div>
                </div>

                {/* Confirm new password field */}
                <div className="form-group password-container">
                  <label htmlFor="confirm_password">Confirm New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirm_password"
                      name="confirm_password"
                      value={passwordData.confirm_password}
                      onChange={handlePasswordChange}
                    />
                    <span
                      className="password-toggle"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      <FontAwesomeIcon
                        icon={showConfirmPassword ? faEyeSlash : faEye}
                      />
                    </span>
                  </div>
                </div>

                {/* Display password errors */}
                {passwordError && (
                  <div className="password-error-message">{passwordError}</div>
                )}
              </>
            )}

            {/* Delete account button */}
            <div className="settings-form-group">
              <button
                type="button"
                className="Settings-delete"
                onClick={handleDeleteAccount}
              >
                Delete Account
              </button>
            </div>
          </section>

          {/* Submit button */}
          <button type="submit" className="save-button">
            Save Changes
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
}

export default Settings;
