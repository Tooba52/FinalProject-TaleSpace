import { useState, useEffect } from "react"; // useState hook to manage state in the component
import { Link } from "react-router-dom"; // Link component for routing
import logo from "../images/logo.jpeg"; // Logo for the navigation bar
import profile from "../images/profile.png";
import api from "../api"; // API utility to make requests
import "../styles/profile.css";

function Profile() {
  const [firstName, setFirstName] = useState(""); // Stores the first name of the logged-in user
  const [userBooks, setUserBooks] = useState([]);

  // useEffect hook to fetch
  useEffect(() => {
    fetchUserProfile(); // Fetch user profile to get first name
    fetchUserBooks();
  }, []); // Empty dependency array ensures this runs only once after the first render

  const fetchUserProfile = () => {
    api
      .get("/api/user/profile/") // Fetch user details
      .then((res) => {
        setFirstName(res.data.first_name); // Set the first name in state
      })
      .catch((err) => console.error("Error fetching user profile", err)); // Handle errors
  };

  const fetchUserBooks = () => {
    api
      .get("/api/books/") // Adjust endpoint as needed
      .then((res) => {
        const filteredBooks = res.data.filter(
          (book) => book.author_id === userId
        );
        setUserBooks(filteredBooks);
      })
      .catch((err) => console.error("Error fetching user books", err));
  };

  return (
    <div className="profile-container">
      <nav className="profile-navbar">
        <Link to="/" className="profile-logo">
          <img src={logo} alt="TaleSpace Logo" /> {/* Logo image */}
          <span>TaleSpace</span>
        </Link>
        <input type="text" placeholder="Search" className="search-bar" />
        <div className="nav-links">
          <Link to="/create-book" className="btn-start-writing">
            Start Writing
          </Link>
          <Link to="/profile" className="profile-profile-icon">
            <span>👤 {firstName}</span> {/* Display first name  */}
          </Link>
        </div>
      </nav>

      {/* Profile Section */}
      <div className="profile-header">
        <div className="profile-info">
          <img src={profile} alt="Profile Icon" className="profile-icon" />
          <div className="user-details">
            <h2>Username</h2>
            <div className="follow-stats">
              <p>
                <strong>Followers</strong>
                <br />0
              </p>
              <p>
                <strong>Following</strong>
                <br />0
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Your Books Section */}
      {userBooks.length > 0 && (
        <section className="your-books">
          <h3>Your Books</h3>
          <div className="book-list">
            {userBooks.map((book) => (
              <div key={book.id} className="book-card">
                <img
                  src={book.cover_photo}
                  alt={book.title}
                  className="book-cover"
                />
                <p>{book.title}</p>
              </div>
            ))}
          </div>
          <Link to="/books" className="view-all">
            View All ➤
          </Link>
        </section>
      )}

      {/* Favorite Books Section */}
      <section className="favourited-books">
        <h3>Favourited Books</h3>
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
    </div>
  );
}

export default Profile;
