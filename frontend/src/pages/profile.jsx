import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import profile from "../images/profile.png";
import api from "../api";
import "../styles/profile.css";
import Book from "../components/books";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Profile() {
  const [firstName, setFirstName] = useState("");
  const [userBooks, setUserBooks] = useState([]);
  const [userId, setUserId] = useState(null);

  // useEffect hook to fetch
  useEffect(() => {
    fetchUserProfile();
    fetchUserBooks();
  }, []);

  const fetchUserProfile = () => {
    api
      .get("/api/user/profile/") // Fetch user details
      .then((res) => {
        setFirstName(res.data.first_name); // Set the first name in state
        setUserId(res.data.user_id); // Store the user ID
      })
      .catch((err) => console.error("Error fetching user profile", err));
  };

  const fetchUserBooks = (userId) => {
    api
      .get("/api/books/")
      .then((res) => {
        console.log("Fetched Books:", res.data);
        const filteredBooks = res.data.filter(
          (book) => book.author_id === userId
        );
        console.log("Filtered Books:", filteredBooks);
        setUserBooks(filteredBooks);
      })
      .catch((err) => console.error("Error fetching user books", err));
  };

  return (
    <div className="profile-page">
      <Navbar variant="transparent" firstName={firstName} />
      <div className="profile-container">
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
                <Link to={`/books/${book.book_id}/chapters`} key={book.book_id}>
                  <Book book={book} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Favorite Books Section */}
        <section className="favourited-books">
          <h3>Favourited Books</h3>
          <div className="book-list">
            {[...Array(7)].map((_, index) => (
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

        <Footer />
      </div>
    </div>
  );
}

export default Profile;
