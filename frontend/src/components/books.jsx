import React from "react";
import "../styles/Books.css";
import defaultCover from "../images/defaultCoverPhoto.jpeg";

function Book({ book }) {
  const getCoverImage = () => {
    // Use absolute URL if provided
    if (book.cover_url) {
      // Ensure URL is absolute (prepends backend URL if relative)
      if (book.cover_url.startsWith("/")) {
        return `http://127.0.0.1:8000${book.cover_url}`;
      }
      return book.cover_url;
    }

    // Fallback to default
    return defaultCover;
  };

  return (
    <div className="book-card">
      <div className="cover-container">
        <img
          className="book-cover"
          src={getCoverImage()}
          alt={`Cover for ${book.title}`}
          onError={(e) => {
            console.error("Failed to load cover:", e.target.src);
            e.target.src = defaultCover;
          }}
        />
      </div>
      <p className="book-title">{book.title}</p>
    </div>
  );
}

export default Book;
