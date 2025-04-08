import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import profile from "../images/profile.png";
import api from "../api";
import Book from "../components/books";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/Profile.css";

function UserProfile() {
  const { user_id } = useParams(); // Get userId from URL
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    followers: 0,
    following: 0,
  });
  const [userBooks, setUserBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user_id) {
      console.error("No user ID in URL");
      return;
    }
    fetchUserProfile();
    fetchUserBooks();
  }, [user_id, navigate]); // Add navigate to dependencies

  const fetchUserProfile = () => {
    setIsLoading(true);
    api
      .get(`/api/public/profile/${user_id}/`) // Note new endpoint and trailing slash
      .then((res) => {
        setUserData({
          firstName: res.data.first_name,
          lastName: res.data.last_name,
          bio: res.data.bio || "",
          followers: res.data.followers_count || 0,
          following: res.data.following_count || 0,
        });
      })
      .catch((err) => {
        console.error("Error fetching user profile", err);
        navigate("/error");
      })
      .finally(() => setIsLoading(false));
  };

  const fetchUserBooks = () => {
    api
      .get(`/api/books/?author_id=${user_id}`)
      .then((res) => {
        const books = res.data.results || res.data;
        setUserBooks(Array.isArray(books) ? books : []);
      })
      .catch((err) => console.error("Error fetching user books", err));
  };

  const handleBookClick = (bookId) => {
    navigate(`/overview/books/${bookId}`);
  };

  if (isLoading) return <div className="loading">Loading profile...</div>;

  return (
    <div className="profile-page">
      <Navbar variant="transparent" />

      <div className="profile-container">
        {/* Profile Header Section */}
        <div className="profile-header">
          <img src={profile} alt="Profile" className="profile-icon" />
          <div className="profile-info">
            <h2>
              {userData.firstName} {userData.lastName}
            </h2>
            {userData.bio && <p className="user-bio">{userData.bio}</p>}
            <div className="follow-stats">
              <div className="stat-item">
                <strong>Followers</strong>
                <span>{userData.followers}</span>
              </div>
              <div className="stat-item">
                <strong>Following</strong>
                <span>{userData.following}</span>
              </div>
            </div>
            <button className="follow-button">Follow</button>
          </div>
        </div>

        {/* User's Books Section */}
        <section className="books-section">
          <h3>{userData.firstName}'s Books</h3>
          <div className="book-list">
            {userBooks.length > 0 ? (
              userBooks.slice(0, 7).map((book) => (
                <div
                  key={book.book_id}
                  onClick={() => handleBookClick(book.book_id)}
                  style={{ cursor: "pointer" }}
                >
                  <Book book={book} />
                </div>
              ))
            ) : (
              <p>No books published yet</p>
            )}
          </div>
          {userBooks.length > 7 && (
            <Link to={`/userprofile/${user_id}/books`} className="view-all">
              View All ➤
            </Link>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
}

export default UserProfile;
