import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Book from "../components/books";
import { FaHeart, FaRegHeart } from "react-icons/fa";
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
    fetchBookDetails();
    fetchComments();
    fetchUserProfile();
    checkIfFavourite();
  }, [book_id]);

  // get current user's profile data
  const fetchUserProfile = () => {
    api
      .get("/api/user/profile/")
      .then((res) => {
        setUserId(res.data.user_id);
        setFirstName(res.data.first_name);
        setLastName(res.data.last_name);
        checkIfFavourite();
      })
      .catch((err) => console.error("Error fetching user profile", err));
  };

  // get book details
  const fetchBookDetails = () => {
    setIsLoading(true);
    api
      .get(`/api/books/${book_id}/`)
      .then((res) => {
        const bookData = res.data;
        return bookData;
      })
      .then((finalBookData) => {
        setBook(finalBookData);
      })
      .catch((err) => {
        console.error("Error fetching book:", err);
        if (err.response?.status === 404) {
          navigate("/not-found");
        }
      })
      .finally(() => setIsLoading(false));
  };

  // check if book is in user's favorites
  const checkIfFavourite = () => {
    api
      .get(`/api/books/${book_id}/is_favourite/`)
      .then((res) => {
        setIsFavourite(res.data.is_favourite);
      })
      .catch((err) => console.error("Error checking favourite status", err));
  };

  // navigate to author's profile
  const handleAuthorClick = () => {
    navigate(`/userprofile/${book.author}`);
  };

  // fetch comments for this book
  const fetchComments = () => {
    api
      .get(`/api/books/${book_id}/comments/`)
      .then((res) => {
        setComments(res.data);
      })
      .catch((err) => console.error("Error fetching comments", err));
  };

  // add new comment
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

  // delete a comment
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

  // toggle favourite status
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

  // start reading first chapter
  const startReading = () => {
    navigate(`/read/${book_id}/chapters/1`);
  };

  // sort comments by date
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
      <Navbar />
      <div className="overview-container">
        {/* book cover and basic info */}
        <div className="book-card-view">
          <Book book={book} />
        </div>

        {/* book details section */}
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
                isFavourite ? "remove from favorites" : "add to favorites"
              }
            >
              {isFavourite ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>

          {/* author info */}
          <div className="overview-author">
            by{" "}
            <span
              className="author-link"
              onClick={handleAuthorClick}
              style={{ cursor: "pointer", textDecoration: "underline" }}
            >
              {book.author_name || "unknown author"}
            </span>
          </div>

          {/* book data */}
          <div className="overview-meta">
            <div>
              <strong>genres:</strong> {book.genres.join(", ")}
            </div>
            {book.mature && (
              <div className="mature-status">
                <span className="mature-badge">mature</span>
              </div>
            )}
          </div>

          {/* book description */}
          <div className="overview-description">
            <h3>description</h3>
            <p>{book.description}</p>
          </div>

          {/* action buttons */}
          <div className="overview-action-buttons">
            <button
              onClick={startReading}
              className="overview-start-reading-btn"
            >
              start reading
            </button>
          </div>
        </div>
      </div>

      {/* comments section */}
      <div className="comments-section">
        <h3>comments</h3>
        <div className="sort-buttons">
          <button
            onClick={() => setSortOrder("newest")}
            className={sortOrder === "newest" ? "active" : ""}
          >
            newest
          </button>
          <button
            onClick={() => setSortOrder("oldest")}
            className={sortOrder === "oldest" ? "active" : ""}
          >
            oldest
          </button>
        </div>

        {/* add new comment */}
        <div className="add-comment">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="write a comment..."
          ></textarea>
          <button onClick={handleAddComment} className="add-comment-btn">
            add comment
          </button>
        </div>

        {/* comments list */}
        <div className="comments-list">
          {sortedComments.length > 0 ? (
            sortedComments.map((comment) => (
              <div key={comment.comment_id} className="comment-item">
                {/* show delete button for user's own comments */}
                {comment.comment_user === userId && (
                  <button
                    onClick={() => handleDeleteComment(comment.comment_id)}
                    className="delete-comment-btn"
                    aria-label="delete comment"
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
            <p>no comments yet. be the first to comment!</p>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default BookOverview;
