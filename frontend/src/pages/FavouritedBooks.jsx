import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import BookCard from "../components/books";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Pagination from "../components/Pagination";

function FavouriteBooks() {
  // Component state for storing favourite books, loading status, error message, etc.
  const [favouriteBooks, setFavouriteBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract page number from the URL parameters
  const { pageNumber = 1 } = useParams();
  const currentPage = parseInt(pageNumber, 10);

  // State for managing total pages of favourite books
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  // Fetch the favourite books when the current page changes
  useEffect(() => {
    fetchFavoriteBooks();
  }, [currentPage]);

  // Function to fetch the list of favourite books from the API
  const fetchFavoriteBooks = async () => {
    try {
      setLoading(true); // Start loading
      // Fetch favourite books from the API with pagination
      const response = await api.get(
        `/api/books/favourites/?page=${currentPage}&page_size=28`
      );
      const data = response.data;
      setFavouriteBooks(data.results); // Update favourite books state
      setTotalPages(data.total_pages); // Update total pages for pagination
    } catch (err) {
      setError("Failed to load favourite books"); // Handle error
      setFavouriteBooks([]); // Clear the favourite books state on error
    } finally {
      setLoading(false); // Set loading to false when request completes
    }
  };

  // Navigate to the book details page when a book is clicked
  const handleBookClick = (bookId) => {
    navigate(`/overview/books/${bookId}`);
  };

  return (
    <div className="favourite-books-container">
      {/* Render Navbar component */}
      <Navbar />

      <div className="content-wrapper">
        {/* Page header with the title */}
        <div className="genre-header">
          <h1>Your Favourite Books</h1>
          <div className="header-divider"></div>
        </div>

        {/* Books grid displaying favourite books */}
        <div className="book-grid-container">
          <div className="book-grid">
            {favouriteBooks.length > 0 ? (
              // If there are favourite books, map over them and display BookCard
              favouriteBooks.map((book) => (
                <div
                  key={book.book_id}
                  onClick={() => handleBookClick(book.book_id)} // Handle book click
                  className="book-card-wrapper"
                >
                  <BookCard book={book} />
                </div>
              ))
            ) : (
              // If no favourite books, show message
              <div className="no-books-message">
                {!loading && "You haven't favourited any books yet."}
              </div>
            )}
          </div>
        </div>

        {/* Pagination component for navigating through the pages of favourite books */}
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          basePath="/FavouritedBooks/books"
        />
      </div>

      {/* Render Footer component */}
      <Footer />
    </div>
  );
}

export default FavouriteBooks;
