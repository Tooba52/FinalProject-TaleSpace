import React from "react";
import "../styles/Books.css";
import defaultCover from "../images/defaultCoverPhoto.jpeg";

// displays for a single book card
const Book = ({ book }) => {
  // returns the image URL for cover
  const getCoverImage = () => {
    if (book.cover_url) {
      if (book.cover_url.startsWith("/")) {
        return `http://127.0.0.1:8000${book.cover_url}`;
      }
      return book.cover_url;
    }
    // fallback to default cover
    return defaultCover;
  };

  return (
    //book photo
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
      {/* book title */}
      <p className="book-title">{book.title}</p>
    </div>
  );
};

export default Book;
