import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import BookCard from "../components/books";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Pagination from "../components/Pagination";

function FavouriteBooks() {
  const [favouriteBooks, setFavouriteBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { pageNumber = 1 } = useParams();
  const currentPage = parseInt(pageNumber, 10);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavoriteBooks();
  }, [currentPage]);

  const fetchFavoriteBooks = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/api/books/favourites/?page=${currentPage}&page_size=28`
      );
      const data = response.data;
      setFavouriteBooks(data.results);
      setTotalPages(data.total_pages);
    } catch (err) {
      setError("Failed to load favourite books");
      setFavouriteBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = (bookId) => {
    navigate(`/overview/books/${bookId}`);
  };

  return (
    <div className="favourite-books-container">
      <Navbar />

      <div className="content-wrapper">
        <div className="genre-header">
          <h1>Your Favourite Books</h1>
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
                {!loading && "You haven't favourited any books yet."}
              </div>
            )}
          </div>
        </div>

        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          basePath="/FavouritedBooks/books"
        />
      </div>

      <Footer />
    </div>
  );
}

export default FavouriteBooks;
