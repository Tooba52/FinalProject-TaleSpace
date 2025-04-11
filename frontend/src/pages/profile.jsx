import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const [favouriteBooks, setFavouriteBooks] = useState([]);
  const navigate = useNavigate(); // Add this line

  useEffect(() => {
    if (userId) {
      fetchUserBooks();
      fetchFavouriteBooks();
    }
    fetchUserProfile();
  }, [userId]);

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

  const fetchFavouriteBooks = () => {
    if (!userId) return;

    api
      .get(`/api/books/favourites/`)
      .then((res) => {
        const favourites = res.data.results || res.data; // Handle paginated/non-paginated
        setFavouriteBooks(Array.isArray(favourites) ? favourites : []);
      })
      .catch((err) => {
        console.error("Error fetching favourite books", err);
        setFavouriteBooks([]);
      });
  };

  const handleBookClick = (bookId) => {
    navigate(`/overview/books/${bookId}`); // This will navigate to overview
  };

  return (
    <div className="profile-page">
      <Navbar />

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
              {userBooks.slice(0, 7).map((book) => (
                <Link to={`/settings/books/${book.book_id}`} key={book.book_id}>
                  <Book book={book} />
                </Link>
              ))}
            </div>
            <Link to="/YourBooks/books/" className="view-all">
              View All ➤
            </Link>
          </section>
        )}

        {/* Favorited Books Section */}
        <section className="books-section">
          <div className="section-header">
            <h3>Favourited Books</h3>
            {favouriteBooks.length > 7 && (
              <Link to="/favourites" className="view-all">
                View All ➤
              </Link>
            )}
          </div>
          <div className="book-list">
            {favouriteBooks.length > 0 ? (
              favouriteBooks.slice(0, 7).map((book) => (
                <div
                  key={book.book_id}
                  onClick={() => handleBookClick(book.book_id)}
                  style={{ cursor: "pointer" }}
                >
                  <Book book={book} />
                </div>
              ))
            ) : (
              <p className="no-favourites">No favourited books yet</p>
            )}
          </div>
          {favouriteBooks.length > 7 && (
            <Link to="/FavouitedBooks/books/" className="view-all">
              View All ➤
            </Link>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
}

export default Profile;
