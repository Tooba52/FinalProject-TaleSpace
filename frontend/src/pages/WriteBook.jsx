import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import ChapterList from "../components/ChapterList";

function WriteBook() {
  const { book_id, chapter_id } = useParams(); // Get book ID from URL
  const [isLoading, setLoading] = useState(true);
  const [chapters, setChapters] = useState([]);
  const [chapterContent, setChapterContent] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [editingChapterId, setEditingChapterId] = useState(null);
  const [tempChapterTitle, setTempChapterTitle] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchChapters();
    setChapterContent("");
    setChapterTitle("");
    if (chapter_id) {
      fetchChapterContent(chapter_id);
    }
  }, [chapter_id, book_id]);

  const fetchChapters = async () => {
    try {
      const response = await api.get(`/api/books/${book_id}/chapters/`);
      setChapters(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching chapters:", err);
      setError("Failed to load chapters.");
      setLoading(false);
    }
  };

  // Fetch content for the specific chapter
  const fetchChapterContent = async (chapterId) => {
    try {
      const response = await api.get(
        `/api/books/${book_id}/chapters/${chapterId}/`
      );
      setChapterTitle(response.data.chapter_title);
      setChapterContent(response.data.chapter_content);
    } catch (err) {
      console.error("Error fetching chapter content:", err);
      setError("Failed to load chapter content.");
    }
  };

  const handleSaveDraft = async () => {
    try {
      const updatedChapter = {
        chapter_content: chapterContent, // Updated content
      };

      // Get the JWT token from localStorage or wherever you're storing it
      const token = localStorage.getItem("auth_token"); // Adjust according to your storage method

      console.log("Token:", token);

      const response = await api.put(
        `/api/books/${book_id}/chapters/${chapter_id}/`,
        updatedChapter,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add the token to the Authorization header
          },
        }
      );
      console.log("Chapter updated:", response.data);
    } catch (err) {
      console.error("Error saving draft:", err);
    }
  };

  // Title editing functions
  const handleTitleDoubleClick = (chapter, e) => {
    e.stopPropagation();
    setEditingChapterId(chapter.chapter_id);
    setTempChapterTitle(chapter.chapter_title || "");
  };

  const handleTitleChange = (e) => {
    setTempChapterTitle(e.target.value);
  };

  const saveChapterTitle = async (chapterId) => {
    try {
      const updatedChapter = {
        chapter_title: tempChapterTitle,
      };

      const token = localStorage.getItem("auth_token");
      await api.put(
        `/api/books/${book_id}/chapters/${chapterId}/`,
        updatedChapter,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setChapters(
        chapters.map((chapter) =>
          chapter.chapter_id === chapterId
            ? { ...chapter, chapter_title: tempChapterTitle }
            : chapter
        )
      );
      setEditingChapterId(null);
    } catch (err) {
      console.error("Error updating chapter title:", err);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>; // Show loading indicator while fetching
  }

  const createChapter = async () => {
    try {
      const newChapter = {
        chapter_title: "Untitled",
        chapter_content: "",
        chapter_status: "draft",
        book: book_id, // Include the book reference
      };

      // Include auth token
      const token = localStorage.getItem("auth_token");
      const response = await api.post(
        `/api/books/${book_id}/chapters/`,
        newChapter,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setChapters((prevChapters) => [...prevChapters, response.data]);
      navigate(`/books/${book_id}/chapters/${response.data.chapter_id}`, {
        replace: true,
      });
    } catch (err) {
      console.error("Error creating chapter:", err);
      setError("Failed to create chapter.");
    }
  };

  // Handle chapter click to change URL and fetch new chapter content
  const handleChapterClick = (clickedChapterId) => {
    navigate(`/books/${book_id}/chapters/${clickedChapterId}`, {
      replace: true,
    });
  };

  if (isLoading) return <p>Loading chapters...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="write-book-container">
      <div className="chapter-sidebar">
        <h3>Chapters</h3>
        <ul>
          {chapters.map((chapter) => (
            <li
              key={chapter.chapter_id}
              style={{
                cursor: "pointer",
                fontWeight:
                  chapter_id == chapter.chapter_id ? "bold" : "normal",
              }}
            >
              {editingChapterId === chapter.chapter_id ? (
                <input
                  type="text"
                  className="chapter-title-input"
                  value={tempChapterTitle}
                  onChange={handleTitleChange}
                  onBlur={() => saveChapterTitle(chapter.chapter_id)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      saveChapterTitle(chapter.chapter_id);
                    }
                  }}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <div
                  onClick={() => handleChapterClick(chapter.chapter_id)}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    handleTitleDoubleClick(chapter, e);
                  }}
                  style={{ textDecoration: "underline" }}
                >
                  {chapter.chapter_title || "Untitled"}
                </div>
              )}
            </li>
          ))}
        </ul>
        <button onClick={createChapter}>Create New Chapter</button>
      </div>
      <div className="writing-area">
        <h3>{chapterTitle || "Untitled"}</h3>
        <textarea
          placeholder="Write your chapter content here..."
          value={chapterContent}
          onChange={(e) => setChapterContent(e.target.value)}
          rows="10"
          cols="50"
        />
        <button onClick={handleSaveDraft}>Save as Draft</button>
      </div>
    </div>
  );
}

export default WriteBook;
