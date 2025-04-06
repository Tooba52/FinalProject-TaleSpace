import React from "react";
import "../styles/Books.css";
import defaultCover from "../images/defaultCoverPhoto.jpeg"; // Import the image

function Book({ book }) {
  // Debug: Check what the API returns
  console.log("Book data:", {
    cover_photo: book.cover_photo,
    cover_url: book.cover_url,
  });

  return (
    <div className="book-card">
      <img
        src={book.cover_photo ? book.cover_url : defaultCover}
        alt={`Cover for ${book.title}`}
        onError={(e) => {
          e.target.src = defaultCover;
        }}
      />
      <p className="bookcard-title">{book.title}</p>
    </div>
  );
}

export default Book;
