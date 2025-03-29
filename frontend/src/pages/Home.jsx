import { useState, useEffect } from "react"; // Import hooks to manage state and lifecycle
import { Link } from "react-router-dom"; // Import Link for routing to different pages
import api from "../api"; // Import API utility for making requests
import Notes from "../components/Notes"; // Import Notes component for displaying individual notes
import "../styles/Home.css"; // Import styling for the home page

function Home() {
  // State variables to manage notes, content of new note, and title of new note
  const [notes, setNotes] = useState([]); // Stores all notes fetched from the API
  const [content, setContent] = useState(""); // Stores the content of the new note
  const [title, setTitle] = useState(""); // Stores the title of the new note

  // useEffect hook to fetch notes when the component mounts (on first render)
  useEffect(() => {
    getNotes(); // Call getNotes function to fetch the notes from the API
  }, []); // Empty dependency array ensures this runs only once after the first render

  // Function to get all notes from the API
  const getNotes = () => {
    api
      .get("/api/notes/") // Send GET request to fetch notes
      .then((res) => res.data) // Extract data from the response
      .then((data) => {
        setNotes(data); // Set the notes in state
      })
      .catch((err) => alert(err)); // Handle errors by showing an alert
  };

  // Function to delete a note by its ID
  const deleteNote = (id) => {
    api
      .delete(`/api/notes/delete/${id}/`) // Send DELETE request to remove the note
      .then((res) => {
        if (res.status === 204)
          alert("Note deleted!"); // Alert on successful deletion
        else alert("Failed to delete note."); // Alert if deletion fails
        getNotes(); // Re-fetch notes after deletion to update the list
      })
      .catch((error) => alert(error)); // Handle errors by showing an alert
  };

  // Function to create a new note
  const createNote = (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    api
      .post("/api/notes/", { content, title }) // Send POST request with note content and title
      .then((res) => {
        if (res.status === 201)
          alert("Note created!"); // Alert on successful creation
        else alert("Failed to make note."); // Alert if creation fails
        getNotes(); // Re-fetch notes to include the newly created note
      })
      .catch((err) => alert(err)); // Handle errors by showing an alert
  };

  return (
    <div>
      {/* Link to the CreateBook Page */}
      <div style={{ margin: "20px 0" }}>
        <Link to="/create-book" className="create-book-link">
          Create a New Book
        </Link>
      </div>

      <div>
        {/* Display the list of notes */}
        <h2>Notes</h2>
        {notes.map((note) => (
          <Notes note={note} onDelete={deleteNote} key={note.id} /> // Render each note using Notes component
        ))}
      </div>

      <h2>Create a Note</h2>
      {/* Form to create a new note */}
      <form onSubmit={createNote}>
        <label htmlFor="title">Title:</label>
        <br />
        <input
          type="text"
          id="title"
          name="title"
          required // Title field is required
          onChange={(e) => setTitle(e.target.value)} // Update the title state when user types
          value={title} // Controlled input, value from state
        />
        <label htmlFor="content">Content:</label>
        <br />
        <textarea
          id="content"
          name="content"
          required // Content field is required
          value={content} // Controlled input, value from state
          onChange={(e) => setContent(e.target.value)} // Update the content state when user types
        ></textarea>
        <br />
        <input type="submit" value="Submit" />{" "}
        {/* Submit button to create the note */}
      </form>
    </div>
  );
}

export default Home;
