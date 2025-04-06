import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import logo from "../images/logo.jpeg";

const Navbar = ({
  variant = "default",
  firstName,
  showSearch = true,
  showWriteButton = true,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className={`navbar navbar--${variant}`}>
      <Link to="/" className="navbar__logo">
        <img src={logo} alt="TaleSpace Logo" />
        <span>TaleSpace</span>
      </Link>

      {showSearch && (
        <input type="text" placeholder="Search" className="navbar__search" />
      )}

      <div className="navbar__links">
        {showWriteButton && (
          <Link to="/create-book" className="navbar__button">
            Start Writing
          </Link>
        )}

        {/* Account dropdown container */}
        <div
          className="navbar__dropdown-container"
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          <div className="navbar__profile">
            <span className="navbar__icon">👤</span>
            <span className="navbar__name">{firstName}</span>
          </div>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div className="navbar__dropdown-menu">
              <Link to="/profile" className="navbar__dropdown-item">
                View Account
              </Link>
              <Link to="/settings" className="navbar__dropdown-item">
                View Settings
              </Link>
              <button
                onClick={handleLogout}
                className="navbar__dropdown-item navbar__dropdown-item--logout"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
