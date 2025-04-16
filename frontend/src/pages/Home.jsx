import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Home.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Book from "../components/books";
import GenreIcon from "../components/GenreIcons";
import profile from "../images/profile.png";

function Home() {
  const [topBooks, setTopBooks] = useState([]);
  const [topAuthors, setTopAuthors] = useState([]);
  const [topGenres, setTopGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const handleBookClick = (bookId) => {
    navigate(`/overview/books/${bookId}`);
  };

  const handleGenreClick = (genre) => {
    navigate(`/browse/${genre.toLowerCase().replace(/\s+/g, "-")}`);
  };

  const fetchLeaderboards = () => {
    setLoading(true);
    setError(null);

    Promise.all([
      api.get("/api/leaderboard/books/", {
        params: {
          include_covers: true,
        },
      }),
      api.get("/api/leaderboard/authors/"),
      api.get("/api/leaderboard/genres/"),
    ])
      .then(([booksRes, authorsRes, genresRes]) => {
        setTopBooks(booksRes.data);
        setTopAuthors(authorsRes.data);
        setTopGenres(genresRes.data);
      })
      .catch(() => {
        setError("Failed to load leaderboard data");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="home-page">
      <Navbar variant="transparent" />
      <div className="home-container">
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
        <section className="top-books">
          <h3>Top Books</h3>
          <div className="book-list">
            {topBooks.length > 0 ? (
              topBooks.slice(0, 7).map((book) => (
                <div
                  key={book.book_id}
                  className="book-link"
                  onClick={() => handleBookClick(book.book_id)}
                  style={{ cursor: "pointer" }}
                >
                  <Book book={book} />
                </div>
              ))
            ) : (
              <p>No books found</p>
            )}
          </div>
        </section>

        <section className="top-genres">
          <h3>Top Genres</h3>
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

        <section className="top-authors">
          <h3>Top Authors</h3>
          <div className="author-list">
            {topAuthors.length > 0 ? (
              topAuthors.map((author) => (
                <div key={author.author_id} className="author-item">
                  <Link
                    to={`/userprofile/${author.author_id}`}
                    className="author-card"
                  >
                    <div className="author-icon">
                      <img
                        src={profile}
                        alt={author.author_name || "Author"}
                        className="author-profile-img"
                      />
                    </div>
                  </Link>
                  <p className="author-name">
                    {author.author_name || "Unknown Author"}
                  </p>
                </div>
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
