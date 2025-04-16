import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ConfirmationModal from "../components/ConfirmationModal";
import "../styles/BookSettings.css";
import Book from "../components/books";

function BookSettings() {
  const { book_id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    genres: [],
    status: "public",
    mature: false,
  });

  useEffect(() => {
    fetchBookDetails();
  }, [book_id]);

  const fetchBookDetails = () => {
    api
      .get(`/api/books/${book_id}/`)
      .then((res) => {
        setBook(res.data);
        setFormData({
          title: res.data.title,
          description: res.data.description,
          genres: res.data.genres,
          status: res.data.status,
          mature: res.data.mature || false,
        });
      })
      .catch(() => alert("Error loading book details"));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleGenreClick = (genre) => {
    const currentGenres = formData.genres;
    let updatedGenres;

    if (currentGenres.includes(genre)) {
      updatedGenres = currentGenres.filter((g) => g !== genre);
    } else if (currentGenres.length < 3) {
      updatedGenres = [...currentGenres, genre];
    } else {
      return;
    }

    setFormData({
      ...formData,
      genres: updatedGenres,
    });
  };

  const handleSave = () => {
    const updateData = {
      title: formData.title,
      description: formData.description,
      genres: formData.genres,
      status: formData.status,
      mature: formData.mature,
      language: book.language,
    };

    api
      .put(`/api/books/${book_id}/`, updateData)
      .then((res) => {
        setBook(res.data);
        setIsEditing(false);
        setFormData({
          title: res.data.title,
          description: res.data.description,
          genres: res.data.genres,
          status: res.data.status,
          mature: res.data.mature,
        });
      })
      .catch((err) => {
        alert(
          `Failed to update: ${
            err.response?.data?.detail || "Please try again"
          }`
        );
      });
  };

  const handleDelete = () => {
    api
      .delete(`/api/books/delete/${book_id}/`)
      .then(() => {
        navigate("/profile");
      })
      .catch(() => alert("Error deleting book"));
  };

  if (!book) return <div>Loading...</div>;

  const genres = [
    "Action",
    "Adventure",
    "Animal",
    "Comedy",
    "Crime",
    "Cyberpunk",
    "Drama",
    "Dystopian",
    "Fairy Tale",
    "Fiction",
    "Fantasy",
    "Gothic",
    "Heartbreak",
    "Horror",
    "Historical",
    "Musical",
    "Mythology",
    "Mystery",
    "Paranormal",
    "Post-Apocalyptic",
    "Romance",
    "Sci-Fi",
    "Slice of Life",
    "Sports",
    "Steampunk",
    "Supernatural",
    "Thriller",
  ];

  return (
    <div className="book-settings">
      <Navbar />

      <div className="book-settings-container">
        <div className="book-card-view">
          <Book book={book} />
        </div>

        <div className="book-settings-form">
          {isEditing ? (
            <>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Genres (max 3)</label>
                <div className="createbook-genres">
                  {genres.map((genre) => (
                    <button
                      key={genre}
                      className={
                        formData.genres.includes(genre) ? "selected" : ""
                      }
                      onClick={() => handleGenreClick(genre)}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
                <p className="genre-limit-message">
                  {formData.genres.length}/3 genres selected
                </p>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div className="form-group">
                <label className="mature-toggle">
                  <input
                    type="checkbox"
                    name="mature"
                    checked={formData.mature}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        mature: e.target.checked,
                      });
                    }}
                  />
                  <span className="mature-toggle-label">Mature Content</span>
                </label>
              </div>
            </>
          ) : (
            <>
              <h2>{book.title}</h2>
              <p className="book-description">{book.description}</p>

              <div className="book-meta">
                <div>
                  <strong>Genres:</strong> {book.genres.join(", ")}
                </div>
                <div>
                  <strong>Status:</strong> {book.status}
                </div>
                {book.mature && (
                  <div className="mature-status">
                    <span className="mature-badge">Mature</span>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="action-buttons">
            <div className="left-buttons">
              {isEditing ? (
                <>
                  <button onClick={handleSave} className="save-btn">
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        title: book.title,
                        description: book.description,
                        genres: book.genres,
                        status: book.status,
                      });
                    }}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} className="edit-btn">
                  Edit Book
                </button>
              )}

              <button
                onClick={() => setShowDeleteModal(true)}
                className="delete-btn"
              >
                Delete Book
              </button>
            </div>

            <Link
              to={`/write/books/${book.book_id}/chapters`}
              className="continue-writing-btn"
            >
              Continue Writing
            </Link>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        title="Delete Book"
        confirmText="Delete"
      >
        <p>
          Are you sure you want to delete this book? This action cannot be
          undone.
        </p>
      </ConfirmationModal>

      <Footer />
    </div>
  );
}

export default BookSettings;
