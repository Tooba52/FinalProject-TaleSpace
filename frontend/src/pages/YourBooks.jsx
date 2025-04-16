import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import BookCard from "../components/books";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Pagination from "../components/Pagination";

function YourBooks() {
  const [userBooks, setUserBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const { pageNumber = 1 } = useParams();
  const currentPage = parseInt(pageNumber, 10);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserBooks();
    }
  }, [userId, currentPage]);

  const fetchUserProfile = () => {
    api
      .get("/api/user/profile/")
      .then((res) => {
        setUserId(res.data.user_id);
      })
      .catch((err) => {
        setError("Failed to load user profile");
        setLoading(false);
      });
  };

  const fetchUserBooks = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/api/books/?author_id=${userId}&page=${currentPage}&page_size=28`
      );

      const data = response.data;
      setUserBooks(data.results || data);
      setTotalPages(
        data.total_pages || Math.ceil((data.count || data.length) / 28)
      );
    } catch (err) {
      setError("Failed to load your books");
      setUserBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = (bookId) => {
    navigate(`/settings/books/${bookId}`);
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="your-books-container">
      <Navbar />
      <div className="content-wrapper">
        <div className="genre-header">
          <h1>Your Books</h1>
          <div className="header-divider"></div>
        </div>
      </div>
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
              {!loading && "You haven't written any books yet."}
            </div>
          )}
        </div>
      </div>
      {/* Pagination Component */}
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        basePath="/YourBooks/books"
      />
      <Footer />
    </div>
  );
}

export default YourBooks;
