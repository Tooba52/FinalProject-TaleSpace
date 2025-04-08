import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Home.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Book from "../components/books";
import GenreIcon from "../components/GenreIcons";

function Home() {
  const [firstName, setFirstName] = useState("");
  const [topBooks, setTopBooks] = useState([]);
  const [topAuthors, setTopAuthors] = useState([]);
  const [topGenres, setTopGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Add this line

  useEffect(() => {
    fetchUserProfile();
    fetchLeaderboards();
  }, []);

  const fetchUserProfile = () => {
    api
      .get("/api/user/profile/")
      .then((res) => {
        setFirstName(res.data.first_name);
      })
      .catch((err) => console.error("Error fetching user profile", err));
  };

  const handleBookClick = (bookId) => {
    navigate(`/overview/books/${bookId}`); // This will navigate to overview
  };

  const handleGenreClick = (genre) => {
    navigate(`/browse/${genre.toLowerCase().replace(/\s+/g, "-")}`); // This will navigate to browse genres
  };

  const fetchLeaderboards = () => {
    setLoading(true);
    setError(null);

    // Fetch all leaderboard data in parallel
    Promise.all([
      api.get("/api/leaderboard/books/"),
      api.get("/api/leaderboard/authors/"),
      api.get("/api/leaderboard/genres/"),
    ])
      .then(([booksRes, authorsRes, genresRes]) => {
        setTopBooks(booksRes.data);
        setTopAuthors(authorsRes.data);
        setTopGenres(genresRes.data);
      })
      .catch((err) => {
        console.error("Error fetching leaderboards:", err);
        setError("Failed to load leaderboard data");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (loading) {
    return <div className="loading">Loading leaderboards...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="home-page">
      <Navbar variant="transparent" firstName={firstName} />
      <div className="home-container">
        {/* Banner Section */}
        <div className="banner">
          <h2>Welcome to TaleSpace – Where Stories Come to Life!</h2>
          <p>
            TaleSpace is a dynamic platform for writers to create, share, and
            publish stories while readers discover their favorite authors. Start
            writing, explore new worlds, and be part of a growing literary
            universe today!
          </p>
        </div>
      </div>

      <div className="book-container">
        {/* Top 10 Books Section */}
        <section className="top-books">
          <h3>Top Books</h3>
          <div className="book-list">
            {topBooks.length > 0 ? (
              topBooks.slice(0, 7).map((book) => (
                <div
                  key={book.book_id}
                  className="book-link"
                  onClick={() => handleBookClick(book.book_id)}
                  style={{ cursor: "pointer" }} // Makes it clear it's clickable
                >
                  <Book book={book} />
                </div>
              ))
            ) : (
              <p>No books found</p>
            )}
          </div>
        </section>

        {/* Top Genres Section */}
        <section className="top-genres">
          <div className="section-header">
            <h3>Top Genres</h3>
          </div>
          <div className="genre-list">
            {topGenres.length > 0 ? (
              topGenres
                .slice(0, 7)
                .map((genre, index) => (
                  <GenreIcon
                    key={index}
                    genre={genre.genre}
                    onClick={() => handleGenreClick(genre.genre)}
                    className="genre-card"
                  />
                ))
            ) : (
              <p className="no-genres">No genre data available</p>
            )}
          </div>
        </section>

        {/* Top Authors Section */}
        <section className="top-authors">
          <h3>Top Authors</h3>
          <div className="author-list">
            {topAuthors.length > 0 ? (
              topAuthors.map((author) => (
                <Link
                  to={`/author/${author.author_id}`}
                  key={author.author_id}
                  className="author-card"
                >
                  <div className="author-icon">👤</div>
                  <p>{author.author_name || "Unknown Author"}</p>
                  <small>{author.total_views} views</small>
                </Link>
              ))
            ) : (
              <p>No authors found</p>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}

export default Home;
