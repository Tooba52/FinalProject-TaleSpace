import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import profile from "../images/profile.png";
import api from "../api";
import Book from "../components/books";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/Profile.css";

function UserProfile() {
  // State and routing setup
  const { user_id } = useParams();
  const navigate = useNavigate();

  // User data state
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    followers: 0,
    following: 0,
  });
  const [userBooks, setUserBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    if (!user_id) return;
    fetchUserProfile();
    fetchUserBooks();
    fetchFollowStats();
    checkFollowStatus();
  }, [user_id, navigate]);

  // Fetch basic user profile info
  const fetchUserProfile = () => {
    setIsLoading(true);
    api
      .get(`/api/public/profile/${user_id}/`)
      .then((res) => {
        setUserData({
          firstName: res.data.first_name,
          lastName: res.data.last_name,
          bio: res.data.bio || "",
          followers: res.data.followers_count || 0,
          following: res.data.following_count || 0,
        });
      })
      .catch(() => navigate("/error"))
      .finally(() => setIsLoading(false));
  };

  // Fetch user's published books
  const fetchUserBooks = () => {
    api.get(`/api/books/?author_id=${user_id}`).then((res) => {
      const books = res.data.results || res.data;
      const publicBooks = Array.isArray(books)
        ? books.filter((book) => book.status === "public")
        : [];
      setUserBooks(publicBooks);
    });
  };

  // Get follower/following counts
  const fetchFollowStats = () => {
    Promise.all([
      api.get(`/api/followers/${user_id}/`),
      api.get(`/api/following/${user_id}/`),
    ]).then(([followersRes, followingRes]) => {
      setUserData((prev) => ({
        ...prev,
        followers: followersRes.data.count,
        following: followingRes.data.count,
      }));
    });
  };

  // Check if current user follows this profile
  const checkFollowStatus = () => {
    api
      .get(`/api/check-follow/${user_id}/`)
      .then((res) => setIsFollowing(res.data.is_following));
  };

  // Handle follow/unfollow action
  const handleFollow = () => {
    const action = isFollowing
      ? api.delete(`/api/unfollow/${user_id}/`)
      : api.post(`/api/follow/${user_id}/`);

    action
      .then(() => {
        setIsFollowing(!isFollowing);
        return Promise.all([
          api.get(`/api/followers/${user_id}/`),
          api.get(`/api/following/${user_id}/`),
        ]);
      })
      .then(([followersRes, followingRes]) => {
        setUserData((prev) => ({
          ...prev,
          followers: followersRes.data.count,
          following: followingRes.data.count,
        }));
      })
      .catch(() => setIsFollowing(isFollowing));
  };

  // Handle book click navigation
  const handleBookClick = (bookId) => {
    navigate(`/overview/books/${bookId}`);
  };

  // Loading state
  if (isLoading) return <div className="loading">Loading profile...</div>;

  return (
    <div className="profile-page">
      <Navbar />

      <div className="profile-container">
        {/* Profile header section */}
        <div className="profile-header">
          <img src={profile} alt="Profile" className="profile-icon" />
          <div className="profile-info">
            <h2>
              {userData.firstName} {userData.lastName}
            </h2>
            {userData.bio && <p className="user-bio">{userData.bio}</p>}

            {/* Follow stats */}
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

            {/* Follow button */}
            <button
              className={`follow-button ${isFollowing ? "following" : ""}`}
              onClick={handleFollow}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          </div>
        </div>

        {/* User's books section */}
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

          {/* View all link if more than 7 books */}
          {userBooks.length > 7 && (
            <Link
              to={`/userprofile/${user_id}/books/page/1`}
              className="view-all"
            >
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
