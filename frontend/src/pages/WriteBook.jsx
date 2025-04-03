import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

function WriteBook() {
  const { book_id } = useParams(); // Get book ID from URL
  // const [content, setContent] = useState("");
  const [isLoading, setLoading] = useState(true);
  const [chapters, setChapters] = useState([]);
  const [bookHasChapters, setBookHasChapters] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // fetchBookContent();
    fetchChapters();
  }, [book_id]);

  const fetchChapters = async () => {
    try {
      const response = await api.get(`/api/books/${book_id}/chapters/`);
      if (response.data.length === 0) {
        setBookHasChapters(false); // No chapters available
      } else {
        setBookHasChapters(true); // Book has chapters
      }
      setChapters(response.data);
    } catch (err) {
      console.error("Error fetching chapters:", err);
      setError("Failed to load chapters.");
    } finally {
      setLoading(false);
    }
  };

  const handleChapterClick = (chapter) => {
    setSelectedChapter(chapter); // Store the selected chapter
  };

  const createChapter = async () => {
    try {
      const newChapter = {
        chapter_number: chapters.length + 1, // New chapter number
        chapter_title: "New Chapter", // Default title
        chapter_content: "This is the content of the new chapter.", // Default content
      };
      const response = await api.post(
        `/api/books/${book_id}/chapters/`,
        newChapter
      );
      setChapters((prevChapters) => [...prevChapters, response.data]);
    } catch (err) {
      console.error("Error creating chapter:", err);
      setError("Failed to create chapter.");
    }
  };

  if (isLoading) return <p>Loading chapters...</p>;
  if (error) return <p>{error}</p>;

  // const fetchBookContent = async () => {
  //   const token = localStorage.getItem("access"); // Retrieve access token
  //   console.log("🔍 Fetching token:", token); // Debugging token

  //   if (!token) {
  //     alert("User not authenticated. Please log in again.");
  //     return;
  //   }

  //   try {
  //     const response = await api.get(`/api/books/${book_id}/content/`, {
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem("access")}`, // Attach token
  //       },
  //     });

  //     setContent(response.data.content);
  //   } catch (error) {
  //     console.error("❌ Error fetching book content:", error);
  //     alert("Failed to load book content.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const handleSave = async () => {
  //   const token = localStorage.getItem("access");

  //   if (!token) {
  //     alert("User not authenticated. Please log in again.");
  //     return;
  //   }

  //   try {
  //     await api.post(
  //       `/api/books/${book_id}/chapters/`, // API route to create a new chapter
  //       {
  //         chapter_number: 1,
  //         chapter_title: "Introduction",
  //         chapter_content: "This is the content of the first chapter.",
  //         chapter_status: "draft",
  //       }, // Replace with dynamic data
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`, // Attach token
  //         },
  //       }
  //     );
  //     alert("Chapter saved successfully!");
  //   } catch (error) {
  //     console.error("❌ Error saving chapter:", error);
  //     alert("Failed to save chapter.");
  //   }
  // };

  const handleSave = async () => {
    const token = localStorage.getItem("access"); // Retrieve token

    if (!token) {
      alert("User not authenticated. Please log in again.");
      return;
    }

    try {
      await api.put(
        `/api/books/${book_id}/content/`,
        { content },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Attach token
          },
        }
      );

      alert("Book content saved successfully!");
    } catch (error) {
      console.error("❌ Error saving book content:", error);
      alert("Failed to save content.");
    }
  };

  return (
    <div className="write-book-container">
      <div className="sidebar">
        <h3>Chapters</h3>
        <ul>
          {chapters.map((chapter) => (
            <li key={chapter.chapter_number}>
              Chapter {chapter.chapter_number}:{" "}
              {chapter.chapter_title || "Untitled"}
            </li>
          ))}
        </ul>
        {!bookHasChapters && (
          <p>
            This book currently has no chapters. A default chapter has been
            created.
          </p>
        )}
        <button onClick={createChapter}>Create New Chapter</button>
      </div>
      <div className="writing-area">
        {chapters.length === 0 ? (
          <p>Select or create a chapter to start writing.</p>
        ) : (
          <p>Click on a chapter to begin editing its content.</p>
        )}
      </div>
    </div>
  );
}

export default WriteBook;
