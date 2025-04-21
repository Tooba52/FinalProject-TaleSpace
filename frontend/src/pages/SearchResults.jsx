import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import api from "../api";
import BookCard from "../components/books";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Pagination from "../components/Pagination";
import "../styles/SearchResults.css";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q");
  const { pageNumber = 1 } = useParams();
  const currentPage = parseInt(pageNumber, 10);
  const navigate = useNavigate();
  const [bookResults, setBookResults] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // fetch search results
  useEffect(() => {
    fetchResults();
  }, [searchQuery, currentPage]);

  // fetch results
  const fetchResults = async () => {
    if (!searchQuery) {
      setLoading(false);
      setBookResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(
        `/api/books/search/?q=${encodeURIComponent(
          searchQuery
        )}&page=${currentPage}`
      );

      setBookResults(response.data.results || []);
      setTotalPages(response.data.total_pages || 0);
    } catch (error) {
      setError("Failed to load search results");
    } finally {
      setLoading(false);
    }
  };

  // view book details
  const handleBookClick = (bookId) => {
    navigate(`/overview/books/${bookId}`);
  };

  // Loading and error states
  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="search-page">
      <Navbar />

      <div className="book-grid-container">
        <h2 className="search-heading">Results for "{searchQuery}"</h2>
        <div className="search-divider"></div>

        <div className="search-container">
          <div className="book-grid">
            {bookResults.length > 0 ? (
              bookResults.map((book) => (
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
                {searchQuery
                  ? "No matching books found"
                  : "Enter a search term"}
              </div>
            )}
          </div>

          <Pagination
            totalPages={totalPages}
            currentPage={Number(currentPage)}
            basePath="/search"
            searchQuery={searchQuery}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SearchResults;
