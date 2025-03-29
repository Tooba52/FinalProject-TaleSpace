// Import necessary libraries and components
import { useState } from "react"; // useState hook to manage state in the component
import { Link } from "react-router-dom"; // Link component for routing
import "../styles/CreateBook.css"; // CSS styles for the component
import logo from "../images/logo.jpeg"; // Logo for the navigation bar
import api from "../api"; // API utility to make requests
import { useNavigate } from "react-router-dom";

function CreateBook() {
  const navigate = useNavigate(); // Initialize navigation

  // State variables for managing form inputs and book creation
  const [title, setTitle] = useState(""); // For book title
  const [description, setDescription] = useState(""); // For book description
  const [selectedGenres, setSelectedGenres] = useState([]); // For selected genres (up to 3)
  const [language, setLanguage] = useState(""); // For book language selection
  const [mature, setMature] = useState(false); // For the mature rating checkbox
  const [coverPhoto, setCoverPhoto] = useState(null); // For cover photo preview
  const [coverFile, setCoverFile] = useState(null); // For storing the file object
  const [isLoading, setIsLoading] = useState(false); // Loading state while saving the book

  // Predefined genres for selection
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

  // Handles genre selection; allows up to 3 genres to be selected
  const handleGenreClick = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre)); // Deselect genre
    } else if (selectedGenres.length < 3) {
      setSelectedGenres([...selectedGenres, genre]); // Add genre if not already selected
    }
  };

  // Handles cover photo file selection and displays preview
  const handleCoverPhotoChange = (e) => {
    const file = e.target.files[0];
    if (
      file &&
      file.size <= 5 * 1024 * 1024 && // Check file size (limit to 5MB)
      (file.type === "image/jpeg" || file.type === "image/png") // Check file type (JPEG/PNG)
    ) {
      setCoverPhoto(URL.createObjectURL(file)); // Display preview of selected image
      setCoverFile(file); // Store the actual file for uploading
    } else {
      alert("Please upload a valid image (JPEG or PNG) under 5MB."); // Alert user for invalid file
    }
  };

  // Handles the saving of the book details
  const handleSave = async () => {
    // Ensure required fields are filled out
    if (!title || !description || selectedGenres.length === 0 || !language) {
      alert("Please fill in all required fields."); // Alert if any required field is missing
      return;
    }

    setIsLoading(true); // Set loading state to true when saving the book

    // Prepare form data to send in the API request
    const formData = new FormData();
    formData.append("title", title); // Append title
    formData.append("description", description); // Append description
    formData.append("genres", JSON.stringify(selectedGenres)); // Append selected genres as JSON
    formData.append("language", language); // Append language
    formData.append("mature", mature); // Append mature rating status
    if (coverFile) {
      formData.append("cover_photo", coverFile); // Append the cover photo file
    }

    const token = localStorage.getItem("access"); // Get the access token from localStorage
    console.log("🔍 Sending token:", token); // Debugging: logging token to ensure it's being sent

    try {
      // API request to create the book
      const response = await api.post("/api/books/", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Set content type for file upload
          Authorization: `Bearer ${token}`, // Attach the token to the request headers
        },
      });

      console.log("✅ Book Created Successfully:", response.data); // Success response

      if (response.status === 201) {
        alert("Book created successfully!"); // Notify the user of success
        // Reset form fields after successful submission
        setTitle("");
        setDescription("");
        setSelectedGenres([]);
        setLanguage("");
        setMature(false);
        setCoverPhoto(null);
        setCoverFile(null);

        navigate(`/write/${response.data.id}`); // Redirect to the writing page
      }
    } catch (error) {
      console.error("❌ Error creating book:", error);

      // Handle different types of errors more specifically
      if (error.response) {
        console.log("🔍 Error Response:", error.response.data);
        alert(
          `Failed to create book: ${
            error.response.data.detail || "An unknown error occurred."
          }`
        ); // Display detailed error message
      } else {
        alert("Failed to create book. Please try again."); // Generic error message
      }
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  return (
    <div className="create-book-container">
      {/* Navigation Bar */}
      <div className="nav-bar">
        <Link to="/" className="logo">
          <img src={logo} alt="TaleSpace Logo" /> {/* Logo image */}
          <span>TaleSpace</span>
        </Link>
        <Link to="/profile" className="profile-icon">
          <span>👤 Username</span> {/* Profile link */}
        </Link>
      </div>

      <div className="book-container">
        {/* Book Creation Form */}
        <div className="book-form">
          {/* Cover Photo Section */}
          <div className="cover-photo">
            {coverPhoto ? (
              <img src={coverPhoto} alt="Cover Preview" /> // Display cover photo if selected
            ) : (
              <label className="upload-placeholder">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverPhotoChange}
                />
                Choose Cover Photo {/* Prompt to upload a photo */}
              </label>
            )}
          </div>

          {/* Form Fields for book details */}
          <div className="form-fields">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)} // Handle title input
            />

            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)} // Handle description input
            ></textarea>

            <label>Select Genres (Choose up to 3)</label>
            <div className="genres">
              {genres.map((genre) => (
                <button
                  key={genre}
                  className={selectedGenres.includes(genre) ? "selected" : ""} // Highlight selected genres
                  onClick={() => handleGenreClick(genre)} // Handle genre selection
                >
                  {genre}
                </button>
              ))}
            </div>

            <label>Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)} // Handle language selection
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
                onChange={() => setMature(!mature)} // Handle mature rating toggle
              />
            </div>

            <button
              className="save-button"
              onClick={handleSave}
              disabled={isLoading} // Disable the button while saving
              aria-live="polite" // Make sure screen readers announce the loading state
            >
              {isLoading ? "Saving..." : "Save"}{" "}
              {/* Show loading text while saving */}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateBook;
