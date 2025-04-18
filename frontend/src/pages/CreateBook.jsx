import { useState, useEffect } from "react";
import "../styles/CreateBook.css";
import api from "../api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function CreateBook() {
  // Navigate function for routing
  const navigate = useNavigate();

  // State variables for handling input fields and form data
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [language, setLanguage] = useState("");
  const [mature, setMature] = useState(false);
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // List of available genres to choose from
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

  // Empty useEffect to keep the initial setup
  useEffect(() => {}, []);

  // Handle click on a genre button
  const handleGenreClick = (genre) => {
    if (selectedGenres.includes(genre)) {
      // Remove genre if already selected
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else if (selectedGenres.length < 3) {
      // Add genre if fewer than 3 genres are selected
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  // Handle the cover photo upload
  const handleCoverPhotoChange = (e) => {
    const file = e.target.files[0];
    // Check if the file is an image and less than 5MB in size
    if (
      file &&
      file.size <= 5 * 1024 * 1024 &&
      (file.type === "image/jpeg" || file.type === "image/png")
    ) {
      setCoverPhoto(URL.createObjectURL(file)); // Set preview URL for the cover photo
      setCoverFile(file); // Store the file itself for submission
    } else {
      alert("Please upload a valid image (JPEG or PNG) under 5MB.");
    }
  };

  // Handle saving the book data
  const handleSave = async () => {
    // Validate required fields
    if (!title || !description || selectedGenres.length === 0 || !language) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsLoading(true); // Start loading

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("genres", JSON.stringify(selectedGenres));
    formData.append("language", language);
    formData.append("mature", mature);
    if (coverFile) {
      formData.append("cover_photo", coverFile); // Add cover photo if provided
    }

    // Get the user's token for authorization
    const token = localStorage.getItem("access");

    try {
      const response = await api.post("/api/books/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      // If book is created successfully, navigate to the book's chapter creation page
      if (response.status === 201) {
        alert("Book created successfully!");
        // Reset the form fields
        setTitle("");
        setDescription("");
        setSelectedGenres([]);
        setLanguage("");
        setMature(false);
        setCoverPhoto(null);
        setCoverFile(null);

        navigate(`/write/books/${response.data.book_id}/chapters/`, {
          replace: true, // Prevents the user from navigating back to this form after successful submission
        });
      }
    } catch (error) {
      // Handle different error types
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
      setIsLoading(false); // Stop loading after the request
    }
  };

  return (
    <div className="create-book-container">
      {/* Render Navbar component without search and write button */}
      <Navbar showSearch={false} showWriteButton={false} />

      <div className="createbook-container">
        <div className="createbook-form">
          {/* Display cover photo if uploaded, or show placeholder */}
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
            {/* Title field */}
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            {/* Description field */}
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>

            {/* Genre selection */}
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

            {/* Language selection */}
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

            {/* Mature rating */}
            <label>Rating</label>
            <div className="mature-rating">
              <span>Mature</span>
              <input
                type="checkbox"
                checked={mature}
                onChange={() => setMature(!mature)}
              />
            </div>

            {/* Save button */}
            <button
              className="createbook-save-button"
              onClick={handleSave}
              disabled={isLoading} // Disable button while saving
              aria-live="polite"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Render Footer component */}
      <Footer />
    </div>
  );
}

export default CreateBook;
