// Importing the CSS file for styling the Note component
import "../styles/Note.css";

// The Note component which takes note data and a delete function as props
function Note({ note, onDelete }) {
  // Format the creation date of the note into a human-readable string
  const formattedDate = new Date(note.created_at).toLocaleDateString("en-UK");

  return (
    <div className="note-container">
      {" "}
      {/* Container for the individual note */}
      <p className="note-title">{note.title}</p>{" "}
      {/* Displays the note's title */}
      <p className="note-content">{note.content}</p>{" "}
      {/* Displays the note's content */}
      <p className="note-date">{formattedDate}</p>{" "}
      {/* Displays the formatted creation date */}
      {/* Button to delete the note. When clicked, calls the onDelete function with the note's id */}
      <button className="delete-button" onClick={() => onDelete(note.id)}>
        Delete
      </button>
    </div>
  );
}

// Exporting the Note component for use in other files
export default Note;
