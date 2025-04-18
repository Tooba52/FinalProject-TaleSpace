import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import BookCard from "../components/books";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Pagination from "../components/Pagination";

function UserBooks() {
  // State and routing setup
  const { user_id, pageNumber = 1 } = useParams();
  const navigate = useNavigate();
  const currentPage = parseInt(pageNumber, 10);

  // Component state
  const [userData, setUserData] = useState({ firstName: "" });
  const [userBooks, setUserBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch data when user_id or page changes
  useEffect(() => {
    if (user_id) {
      fetchUserProfile();
      fetchUserBooks();
    }
  }, [user_id, currentPage]);

  // Fetch user's basic profile info
  const fetchUserProfile = () => {
    api
      .get(`/api/public/profile/${user_id}/`)
      .then((res) => {
        setUserData({
          firstName: res.data.first_name,
        });
      })
      .catch(() => setError("Error loading user profile"));
  };

  // Fetch user's published books with pagination
  const fetchUserBooks = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/api/books/?author_id=${user_id}&status=public&page=${currentPage}&page_size=28`
      );

      const data = response.data;
      setUserBooks(data.results || []);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      setError("Failed to load user's books");
      setUserBooks([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle book click navigation
  const handleBookClick = (bookId) => {
    navigate(`/overview/books/${bookId}`);
  };

  // Loading and error states
  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="user-books-container">
      <Navbar />

      {/* Main content area */}
      <div className="content-wrapper">
        {/* Page header */}
        <div className="genre-header">
          <h1>{userData.firstName}'s Books</h1>
          <div className="header-divider"></div>
        </div>

        {/* Books grid */}
        <div className="book-grid-container">
          <div className="book-grid">
            {userBooks.length > 0 ? (
              userBooks.map((book) => (
                <div
                  key={book.book_id}
                  onClick={() => handleBookClick(book.book_id)}
                  className="book-card-wrapper"
                >
                  <BookCard book={book} />
                </div>
              ))
            ) : (
              <div className="no-books-message">
                {userData.firstName} hasn't written any books yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pagination controls */}
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        basePath={`/userprofile/${user_id}/books`}
      />

      <Footer />
    </div>
  );
}

export default UserBooks;
