import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "../styles/Navbar.css";
import logo from "../images/logo.jpeg";

const Navbar = ({
  variant = "default",
  firstName,
  showSearch = true,
  showWriteButton = true,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(""); // Properly initialize state

  // Sample genres - replace with your actual genres or fetch from API
  const genres = [
    "Thriller",
    "Romance",
    "Action",
    "Mystery",
    "Fantasy",
    "Adventure",
    "Horror",
    "Sci-Fi",
    "Comedy",
    "Historical",
    "Drama",
    "Dystopian",
    "Supernatural",
    "Paranormal",
    "Crime",
    "Suspense",
    "Cyberpunk",
    "Steampunk",
    "Fairy Tale",
    "Mythology",
    "Gothic",
    "Post-Apocalyptic",
    "Slice of Life",
    "Fiction",
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  return (
    <nav className={`navbar navbar--${variant}`}>
      <Link to="/" className="navbar__logo">
        <img src={logo} alt="TaleSpace Logo" />
        <span>TaleSpace</span>
      </Link>

      {/* Updated Genre Dropdown with correct links */}
      <div
        className="navbar__genre-dropdown"
        onMouseEnter={() => setIsGenreDropdownOpen(true)}
        onMouseLeave={() => setIsGenreDropdownOpen(false)}
      >
        <button className="navbar__genre-button">
          Browse <span>▼</span>
        </button>

        {isGenreDropdownOpen && (
          <div className="navbar__genre-menu">
            {genres.map((genre) => (
              <Link
                key={genre}
                to={`/browse/${genre.toLowerCase().replace(/\s+/g, "-")}`} // Updated to use /browse/:genreName
                className="navbar__genre-item"
                onClick={() => setIsGenreDropdownOpen(false)} // Close dropdown when a genre is selected
              >
                {genre}
              </Link>
            ))}
          </div>
        )}
      </div>

      {showSearch && (
        <form onSubmit={handleSearch} className="navbar__search-form">
          <input
            type="text"
            placeholder="Search"
            className="navbar__search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="navbar__search-button">
            <span role="img" aria-label="search">
              🔍
            </span>
          </button>
        </form>
      )}

      <div className="navbar__links">
        {showWriteButton && (
          <Link to="/create-book" className="navbar__button">
            Start Writing
          </Link>
        )}

        {/* Existing Account dropdown */}
        <div
          className="navbar__dropdown-container"
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          <div className="navbar__profile">
            <span className="navbar__icon">👤</span>
            <span className="navbar__name">{firstName}</span>
          </div>

          {isDropdownOpen && (
            <div className="navbar__dropdown-menu">
              <Link
                to="/profile"
                className="navbar__dropdown-item"
                onClick={() => setIsDropdownOpen(false)}
              >
                View Account
              </Link>
              <Link
                to="/settings"
                className="navbar__dropdown-item"
                onClick={() => setIsDropdownOpen(false)}
              >
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
