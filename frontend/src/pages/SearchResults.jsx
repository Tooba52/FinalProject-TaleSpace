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
  const [bookResults, setBookResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        const headers = {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        };

        // Always fetch both, but only display based on searchType
        const bookResponse = await fetch(
          `http://localhost:8000/api/books/search/?q=${encodeURIComponent(
            searchQuery
          )}`,
          { headers }
        );
        setBookResults(await bookResponse.json());
      } catch (error) {
        console.error("Search error:", error);
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
    <div className="search-page">
      <Navbar />
      {/* Results Section */}
      <div className="search-results-container">
        <h2>Results for "{searchQuery}"</h2>
        {bookResults.length > 0 ? (
          <div className="book-grid">
            {bookResults.map((book) => (
              <BookCard key={book.book_id} book={book} />
            ))}
          </div>
        ) : (
          <p>No books found matching your search.</p>
        )}
        <></>
      </div>
    </div>
  );
};

export default SearchResults;
