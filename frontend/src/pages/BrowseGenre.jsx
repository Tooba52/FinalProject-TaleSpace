import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";
import BookCard from "../components/books";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Pagination from "../components/Pagination";
import Action from "../images/action.png";
import Adventure from "../images/adventure.png";
import Animal from "../images/animal.png";
import Apocalypse from "../images/apocalypse.png";
import Comedy from "../images/crime.png";
import Crime from "../images/crime.png";
import Cyberpunk from "../images/cyberpunk.png";
import Drama from "../images/drama.png";
import Dystopian from "../images/dystopian.png";
import Fairytale from "../images/fairytale.png";
import Fantasy from "../images/fantasy.png";
import Fiction from "../images/fiction.png";
import Gothic from "../images/gothic.png";
import Heartbreak from "../images/heartbreak.png";
import Historical from "../images/historical.png";
import Horror from "../images/horror.png";
import Musical from "../images/musical.png";
import Mystery from "../images/mystery.png";
import Mythology from "../images/mythology.png";
import Paranormal from "../images/paranormal.png";
import Romance from "../images/romance.png";
import SciFi from "../images/scifi.png";
import SliceOfLife from "../images/sliceoflife.png";
import Sports from "../images/sports.png";
import Steampunk from "../images/steampunk.png";
import Supernatural from "../images/supernatural.png";
import Thriller from "../images/thriller.png";
import "../styles/BrowseGenre.css";

function BrowseGenre() {
  const { genreName, pageNumber = 1 } = useParams();
  const currentPage = parseInt(pageNumber, 10) || 1;
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  const genreImages = {
    Action,
    Adventure,
    Animal,
    Comedy,
    Crime,
    Cyberpunk,
    Drama,
    Dystopian,
    "Fairy Tale": Fairytale,
    Fiction,
    Fantasy,
    Gothic,
    Heartbreak,
    Horror,
    Historical,
    Musical,
    Mythology,
    Mystery,
    Paranormal,
    "Post-Apocalyptic": Apocalypse,
    Romance,
    "Sci-Fi": SciFi,
    "Slice of Life": SliceOfLife,
    Sports,
    Steampunk,
    Supernatural,
    Thriller,
  };

  const genreDescriptions = {
    Action: "High-stakes plots filled with daring feats and explosive moments.",
    Adventure: "Exciting journeys and quests across uncharted territories.",
    Animal: "Heartwarming and wild tales from the animal kingdom.",
    Comedy: "Stories that will make you laugh, smile, and feel good.",
    Crime: "Gripping tales of criminals, detectives, and unsolved mysteries.",
    Cyberpunk: "Futuristic worlds with advanced tech and gritty underbellies.",
    Drama:
      "Emotionally charged stories about real-life struggles and triumphs.",
    Dystopian: "Dark, oppressive societies that challenge the human spirit.",
    "Fairy Tale":
      "Magical stories with whimsical characters and timeless morals.",
    Fiction: "Inventive narratives born purely from imagination.",
    Fantasy: "Imaginary worlds with magic, mythical beings, and epic quests.",
    Gothic: "Dark, mysterious stories with romance, horror, and decay.",
    Heartbreak: "Raw, emotional tales of love lost and lessons learned.",
    Horror: "Terrifying tales that haunt the mind and chill the soul.",
    Historical:
      "Stories set in the past, blending fact and fiction beautifully.",
    Musical: "Stories where music weaves through the characters and plot.",
    Mythology: "Legends and lore from ancient cultures and deities.",
    Mystery: "Whodunits and puzzling plots that keep you guessing.",
    Paranormal: "Ghosts, spirits, and phenomena beyond scientific explanation.",
    "Post-Apocalyptic": "Survival stories in worlds ravaged by catastrophe.",
    Romance: "Heartfelt tales of love, passion, and connection.",
    "Sci-Fi": "Futuristic tales exploring science, space, and the unknown.",
    "Slice of Life": "Everyday moments and personal stories with deep emotion.",
    Sports: "Driven characters and the drama of competitive games.",
    Steampunk: "Retro-futuristic adventures powered by steam and gears.",
    Supernatural: "Mystical forces, beings, and unexplained occurrences.",
    Thriller: "Fast-paced, suspenseful stories with twists and tension.",
  };

  useEffect(() => {
    fetchBooks();
  }, [genreName, currentPage]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/api/browse/${genreName}/page/${currentPage}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      setBooks(response.data.results);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      setError(error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      navigate(`/browse/${genreName}/page/${newPage}`);
      window.scrollTo(0, 0);
    }
  };

  const handleBookClick = (bookId) => {
    navigate(`/overview/books/${bookId}`);
  };

  const getGenreIcon = (genre) => {
    if (!genre) return Fiction;
    if (genreImages[genre]) return genreImages[genre];
    const matchedKey = Object.keys(genreImages).find(
      (key) => key.toLowerCase() === genre.toLowerCase()
    );
    return matchedKey ? genreImages[matchedKey] : Fiction;
  };

  const getGenreDescription = (genre) => {
    if (!genre) return genreDescriptions.default;
    if (genreDescriptions[genre]) return genreDescriptions[genre];
    const matchedKey = Object.keys(genreDescriptions).find(
      (key) => key.toLowerCase() === genre.toLowerCase()
    );
    return matchedKey
      ? genreDescriptions[matchedKey]
      : genreDescriptions.default;
  };

  return (
    <div className="browse-genre-container">
      <Navbar />

      <div className="content-wrapper">
        <div className="genre-header">
          <div className="genre-title-container">
            <img
              src={getGenreIcon(genreName)}
              alt={`${genreName} icon`}
              className="browse-genre-icon"
            />
            <div className="genre-description">
              {getGenreDescription(genreName)}
            </div>
          </div>
          <h1 className="browse-genre-title">{genreName} Books</h1>
          <div className="header-divider"></div>
        </div>

        <div className="book-grid-container">
          <div className="book-grid">
            {books.length > 0 ? (
              books.map((book) => (
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
                No books found in this genre.
              </div>
            )}
          </div>
        </div>

        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          basePath={`/browse/${genreName}`}
        />
      </div>

      <Footer />
    </div>
  );
}

export default BrowseGenre;
