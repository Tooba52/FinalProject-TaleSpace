import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import BookCard from "../components/books";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/SearchResults.css";

const SearchResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("access_token");
        const headers = {
          "Content-Type": "application/json",
        };

        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(
          `http://localhost:8000/api/books/search/?q=${encodeURIComponent(
            searchQuery
          )}`,
          { headers }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setResults(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    if (searchQuery) {
      fetchResults();
    }
  }, [searchQuery]);

  const handleBookClick = (bookId) => {
    navigate(`/overview/books/${bookId}`);
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="search-results-container">
      <Navbar />

      <div className="content-wrapper">
        <div className="search-header">
          <h1>Search Results for "{searchQuery}"</h1>
          <div className="header-divider"></div>
        </div>

        <div className="book-grid-container">
          <div className="book-grid">
            {results.length > 0 ? (
              results.map((book) => (
                <div
                  key={book.book_id}
                  onClick={() => handleBookClick(book.book_id)}
                  className="book-card-wrapper"
                >
                  <BookCard book={book} />
                </div>
              ))
            ) : (
              <div className="no-results-message">
                No books found matching your search.
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SearchResults;
