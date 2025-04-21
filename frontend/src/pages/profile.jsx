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
  const [userId, setUserId] = useState(null);
  const [userBooks, setUserBooks] = useState([]);
  const [favouriteBooks, setFavouriteBooks] = useState([]);
  const [followStats, setFollowStats] = useState({
    followers: 0,
    following: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      fetchUserBooks();
      fetchFavouriteBooks();
      fetchFollowStats();
    }
    fetchUserProfile();
  }, [userId]);

  // get basic user info
  const fetchUserProfile = () => {
    api
      .get("/api/user/profile/")
      .then((res) => {
        setFirstName(res.data.first_name);
        setUserId(res.data.user_id);
      })
      .catch((err) => console.error("Error fetching user profile", err));
  };

  // get books written by user
  const fetchUserBooks = () => {
    if (!userId) return;
    api
      .get(`/api/books/?author_id=${userId}`)
      .then((res) => {
        const userBooks = res.data.results || res.data;
        setUserBooks(Array.isArray(userBooks) ? userBooks : []);
      })
      .catch(() => setUserBooks([]));
  };

  // get user's favourite books
  const fetchFavouriteBooks = () => {
    if (!userId) return;
    api
      .get(`/api/books/favourites/`)
      .then((res) => {
        const favourites = res.data.results || res.data;
        setFavouriteBooks(Array.isArray(favourites) ? favourites : []);
      })
      .catch(() => setFavouriteBooks([]));
  };

  // get follow counts
  const fetchFollowStats = () => {
    if (!userId) return;
    Promise.all([
      api.get(`/api/followers/${userId}/`),
      api.get(`/api/following/${userId}/`),
    ])
      .then(([followersRes, followingRes]) => {
        setFollowStats({
          followers: followersRes.data.count,
          following: followingRes.data.count,
        });
      })
      .catch((err) => console.error("Error fetching follow stats", err));
  };

  // navigate to book page
  const handleBookClick = (bookId) => {
    navigate(`/overview/books/${bookId}`);
  };

  return (
    <div className="profile-page">
      <Navbar />

      <div className="profile-container">
        {/* profile header section */}
        <div className="profile-header">
          <img src={profile} alt="Profile" className="profile-icon" />
          <div className="profile-info">
            <h2>{firstName || "Username"}</h2>

            {/* follow stats */}
            <div className="follow-stats">
              <div className="stat-item">
                <strong>Followers</strong>
                <span>{followStats.followers}</span>
              </div>
              <div className="stat-item">
                <strong>Following</strong>
                <span>{followStats.following}</span>
              </div>
            </div>
          </div>
        </div>

        {/* user's books section */}
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
            {userBooks.length > 7 && (
              <Link to="/YourBooks/books/page/1" className="view-all">
                View All ➤
              </Link>
            )}
          </section>
        )}

        {/* favorite books section */}
        <section className="books-section">
          <div className="section-header">
            <h3>Favourited Books</h3>
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
            <Link to="/FavouritedBooks/books/page/1" className="view-all">
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
