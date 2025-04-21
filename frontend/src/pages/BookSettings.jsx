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
  const [coverPreview, setCoverPreview] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
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

  // fetch book details
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

  // handle input chnages
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  //handle image upload
  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    } else {
      alert("Please upload a valid image (JPEG or PNG)");
    }
  };

  //handle genre selection
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

  // save changes
  const handleSave = () => {
    const data = new FormData();

    // prepare from data
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("genres", JSON.stringify(formData.genres));
    data.append("status", formData.status);
    data.append("mature", formData.mature);
    data.append("language", book.language);
    if (coverFile) {
      data.append("cover_photo", coverFile);
    }

    // Debug what's being sent
    for (let [key, value] of data.entries()) {
      console.log(key, value);
    }

    api
      .put(`/api/books/${book_id}/`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      })
      .then((res) => {
        setBook(res.data);
        setIsEditing(false);
        setCoverFile(null);
        setCoverPreview(null);
        fetchBookDetails();
      })
      .catch((err) => {
        console.error("Full error:", err);
        console.error("Error details:", err.response?.data);
        alert(
          `Failed to update: ${
            JSON.stringify(err.response?.data) || "Please try again"
          }`
        );
      });
  };

  // delete book
  const handleDelete = () => {
    api
      .delete(`/api/books/delete/${book_id}/`)
      .then(() => {
        navigate("/profile");
      })
      .catch(() => alert("Error deleting book"));
  };

  if (!book) return <div>Loading...</div>;

  //available genres
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
        {/* book cover section */}
        <div className="book-card-view">
          {isEditing ? (
            // cover upload in edit mode
            <div className="cover-upload-container">
              <label className="cover-upload-label">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="cover-upload-input"
                />
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="new cover preview"
                    className="cover-preview"
                  />
                ) : book.cover_url ? (
                  <img
                    src={book.cover_url}
                    alt="current cover"
                    className="cover-preview"
                  />
                ) : (
                  <div className="cover-upload-placeholder">
                    click to upload new cover
                  </div>
                )}
              </label>
              {coverPreview && (
                <button
                  onClick={() => {
                    setCoverPreview(null);
                    setCoverFile(null);
                  }}
                  className="remove-cover-btn"
                >
                  remove
                </button>
              )}
            </div>
          ) : (
            // display book cover in view mode
            <Book book={book} />
          )}
        </div>

        {/* book details form */}
        <div className="book-settings-form">
          {isEditing ? (
            // edit form
            <>
              <div className="form-group">
                <label>title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>genres (max 3)</label>
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
                <label>status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="public">public</option>
                  <option value="private">private</option>
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
                  <span className="mature-toggle-label">mature content</span>
                </label>
              </div>
            </>
          ) : (
            // view mode
            <>
              <h2>{book.title}</h2>
              <p className="book-description">{book.description}</p>

              <div className="book-meta">
                <div>
                  <strong>genres:</strong> {book.genres.join(", ")}
                </div>
                <div>
                  <strong>status:</strong> {book.status}
                </div>
                {book.mature && (
                  <div className="mature-status">
                    <span className="mature-badge">mature</span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* action buttons */}
          <div className="action-buttons">
            <div className="left-buttons">
              {isEditing ? (
                <>
                  <button onClick={handleSave} className="save-btn">
                    save changes
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      // reset form to original book data
                      setFormData({
                        title: book.title,
                        description: book.description,
                        genres: book.genres,
                        status: book.status,
                      });
                    }}
                    className="cancel-btn"
                  >
                    cancel
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} className="edit-btn">
                  edit book
                </button>
              )}

              <button
                onClick={() => setShowDeleteModal(true)}
                className="delete-btn"
              >
                delete book
              </button>
            </div>

            <Link
              to={`/write/books/${book.book_id}/chapters`}
              className="continue-writing-btn"
            >
              continue writing
            </Link>
          </div>
        </div>
      </div>

      {/* delete confirmation modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        title="delete book"
        confirmText="delete"
      >
        <p>
          are you sure you want to delete this book? this action cannot be
          undone.
        </p>
      </ConfirmationModal>

      <Footer />
    </div>
  );
}

export default BookSettings;
