import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Book from "../components/books";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import "../styles/BookOverview.css";

function BookOverview() {
  const { book_id } = useParams();
  const [firstName, setFirstName] = useState("");
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [isFavourite, setIsFavourite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBookDetails();
    fetchUserProfile();
    checkIfFavourite();
  }, [book_id]);

  const fetchBookDetails = () => {
    setIsLoading(true);
    api
      .get(`/api/books/${book_id}/`)
      .then((res) => {
        console.log("Full API response:", res.data);
        console.log("Author ID:", res.data.author_id);
        console.log("Author Name:", res.data.author_name);
        setBook(res.data);
        if (!res.data) {
          throw new Error("No data received");
        }
        setBook(res.data);
      })
      .catch((err) => {
        console.error("Error:", err);
        if (err.response?.status === 404) {
          navigate("/not-found");
        } else {
          // Handle other errors
        }
      })
      .finally(() => setIsLoading(false));
  };

  const fetchUserProfile = () => {
    api
      .get("/api/user/profile/")
      .then((res) => {
        setFirstName(res.data.first_name);
      })
      .catch((err) => console.error("Error fetching user profile", err));
  };

  const checkIfFavourite = () => {
    api
      .get(`/api/books/${book_id}/is_favourite/`)
      .then((res) => {
        setIsFavourite(res.data.is_favourite);
      })
      .catch((err) => console.error("Error checking favourite status", err));
  };

  const toggleFavourite = () => {
    if (isFavourite) {
      api
        .delete(`/api/books/${book_id}/remove_favourite/`)
        .then(() => {
          setIsFavourite(false);
        })
        .catch((err) => console.error("Error removing favourite", err));
    } else {
      api
        .post(`/api/books/${book_id}/add_favourite/`)
        .then(() => {
          setIsFavourite(true);
        })
        .catch((err) => console.error("Error adding favourite", err));
    }
  };

  const startReading = () => {
    // Navigate to the first chapter
    navigate(`/read/${book_id}/chapters/1`);
  };

  if (isLoading) return <div>Loading...</div>;
  if (!book) return <div>Book not found</div>;

  return (
    <div className="overview">
      <Navbar firstName={firstName} showSearch={false} showWriteButton={true} />

      <div className="overview-container">
        {/* Left Side - Book Card */}
        <div className="book-card-view">
          <Book book={book} />
        </div>

        {/* Right Side - Book Details */}
        <div className="overview-content">
          <div className="overview-header">
            <div className="title-container">
              <h1>{book.title}</h1>
            </div>
            <button
              onClick={toggleFavourite}
              className={`overview-favourite-btn ${
                isFavourite ? "active" : ""
              }`}
              aria-label={
                isFavourite ? "Remove from favourites" : "Add to favourites"
              }
            >
              {isFavourite ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>

          <div className="overview-author">
            By {book.author_name || "Unknown Author"}
          </div>

          <div className="overview-meta">
            <div>
              <strong>Genres:</strong> {book.genres.join(", ")}
            </div>
            {book.status === "mature" && (
              <div className="mature-label-container">
                <span className="mature-label">
                  <FaExclamationTriangle className="mature-icon" /> Mature
                  Content
                </span>
              </div>
            )}
          </div>

          <div className="overview-description">
            <h3>Description</h3>
            <p>{book.description}</p>
          </div>

          {/* Action Buttons */}
          <div className="overview-action-buttons">
            <button
              onClick={startReading}
              className="overview-start-reading-btn"
            >
              Start Reading
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default BookOverview;
