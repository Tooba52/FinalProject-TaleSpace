import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Book from "../components/books";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { FaExclamationTriangle } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import "../styles/BookOverview.css";

function BookOverview() {
  const { book_id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [isFavourite, setIsFavourite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState("");
  const [newComment, setNewComment] = useState(""); // Declare newComment state
  const [sortOrder, setSortOrder] = useState("newest");
  const [userId, setUserId] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    fetchBookDetails();
    checkIfFavourite();
    fetchComments();
    fetchUserProfile();
  }, [book_id]);

  const fetchUserProfile = () => {
    api
      .get("/api/user/profile/") // Adjust the URL if needed
      .then((res) => {
        setUserId(res.data.user_id); // Add this line to set the user ID
        setFirstName(res.data.first_name);
        setLastName(res.data.last_name); // This line might be incorrect. It should be res.data.last_name
      })
      .catch((err) => console.error("Error fetching user profile", err));
  };

  const fetchBookDetails = () => {
    setIsLoading(true);
    api
      .get(`/api/books/${book_id}/`)
      .then((res) => {
        console.log("Full API response:", res.data);
        setBook(res.data);
      })
      .catch((err) => {
        console.error("Error:", err);
        if (err.response?.status === 404) {
          navigate("/not-found");
        }
      })
      .finally(() => setIsLoading(false));
  };

  const checkIfFavourite = () => {
    api
      .get(`/api/books/${book_id}/is_favourite/`)
      .then((res) => {
        setIsFavourite(res.data.is_favourite);
      })
      .catch((err) => console.error("Error checking favourite status", err));
  };

  const fetchComments = () => {
    api
      .get(`/api/books/${book_id}/comments/`)
      .then((res) => {
        setComments(res.data);
      })
      .catch((err) => console.error("Error fetching comments", err));
  };

  const handleAddComment = () => {
    console.log("Add Comment Button Pressed"); // Debug: Confirm if this runs
    if (newComment.trim() === "") return; // Prevent empty comments
    console.log("Comment Content:", newComment); // Debug: Show comment content

    const payload = {
      comment_content: newComment, // The comment content
      comment_user: userId, // Use the userId from state
      comment_book: book_id, // Current book ID
    };

    console.log("Payload for comment:", payload);

    api
      .post(`/api/books/${book_id}/comments/create/`, payload)
      .then((res) => {
        console.log("Comment Added:", res.data); // Log the response from the backend
        setComments([...comments, res.data]); // Update the comment list
        setNewComment(""); // Clear the input after successful submission
      })
      .catch((err) => {
        console.error("Error adding comment", err); // Log the full error details
        if (err.response && err.response.data) {
          console.error("Backend error details:", err.response.data.errors); // Log the errors returned from the backend
        }
      });
  };

  const handleDeleteComment = (commentId) => {
    // Ask the user for confirmation before deleting
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this comment?"
    );
    if (!confirmDelete) return;

    api
      .delete(`/api/comments/${commentId}/delete/`) // Use the correct URL here
      .then(() => {
        // Update comments list after successful deletion
        setComments(
          comments.filter((comment) => comment.comment_id !== commentId)
        );
        console.log("Comment deleted successfully");
      })
      .catch((err) => {
        console.error("Error deleting comment", err);
        if (err.response && err.response.data) {
          console.error("Backend error details:", err.response.data.detail); // Adjusted for error response
        }
      });
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
    navigate(`/read/${book_id}/chapters/1`);
  };

  // Sorting Comments
  const sortedComments = comments.sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.comment_created_at) - new Date(a.comment_created_at);
    } else {
      return new Date(a.comment_created_at) - new Date(b.comment_created_at);
    }
  });

  if (isLoading) return <div>Loading...</div>;
  if (!book) return <div>Book not found</div>;

  return (
    <div className="overview">
      <Navbar showSearch={false} showWriteButton={true} />

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

      {/* Comment Section */}
      <div className="comments-section">
        <h3>Comments</h3>

        {/* Sort Buttons */}
        <div className="sort-buttons">
          <button
            onClick={() => setSortOrder("newest")}
            className={sortOrder === "newest" ? "active" : ""}
          >
            Newest
          </button>
          <button
            onClick={() => setSortOrder("oldest")}
            className={sortOrder === "oldest" ? "active" : ""}
          >
            Oldest
          </button>
        </div>

        {/* Comment Input */}
        <div className="add-comment">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
          ></textarea>
          <button onClick={handleAddComment} className="add-comment-btn">
            Add Comment
          </button>
        </div>

        {/* Comments List */}
        <div className="comments-list">
          {sortedComments.length > 0 ? (
            sortedComments.map((comment) => (
              <div key={comment.comment_id} className="comment-item">
                {/* Display delete button only if the user is the comment author */}
                {comment.comment_user === userId && (
                  <button
                    onClick={() => handleDeleteComment(comment.comment_id)}
                    className="delete-comment-btn"
                    aria-label="Delete Comment"
                  >
                    <FaTrash />
                  </button>
                )}

                {/* Display the comment author */}
                <div className="comment-author">
                  {comment.comment_user === userId
                    ? `${firstName} ${lastName}` // If it's the logged-in user's comment
                    : comment.comment_user_full_name}{" "}
                </div>
                <div className="comment-content">{comment.comment_content}</div>
                <div className="comment-date">
                  {new Date(comment.comment_created_at).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <p>No comments yet. Be the first to comment!</p>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default BookOverview;
