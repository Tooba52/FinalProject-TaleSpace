// Book.jsx

function Book({ book }) {
  // Format the publication date of the book into a human-readable string
  const formattedDate = new Date(book.publication_date).toLocaleDateString(
    "en-UK"
  );

  return (
    <div className="book-card">
      <img src={book.cover_photo} alt={book.title} className="book-cover" />
      <p>{book.title}</p>
    </div>
  );
}

export default Book;
