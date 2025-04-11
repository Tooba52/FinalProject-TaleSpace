import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import BookCard from "../components/books";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function YourBooks() {
  const [userBooks, setUserBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserBooks();
  }, [page]);

  const fetchUserBooks = () => {
    setLoading(true);
    api
      .get(`/api/books/?my_books=true&page=${page}`) // Changed to use a query parameter
      .then((res) => {
        setUserBooks(res.data.results || []);
        setTotalPages(res.data.total_pages || 1);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching user books", err);
        setUserBooks([]);
        setError("Failed to load books.");
        setLoading(false);
      });
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
                You haven't written any books yet.
              </div>
            )}
          </div>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default YourBooks;
