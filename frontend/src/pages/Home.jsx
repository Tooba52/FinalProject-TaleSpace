import { useState, useEffect } from "react"; // Import hooks to manage state and lifecycle
import { Link } from "react-router-dom"; // Import Link for routing to different pages
import api from "../api"; // Import API utility for making requests
import "../styles/Home.css"; // Import styling for the home page
import logo from "../images/logo.jpeg"; // Logo for the navigation bar

function Home() {
  // State variables
  const [firstName, setFirstName] = useState(""); // Stores the first name of the logged-in user

  // useEffect hook to fetch
  useEffect(() => {
    fetchUserProfile(); // Fetch user profile to get first name
  }, []); // Empty dependency array ensures this runs only once after the first render

  const fetchUserProfile = () => {
    api
      .get("/api/user/profile/") // Fetch user details
      .then((res) => {
        setFirstName(res.data.first_name); // Set the first name in state
      })
      .catch((err) => console.error("Error fetching user profile", err)); // Handle errors
  };

  return (
    <div className="home=page">
      <div className="home-container">
        {/* Navigation Bar */}
        <nav className="home-navbar">
          <Link to="/" className="home-logo">
            <img src={logo} alt="TaleSpace Logo" /> {/* Logo image */}
            <span>TaleSpace</span>
          </Link>
          <input type="text" placeholder="Search" className="search-bar" />
          <div className="nav-links">
            <Link to="/create-book" className="btn-start-writing">
              Start Writing
            </Link>
            <Link to="/profile" className="home-profile-icon">
              <span>👤 {firstName ? firstName : "Guest"}</span>{" "}
              {/* Display first name or Guest if not available */}
            </Link>
          </div>
        </nav>

        {/* Banner Section */}
        <div className="banner">
          <h2>Welcome to TaleSpace – Where Stories Come to Life!</h2>
          <p>
            TaleSpace is a dynamic platform for writers to create, share, and
            publish stories while readers discover their favorite authors. Start
            writing, explore new worlds, and be part of a growing literary
            universe today!
          </p>
        </div>

        {/* Top 10 Books Section */}
        <section className="top-books">
          <h3>Top 10 Books</h3>
          <div className="book-list">
            {[...Array(10)].map((_, index) => (
              <div key={index} className="book-card">
                <div className="book-icon">📖</div>
                <p>Book Name</p>
              </div>
            ))}
          </div>
          <Link to="/books" className="view-all">
            View All ➤
          </Link>
        </section>

        {/* Top Genres Section */}
        <section className="top-genres">
          <h3>Top Genres</h3>
          <div className="genre-list">
            {[
              "Romance",
              "Fantasy",
              "Action",
              "Comedy",
              "Mystery",
              "Horror",
              "Sports",
            ].map((genre, index) => (
              <div key={index} className="genre-card">
                <div className="genre-icon">🎭</div>
                <p>{genre}</p>
              </div>
            ))}
          </div>
          <Link to="/books" className="view-all">
            View All ➤
          </Link>
        </section>

        {/* Top Authors Section */}
        <section className="top-authors">
          <h3>Top Authors</h3>
          <div className="author-list">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="author-card">
                <div className="author-icon">👤</div>
                <p>Author Name</p>
              </div>
            ))}
          </div>
          <Link to="/books" className="view-all">
            View All ➤
          </Link>
        </section>

        {/* Footer */}
        <footer className="footer">
          <p>2025 All Rights Reserved. TaleSpace Inc.</p>
        </footer>
      </div>
    </div>
  );
}

export default Home;
