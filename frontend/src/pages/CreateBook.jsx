import { useState, useEffect } from "react";
import "../styles/CreateBook.css";
import api from "../api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function CreateBook() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");

  // State variables for managing form inputs and book creation
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [language, setLanguage] = useState("");
  const [mature, setMature] = useState(false);
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
    "Fiction",
  ];

  // useEffect hook to fetch
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = () => {
    api
      .get("/api/user/profile/") // Fetch user details
      .then((res) => {
        setFirstName(res.data.first_name); // Set the first name in state
      })
      .catch((err) => console.error("Error fetching user profile", err));
  };

  //allows up to 3 genres to be selected
  const handleGenreClick = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else if (selectedGenres.length < 3) {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  // Handles cover photo file selection and displays preview
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

  // Handles the saving of the book details
  const handleSave = async () => {
    // Ensure required fields are filled out
    if (!title || !description || selectedGenres.length === 0 || !language) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);

    // Prepare form data
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
    console.log("🔍 Sending token:", token);

    try {
      // API request to create the book
      const response = await api.post("/api/books/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Book Created Successfully:", response.data);

      if (response.status === 201) {
        alert("Book created successfully!");
        // Reset form fields after successful submission
        setTitle("");
        setDescription("");
        setSelectedGenres([]);
        setLanguage("");
        setMature(false);
        setCoverPhoto(null);
        setCoverFile(null);

        navigate(`/write/books/${response.data.book_id}/chapters/`, {
          replace: true,
        }); // Redirect to the writing page
      }
    } catch (error) {
      console.error("❌ Error creating book:", error);

      if (error.response) {
        console.log("🔍 Status Code:", error.response.status);
        console.log("🔍 Response Data:", error.response.data);
        console.log("🔍 Headers:", error.response.headers);

        alert(`Failed to create book: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        console.log("🔍 Request:", error.request);
        alert("No response received from server");
      } else {
        console.log("🔍 Error Message:", error.message);
        alert("Error setting up request: " + error.message);
      }
    }
  };

  return (
    <div className="create-book-container">
      {/* Navigation Bar */}
      <Navbar
        firstName={firstName}
        showSearch={false}
        showWriteButton={false}
      />

      <div className="createbook-container">
        {/* Book Creation Form */}
        <div className="createbook-form">
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

          {/* Form Fields for book details */}
          <div className="createbook-form-fields">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {/* Description */}
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
            {/* Select Genres */}
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
            {/* Language */}
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
            {/* Rating */}
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
              {isLoading ? "Saving..." : "Save"}{" "}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default CreateBook;
