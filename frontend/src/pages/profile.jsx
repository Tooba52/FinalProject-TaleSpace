import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import profile from "../images/profile.png";
import api from "../api";
import Book from "../components/books";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/Profile.css";

function Profile() {
  const [firstName, setFirstName] = useState("");
  const [userBooks, setUserBooks] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserBooks();
    }
  }, [userId]); // Add userId as dependency

  const fetchUserProfile = () => {
    api
      .get("/api/user/profile/")
      .then((res) => {
        setFirstName(res.data.first_name);
        setUserId(res.data.user_id);
      })
      .catch((err) => console.error("Error fetching user profile", err));
  };

  const fetchUserBooks = () => {
    if (!userId) return;

    api
      .get(`/api/books/?author_id=${userId}`)
      .then((res) => {
        // Ensure the response contains the expected data structure
        const userBooks = res.data.results || res.data; // Handle both paginated and non-paginated responses
        setUserBooks(Array.isArray(userBooks) ? userBooks : []);
      })
      .catch((err) => {
        console.error("Error fetching user books", err);
        setUserBooks([]); // Reset to empty array on error
      });
  };

  return (
    <div className="profile-page">
      <Navbar variant="transparent" firstName={firstName} />

      <div className="profile-container">
        {/* Profile Header Section */}
        <div className="profile-header">
          <img src={profile} alt="Profile" className="profile-icon" />
          <div className="profile-info">
            <h2>{firstName || "Username"}</h2>
            <div className="follow-stats">
              <div className="stat-item">
                <strong>Followers</strong>
                <span>0</span>
              </div>
              <div className="stat-item">
                <strong>Following</strong>
                <span>0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Your Books Section */}
        {userBooks.length > 0 && (
          <section className="books-section">
            <h3>Your Books</h3>
            <div className="book-list">
              {userBooks.map((book) => (
                <Link to={`/books/${book.book_id}`} key={book.book_id}>
                  <Book book={book} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Favorited Books Section */}
        <section className="books-section">
          <div className="section-header">
            <h3>Favourited Books</h3>
            <Link to="/books" className="view-all">
              View All ➤
            </Link>
          </div>
          <div className="book-list">
            {[...Array(7)].map((_, index) => (
              <div key={index} className="book-card">
                <div className="book-icon">📖</div>
                <p>Book Name</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}

export default Profile;
