import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import "../styles/Settings.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Settings() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [bio, setBio] = useState("");

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = () => {
    api
      .get("/api/user/profile/")
      .then((res) => {
        setFirstName(res.data.first_name);
        setEmail(res.data.email || "");
        setBio(res.data.bio || "");
      })
      .catch((err) => console.error("Error fetching user profile", err));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    api
      .put("/api/user/profile/", {
        first_name: firstName,
        email,
        bio,
      })
      .then(() => {
        alert("Settings saved successfully!");
      })
      .catch((err) => console.error("Error saving settings", err));
  };

  return (
    <div className={`settings-page ${darkMode ? "dark-mode" : ""}`}>
      <Navbar variant="transparent" firstName={firstName} />
      <div className="settings-container">
        <h2>Account Settings</h2>

        <form onSubmit={handleSubmit} className="settings-form">
          {/* Profile Section */}
          <section className="settings-section">
            <h3>Profile Information</h3>
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows="4"
              />
            </div>
          </section>

          {/* Preferences Section */}
          <section className="settings-section">
            <h3>Preferences</h3>
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="notifications"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
              />
              <label htmlFor="notifications">Enable email notifications</label>
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

          {/* Account Actions */}
          <section className="settings-section">
            <h3>Account Actions</h3>
            <div className="form-group">
              <Link to="/change-password" className="action-link">
                Change Password
              </Link>
            </div>
            <div className="form-group">
              <Link to="/delete-account" className="action-link danger">
                Delete Account
              </Link>
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
