import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import BookCard from "../components/books";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
// import "../styles/FavouritedBooks.css"; // Create a style file for this page

function FavouritedBooks() {
  const [favouriteBooks, setFavouriteBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavouritedBooks();
  }, [page]);

  const fetchFavouritedBooks = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/api/books/favourites/?user_id=${userId}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      setFavouriteBooks(response.data.results);
      setTotalPages(response.data.total_pages);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleBookClick = (bookId) => {
    navigate(`/overview/books/${bookId}`);
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="favourited-books-container">
      <Navbar />
      <div className="content-wrapper">
        <div className="genre-header">
          <h1>Your Favourited Books</h1>
          <div className="header-divider"></div>
        </div>

        <div className="book-grid-container">
          <div className="book-grid">
            {favouriteBooks.length > 0 ? (
              favouriteBooks.map((book) => (
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
                You haven't favorited any books yet.
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

export default FavouritedBooks;
