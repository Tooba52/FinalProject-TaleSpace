import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import BookCard from "../components/books";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function FavoriteBooks() {
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavoriteBooks();
  }, [page]);

  const fetchFavoriteBooks = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/api/books/favourites/?page=${page}&page_size=28`
      ); // Added page_size parameter
      const data = response.data;

      setFavoriteBooks(data.results || data);
      setTotalPages(
        data.total_pages || Math.ceil((data.count || data.length) / 28)
      );
    } catch (err) {
      console.error("Error fetching favorite books", err);
      setError("Failed to load favorite books");
      setFavoriteBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = (bookId) => {
    navigate(`/overview/books/${bookId}`);
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="favorite-books-container">
      <Navbar />

      <div className="content-wrapper">
        <div className="genre-header">
          <h1>Your Favorite Books</h1>
          <div className="header-divider"></div>
        </div>

        <div className="book-grid-container">
          <div className="book-grid">
            {favoriteBooks.length > 0 ? (
              favoriteBooks.map((book) => (
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
                {!loading && "You haven't favorited any books yet."}
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

export default FavoriteBooks;
