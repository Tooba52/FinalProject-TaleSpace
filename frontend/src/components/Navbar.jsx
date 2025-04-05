import React from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";
import logo from "../images/logo.jpeg";

// Navbar component
const Navbar = ({
  variant = "default",
  firstName,
  showSearch = true,
  showWriteButton = true,
}) => {
  return (
    // Main navbar container with dynamic class based on variant
    <nav className={`navbar navbar--${variant}`}>
      {/* Logo linking to home page */}
      <Link to="/" className="navbar__logo">
        <img src={logo} alt="TaleSpace Logo" />
        <span>TaleSpace</span>
      </Link>

      {/* Conditionally rendered search bar */}
      {showSearch && (
        <input type="text" placeholder="Search" className="navbar__search" />
      )}

      {/* Right-side navigation links */}
      <div className="navbar__links">
        {/* Conditionally rendered "Start Writing" button */}
        {showWriteButton && (
          <Link to="/create-book" className="navbar__button">
            Start Writing
          </Link>
        )}
        {/* Profile link with icon and user's name */}
        <Link to="/profile" className="navbar__profile">
          <span className="navbar__icon">👤</span>
          <span className="navbar__name">{firstName}</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
