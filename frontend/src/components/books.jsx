function Book({ book }) {
  return (
    //visual formatting for the books including cover and title
    <div className="book-card">
      <img src={book.cover_photo} alt={book.title} className="book-cover" />
      <p>{book.title}</p>
    </div>
  );
}

export default Book;
