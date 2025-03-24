import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/CreateBook.css";
import logo from "../images/logo.jpeg";
import api from "../api";

function CreateBook() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [language, setLanguage] = useState("");
  const [mature, setMature] = useState(false);
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  const genres = [
    "Thriller",
    "Romance",
    "Action",
    "Mystery",
    "Fantasy",
    "Adventure",
    "Horror",
    "Sci-Fi",
    "Comedy",
    "Historical",
    "Drama",
    "Dystopian",
    "Supernatural",
    "Paranormal",
    "Crime",
    "Suspense",
    "Cyberpunk",
    "Steampunk",
    "Fairy Tale",
    "Mythology",
    "Gothic",
    "Post-Apocalyptic",
    "Slice of Life",
  ];

  const handleGenreClick = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else if (selectedGenres.length < 3) {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleCoverPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverPhoto(URL.createObjectURL(file));
      setCoverFile(file); // Store the actual file
    }
  };

  const handleSave = async () => {
    if (!title || !description || selectedGenres.length === 0 || !language) {
      alert("Please fill in all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("genres", JSON.stringify(selectedGenres));
    formData.append("language", language);
    formData.append("mature", mature);
    if (coverFile) {
      formData.append("cover_photo", coverFile);
    }

    const token = localStorage.getItem("access"); // Get the correct token
    console.log("🔍 Sending token:", token);

    try {
      const response = await api.post("/api/books/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("✅ Book Created Successfully:", response.data);

      if (response.status === 201) {
        alert("Book created successfully!");
        setTitle("");
        setDescription("");
        setSelectedGenres([]);
        setLanguage("");
        setMature(false);
        setCoverPhoto(null);
        setCoverFile(null);
      }
    } catch (error) {
      console.error("❌ Error creating book:", error);

      if (error.response) {
        console.log("🔍 Error Response:", error.response.data);
      }

      alert("Failed to create book. Please try again.");
    }
  };

  return (
    <div className="create-book-container">
      {/* Navigation Bar */}
      <div className="nav-bar">
        <Link to="/" className="logo">
          <img src={logo} alt="TaleSpace Logo" />
          <span>TaleSpace</span>
        </Link>
        <Link to="/profile" className="profile-icon">
          <span>👤 Username</span>
        </Link>
      </div>

      <div className="book-container">
        {/* Book Creation Form */}
        <div className="book-form">
          {/* Cover Photo Section */}
          <div className="cover-photo">
            {coverPhoto ? (
              <img src={coverPhoto} alt="Cover Preview" />
            ) : (
              <label className="upload-placeholder">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverPhotoChange}
                />
                Choose Cover Photo
              </label>
            )}
          </div>

          {/* Form Fields */}
          <div className="form-fields">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>

            <label>Select Genres (Choose up to 3)</label>
            <div className="genres">
              {genres.map((genre) => (
                <button
                  key={genre}
                  className={selectedGenres.includes(genre) ? "selected" : ""}
                  onClick={() => handleGenreClick(genre)}
                >
                  {genre}
                </button>
              ))}
            </div>

            <label>Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="">Select a language</option>
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
            </select>

            <label>Rating</label>
            <div className="mature-rating">
              <span>Mature</span>
              <input
                type="checkbox"
                checked={mature}
                onChange={() => setMature(!mature)}
              />
            </div>

            <button className="save-button" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateBook;
