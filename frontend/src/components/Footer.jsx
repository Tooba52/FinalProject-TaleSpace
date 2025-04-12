import React from "react";
import "../styles/Footer.css";
import { useDarkMode } from "./DarkModeContext";
import { FaGithub, FaTwitter, FaInstagram, FaBook } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

const Footer = () => {
  const { darkMode } = useDarkMode();

  return (
    <footer className={`app-footer ${darkMode ? "dark-mode" : ""}`}>
      <div className="footer-content">
        <div className="footer-section">
          <h3 className="footer-heading">
            <FaBook className="footer-icon" /> TaleSpace
          </h3>
          <p>
            Your platform for discovering and sharing stories with the world.
          </p>
          <div className="social-icons">
            <span aria-label="GitHub">
              <FaGithub />
            </span>
            <span aria-label="Twitter">
              <FaTwitter />
            </span>
            <span aria-label="Instagram">
              <FaInstagram />
            </span>
          </div>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">Quick Links</h3>
          <ul className="footer-links">
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/profile">Profile</a>
            </li>
            <li>
              <a href="/settings">Settings</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">Contact Us</h3>
          <div className="contact-info">
            <p>
              <MdEmail /> support@talespace.com
            </p>
            <p>123 Story Road, Bookville</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 TaleSpace Inc. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
