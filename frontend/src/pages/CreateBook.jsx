import { useState, useEffect } from "react";
import "../styles/CreateBook.css";
import api from "../api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function CreateBook() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [language, setLanguage] = useState("");
  const [mature, setMature] = useState(false);
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {}, []);

  const handleGenreClick = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else if (selectedGenres.length < 3) {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleCoverPhotoChange = (e) => {
    const file = e.target.files[0];
    if (
      file &&
      file.size <= 5 * 1024 * 1024 &&
      (file.type === "image/jpeg" || file.type === "image/png")
    ) {
      setCoverPhoto(URL.createObjectURL(file));
      setCoverFile(file);
    } else {
      alert("Please upload a valid image (JPEG or PNG) under 5MB.");
    }
  };

  const handleSave = async () => {
    if (!title || !description || selectedGenres.length === 0 || !language) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("genres", JSON.stringify(selectedGenres));
    formData.append("language", language);
    formData.append("mature", mature);
    if (coverFile) {
      formData.append("cover_photo", coverFile);
    }

    const token = localStorage.getItem("access");

    try {
      const response = await api.post("/api/books/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201) {
        alert("Book created successfully!");
        setTitle("");
        setDescription("");
        setSelectedGenres([]);
        setLanguage("");
        setMature(false);
        setCoverPhoto(null);
        setCoverFile(null);

        navigate(`/write/books/${response.data.book_id}/chapters/`, {
          replace: true,
        });
      }
    } catch (error) {
      if (error.response) {
        alert(
          `Failed to create book: ${
            error.response.data.detail || "Unknown error"
          }`
        );
      } else if (error.request) {
        alert("No response received from server");
      } else {
        alert("Error setting up request");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-book-container">
      <Navbar showSearch={false} showWriteButton={false} />

      <div className="createbook-container">
        <div className="createbook-form">
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

          <div className="createbook-form-fields">
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
            <div className="createbook-genres">
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

            <button
              className="createbook-save-button"
              onClick={handleSave}
              disabled={isLoading}
              aria-live="polite"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default CreateBook;
