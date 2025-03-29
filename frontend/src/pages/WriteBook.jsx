import { useParams } from "react-router-dom";

function WriteBook() {
  const { id } = useParams(); // Get the book ID from the URL

  return (
    <div>
      <h1>Start Writing Your Book</h1>
      <p>Book ID: {id}</p>
      <textarea
        placeholder="Start writing your story here..."
        rows="15"
        cols="80"
      ></textarea>
    </div>
  );
}

export default WriteBook;
