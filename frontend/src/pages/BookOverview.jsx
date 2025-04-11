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
  const [newComment, setNewComment] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [userId, setUserId] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    console.log("Component mounted - current favourite status:", isFavourite);
    fetchBookDetails();
    fetchComments();
    fetchUserProfile();
    checkIfFavourite();
  }, [book_id]);

  useEffect(() => {
    console.log("Favorite status updated:", isFavourite);
  }, [isFavourite]);

  const fetchUserProfile = () => {
    api
      .get("/api/user/profile/")
      .then((res) => {
        setUserId(res.data.user_id);
        setFirstName(res.data.first_name);
        setLastName(res.data.last_name);
        // Only check favourite status after we have the user ID
        checkIfFavourite();
      })
      .catch((err) => console.error("Error fetching user profile", err));
  };

  const fetchBookDetails = () => {
    setIsLoading(true);
    api
      .get(`/api/books/${book_id}/`)
      .then((res) => {
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
        setIsFavourite(res.data.is_favourite); // Set the initial favourite status
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
    if (newComment.trim() === "") return;
    const payload = {
      comment_content: newComment,
      comment_user: userId,
      comment_book: book_id,
    };
    api
      .post(`/api/books/${book_id}/comments/create/`, payload)
      .then((res) => {
        setComments([...comments, res.data]);
        setNewComment("");
      })
      .catch((err) => {
        console.error("Error adding comment", err);
      });
  };

  const handleDeleteComment = (commentId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this comment?"
    );
    if (!confirmDelete) return;
    api
      .delete(`/api/comments/${commentId}/delete/`)
      .then(() => {
        setComments(
          comments.filter((comment) => comment.comment_id !== commentId)
        );
      })
      .catch((err) => {
        console.error("Error deleting comment", err);
      });
  };

  const toggleFavourite = () => {
    if (isFavourite) {
      api
        .delete(`/api/books/${book_id}/remove_favourite/`)
        .then(() => {
          setIsFavourite(false); // Set the favourite state to false
        })
        .catch((err) => console.error("Error removing favourite", err));
    } else {
      api
        .post(`/api/books/${book_id}/add_favourite/`)
        .then(() => {
          setIsFavourite(true); // Set the favourite state to true
        })
        .catch((err) => console.error("Error adding favourite", err));
    }
  };

  const startReading = () => {
    navigate(`/read/${book_id}/chapters/1`);
  };

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
        <div className="book-card-view">
          <Book book={book} />
        </div>
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

      <div className="comments-section">
        <h3>Comments</h3>
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

        <div className="comments-list">
          {sortedComments.length > 0 ? (
            sortedComments.map((comment) => (
              <div key={comment.comment_id} className="comment-item">
                {comment.comment_user === userId && (
                  <button
                    onClick={() => handleDeleteComment(comment.comment_id)}
                    className="delete-comment-btn"
                    aria-label="Delete Comment"
                  >
                    <FaTrash />
                  </button>
                )}
                <div className="comment-author">
                  {comment.comment_user === userId
                    ? `${firstName} ${lastName}`
                    : comment.comment_user_full_name}
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
