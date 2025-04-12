import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import "../styles/Navbar.css";
import logo from "../images/logo.jpeg";
import api from "../api";

const Navbar = ({
  variant = "default",
  showSearch = true,
  showWriteButton = true,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Sample genres - replace with your actual genres or fetch from API
  const genres = [
    "Action",
    "Adventure",
    "Animal",
    "Comedy",
    "Crime",
    "Cyberpunk",
    "Drama",
    "Dystopian",
    "Fairy Tale",
    "Fiction",
    "Fantasy",
    "Gothic",
    "Heartbreak",
    "Horror",
    "Historical",
    "Musical",
    "Mythology",
    "Mystery",
    "Paranormal",
    "Post-Apocalyptic",
    "Romance",
    "Sci-Fi",
    "Slice of Life",
    "Sports",
    "Steampunk",
    "Supernatural",
    "Thriller",
  ];

  useEffect(() => {
    // Fetch user profile when component mounts
    const fetchUserProfile = () => {
      api
        .get("/api/user/profile/")
        .then((res) => {
          setFirstName(res.data.first_name);
        })
        .catch((err) => console.error("Error fetching user profile", err));
    };

    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}&type=books`);
      setSearchQuery("");
    }
  };
  return (
    <nav className={`navbar navbar--${variant}`}>
      <Link to="/" className="navbar__logo">
        <img src={logo} alt="TaleSpace Logo" />
        <span>TaleSpace</span>
      </Link>

      {/* Genre Dropdown remains unchanged */}
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
                to={`/browse/${genre.toLowerCase().replace(/\s+/g, "-")}`}
                className="navbar__genre-item"
                onClick={() => setIsGenreDropdownOpen(false)}
              >
                {genre}
              </Link>
            ))}
          </div>
        )}
      </div>

      {showSearch && (
        <form onSubmit={handleSearch} className="navbar__search-container">
          <div className="navbar__search-wrapper">
            <input
              type="text"
              placeholder="Search"
              className="navbar__search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="navbar__search-button">
              <FaSearch aria-label="search" />
            </button>
          </div>
        </form>
      )}

      {/* Rest of the navbar remains unchanged */}
      <div className="navbar__links">
        {showWriteButton && (
          <Link to="/create-book" className="navbar__button">
            Start Writing
          </Link>
        )}

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
