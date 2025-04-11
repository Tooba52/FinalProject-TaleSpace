import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import "../styles/Settings.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { validatePassword } from "../components/utils";
import PasswordStrengthIndicator from "../components/PasswordStrengthIndicator";

function Settings() {
  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [isPasswordStarted, setIsPasswordStarted] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/api/user/profile/");
      setUserData({
        first_name: response.data.first_name || "",
        last_name: response.data.last_name || "",
        email: response.data.email || "",
      });
    } catch (err) {
      console.error("Error fetching user profile", err);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setPasswordError(null);

    try {
      // Validate password if changing
      if (showPasswordFields && passwordData.new_password) {
        if (!validatePassword(passwordData.new_password)) {
          setPasswordError(
            "Password must be at least 8 characters long and include: uppercase, lowercase, a number, and a special character"
          );
          return;
        }
        if (passwordData.new_password !== passwordData.confirm_password) {
          setPasswordError("New passwords don't match");
          return;
        }
      }

      // Prepare data to send
      const dataToSend = {
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
      };

      // Include password data if changing
      if (showPasswordFields) {
        dataToSend.current_password = passwordData.current_password;
        dataToSend.new_password = passwordData.new_password;
      }

      // Send the request
      await api.put("/api/user/profile/", dataToSend);

      // Reset form on success
      setShowPasswordFields(false);
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setIsPasswordStarted(false);
      setPasswordError(null);

      alert("Settings saved successfully!");
    } catch (err) {
      console.error("Error saving settings", err);

      // Clear sensitive password fields on error
      setPasswordData((prev) => ({
        ...prev,
        current_password: "",
        new_password: "",
        confirm_password: "",
      }));

      setError(
        err.response?.data?.error || err.message || "Failed to save settings"
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear password error when user starts typing
    if (passwordError) setPasswordError(null);

    if (name === "new_password") {
      setIsPasswordStarted(value.length > 0);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmed) return;

    const currentPassword = prompt(
      "Please enter your current password to confirm deletion:"
    );
    if (!currentPassword) return;

    try {
      const response = await api.delete("/api/user/delete-account/", {
        data: { current_password: currentPassword },
      });

      // Clear all auth tokens
      localStorage.removeItem("ACCESS_TOKEN");
      localStorage.removeItem("REFRESH_TOKEN");

      // Force full page reload to clear all state
      window.location.href = "/login";
    } catch (err) {
      console.error("Account deletion error:", err.response?.data);

      // Handle specific error cases
      if (err.response?.status === 401) {
        setError("Incorrect password. Please try again.");
      } else {
        setError(
          err.response?.data?.error ||
            "Account deletion failed. Please try again."
        );
      }

      // Even if error, clear sensitive data
      localStorage.removeItem("ACCESS_TOKEN");
      localStorage.removeItem("REFRESH_TOKEN");
      window.location.href = "/login";
    }
  };

  const togglePasswordFields = () => {
    setShowPasswordFields(!showPasswordFields);
    setPasswordError(null);
    if (!showPasswordFields) {
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setIsPasswordStarted(false);
    }
  };

  if (loading) {
    return <div className="settings-page">Loading...</div>;
  }

  return (
    <div className={`settings-page ${darkMode ? "dark-mode" : ""}`}>
      <Navbar variant="transparent" firstName={userData.first_name} />
      <div className="settings-container">
        <h2>Account Settings</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="settings-form">
          {/* Profile Section */}
          <section className="settings-section">
            <h3>Profile Information</h3>
            <div className="form-group">
              <label htmlFor="first_name">First Name</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={userData.first_name}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name">Last Name</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={userData.last_name}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={userData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="darkMode"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
              />
              <label htmlFor="darkMode">Dark mode</label>
            </div>
          </section>

          {/* Password Change Section */}
          <section className="settings-section">
            <h3>Account Actions</h3>
            <div className="form-group">
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

            {showPasswordFields && (
              <>
                <div className="form-group">
                  <label htmlFor="current_password">Current Password</label>
                  <input
                    type="password"
                    id="current_password"
                    name="current_password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="new_password">New Password</label>
                  <input
                    type="password"
                    id="new_password"
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                  />
                  {isPasswordStarted && (
                    <PasswordStrengthIndicator
                      password={passwordData.new_password}
                    />
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="confirm_password">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirm_password"
                    name="confirm_password"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                  />
                </div>

                {/* Password requirements error */}
                {passwordError && (
                  <div className="password-error-message">{passwordError}</div>
                )}
              </>
            )}

            <div className="form-group">
              <button
                className="action-link danger"
                onClick={handleDeleteAccount}
              >
                Delete Account
              </button>
            </div>
          </section>

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
