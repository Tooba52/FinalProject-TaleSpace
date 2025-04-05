import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import debounce from "lodash.debounce";
import Navbar from "../components/Navbar";

function WriteBook() {
  const { book_id, chapter_id } = useParams();
  const [firstName, setFirstName] = useState("");
  const navigate = useNavigate();

  const [state, setState] = useState({
    isLoading: true,
    chapters: [],
    content: "", 
    chapterTitle: "", 
    bookTitle: "",
    editingId: null, 
    tempTitle: "", 
    status: "draft",
    lastSaved: null, 
    saveState: "idle",
  });

  // Destructure for cleaner access
  const {
    isLoading,
    chapters,
    content,
    chapterTitle,
    bookTitle,
    editingId,
    tempTitle,
    status,
    lastSaved,
    saveState,
  } = state;

  // API Operations
  const autoSave = useCallback(
    debounce(async (content) => {
      if (!chapter_id || !content.trim() || status === "published") return;

      try {
        setState((prev) => ({ ...prev, saveState: "saving" }));

        await api.put(
          `/api/books/${book_id}/chapters/${chapter_id}/`,
          { chapter_content: content, chapter_status: "draft" },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          }
        );

        setState((prev) => ({
          ...prev,
          saveState: "saved",
          lastSaved: new Date(),
          status: "draft",
        }));
      } catch (err) {
        setState((prev) => ({ ...prev, saveState: "error" }));
        console.error("Auto-save failed:", err);
      }
    }, 5000),
    [book_id, chapter_id, status]
  );

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [chaptersRes, contentRes] = await Promise.all([
          api.get(`/api/books/${book_id}/chapters/`),
          chapter_id
            ? api.get(`/api/books/${book_id}/chapters/${chapter_id}/`)
            : null,
        ]);

        // Get book title from first chapter's book reference
        const bookTitle = chaptersRes.data[0]?.book?.title || "Untitled Book";

        setState((prev) => ({
          ...prev,
          bookTitle,
          chapters: chaptersRes.data,
          content: contentRes?.data?.chapter_content || "",
          chapterTitle: contentRes?.data?.chapter_title || "",
          status: contentRes?.data?.chapter_status || "draft",
          isLoading: false,
        }));
      } catch (err) {
        setState((prev) => ({ ...prev, isLoading: false }));
        console.error("Loading failed:", err);
      }
    };

    fetchUserProfile();
    fetchData();
    return () => autoSave.cancel();
  }, [book_id, chapter_id, autoSave]);

  const fetchUserProfile = () => {
    api
      .get("/api/user/profile/") 
      .then((res) => {
        setFirstName(res.data.first_name); 
      })
      .catch((err) => console.error("Error fetching user profile", err)); 
  };


  //Chapter actions
  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setState((prev) => ({ ...prev, content: newContent }));
    autoSave(newContent);
  };

  const handleSaveDraft = async () => {
    try {
      setState((prev) => ({ ...prev, saveState: "saving" }));

      await api.put(
        `/api/books/${book_id}/chapters/${chapter_id}/`,
        { chapter_content: content },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );

      setState((prev) => ({
        ...prev,
        saveState: "saved",
        lastSaved: new Date(),
      }));
    } catch (err) {
      setState((prev) => ({ ...prev, saveState: "error" }));
      console.error("Save failed:", err);
    }
  };

  const handlePublish = async () => {
    try {
      setState((prev) => ({ ...prev, saveState: "saving" }));

      const response = await api.put(
        `/api/books/${book_id}/chapters/${chapter_id}/`,
        { chapter_content: content, chapter_status: "published" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );

      setState((prev) => ({
        ...prev,
        saveState: "published",
        status: "published",
        chapters: prev.chapters.map((ch) =>
          ch.chapter_id === chapter_id
            ? { ...ch, chapter_status: "published" }
            : ch
        ),
      }));
    } catch (err) {
      setState((prev) => ({ ...prev, saveState: "error" }));
      console.error("Publish failed:", err);
    }
  };

  const handleTitleUpdate = async (chapterId) => {
    try {
      await api.put(
        `/api/books/${book_id}/chapters/${chapterId}/`,
        { chapter_title: tempTitle },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );

      setState((prev) => ({
        ...prev,
        chapters: prev.chapters.map((ch) =>
          ch.chapter_id === chapterId ? { ...ch, chapter_title: tempTitle } : ch
        ),
        editingId: null,
      }));
    } catch (err) {
      console.error("Title update failed:", err);
    }
  };

  const createChapter = async () => {
    try {
      const response = await api.post(
        `/api/books/${book_id}/chapters/`,
        {
          chapter_title: "Untitled",
          chapter_content: "",
          chapter_status: "draft",
          book: book_id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );

      setState((prev) => ({
        ...prev,
        chapters: [...prev.chapters, response.data],
      }));

      navigate(`/books/${book_id}/chapters/${response.data.chapter_id}`, {
        replace: true,
      });
    } catch (err) {
      console.error("Chapter creation failed:", err);
    }
  };

  // Render
  if (isLoading) return <div className="loading">Loading...</div>;

  return (
    <div className="write-book-container">
      <Navbar
        firstName={firstName}
        showSearch={false}
        showWriteButton={false}
      />
      <h1 className="book-title-header">
        {bookTitle}
        {status === "published" && (
          <span className="published-badge">Published</span>
        )}
      </h1>

      {/* CHAPTER SIDEBAR */}
      <div className="chapter-sidebar">
        <h3>Chapters</h3>
        <ul>
          {chapters.map((chapter) => (
            <li
              key={chapter.chapter_id}
              style={{
                fontWeight:
                  chapter_id == chapter.chapter_id ? "bold" : "normal",
              }}
            >
              {editingId === chapter.chapter_id ? (
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, tempTitle: e.target.value }))
                  }
                  onBlur={() => handleTitleUpdate(chapter.chapter_id)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleTitleUpdate(chapter.chapter_id)
                  }
                  autoFocus
                />
              ) : (
                <div
                  onClick={() =>
                    navigate(
                      `/books/${book_id}/chapters/${chapter.chapter_id}`,
                      { replace: true }
                    )
                  }
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setState((prev) => ({
                      ...prev,
                      editingId: chapter.chapter_id,
                      tempTitle: chapter.chapter_title || "",
                    }));
                  }}
                >
                  {chapter.chapter_title || "Untitled"}
                </div>
              )}
            </li>
          ))}
        </ul>
        <button onClick={createChapter}>Create New Chapter</button>
      </div>

      {/* WRITING AREA */}
      <div className="writing-area">
        <div className="status-bar">
          <span className={`status-badge ${status}`}>
            {status.toUpperCase()}
            {lastSaved && status === "draft" && (
              <span className="save-time">
                {saveState === "saving"
                  ? "Saving..."
                  : `Last saved: ${lastSaved.toLocaleTimeString()}`}
              </span>
            )}
          </span>
        </div>

        <h3>{chapterTitle || "Untitled"}</h3>

        <textarea
          value={content}
          onChange={handleContentChange}
          readOnly={status === "published"}
          placeholder={
            status === "published"
              ? "Published (read-only)"
              : "Write your chapter content here..."
          }
          rows={10}
        />

        <div className="action-buttons">
          <button
            onClick={handleSaveDraft}
            disabled={saveState === "saving" || status === "published"}
          >
            {saveState === "saving" ? "Saving..." : "Save Draft"}
          </button>
          <button
            onClick={handlePublish}
            disabled={saveState === "saving" || status === "published"}
            className="publish-btn"
          >
            Publish Chapter
          </button>
        </div>
      </div>
    </div>
  );
}

export default WriteBook;
