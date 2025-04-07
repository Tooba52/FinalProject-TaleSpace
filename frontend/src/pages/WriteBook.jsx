import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import debounce from "lodash.debounce";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ConfirmationModal } from "../components/ConfirmationModal";
import "../styles/Writebook.css";

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

  const [modalState, setModalState] = useState({
    isOpen: false,
    action: null, // 'delete' or 'publish'
    chapterId: null,
    chapterTitle: null,
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
            ? api
                .get(`/api/books/${book_id}/chapters/${chapter_id}/`)
                .catch(() => null)
            : null,
        ]);

        // Get book title from first chapter's book reference
        const bookTitle =
          chaptersRes.data[0]?.book_detail?.title || "Untitled Book";

        // Check if the current chapter exists
        const currentChapterExists = chaptersRes.data.some(
          (ch) => ch.chapter_id == chapter_id
        );

        // If we're on a chapter URL but that chapter doesn't exist, redirect
        if (
          chapter_id &&
          !currentChapterExists &&
          chaptersRes.data.length > 0
        ) {
          navigate(
            `/write/books/${book_id}/chapters/${chaptersRes.data[0].chapter_id}`,
            { replace: true }
          );
          return;
        }

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
        console.error("Loading failed:", err);
        setState((prev) => ({ ...prev, isLoading: false }));

        // If there's an error, redirect to book overview
        navigate(`/books/${book_id}`);
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
      // Find current chapter index
      const currentChapterIndex = chapters.findIndex(
        (ch) => ch.chapter_id == chapter_id
      );

      // Check if any previous chapters are unpublished
      const unpublishedPreviousChapters = chapters
        .slice(0, currentChapterIndex)
        .some((ch) => ch.chapter_status !== "published");

      if (unpublishedPreviousChapters) {
        alert(
          "You must publish all previous chapters before publishing this one."
        );
        return;
      }

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

  const showPublishConfirmation = () => {
    const chapter = chapters.find((ch) => ch.chapter_id == chapter_id);
    setModalState({
      isOpen: true,
      action: "publish",
      chapterId: chapter_id,
      chapterTitle: chapter?.chapter_title || "Untitled Chapter",
    });
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

  const showDeleteConfirmation = (chapterId) => {
    const chapter = chapters.find((ch) => ch.chapter_id === chapterId);
    setModalState({
      isOpen: true,
      action: "delete",
      chapterId,
      chapterTitle: chapter?.chapter_title || "Untitled Chapter",
    });
  };

  const handleDeleteChapter = async (chapterId) => {
    // Prevent deleting first chapter
    const chapterIndex = chapters.findIndex(
      (ch) => ch.chapter_id === chapterId
    );
    if (chapterIndex === 0) {
      alert("The first chapter cannot be deleted");
      return;
    }

    // Prevent deleting published chapters
    const chapterToDelete = chapters.find((ch) => ch.chapter_id === chapterId);
    if (chapterToDelete?.chapter_status === "published") {
      alert("Published chapters cannot be deleted");
      return;
    }

    try {
      await api.delete(`/api/books/${book_id}/chapters/${chapterId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      // Remove deleted chapter from state
      const updatedChapters = chapters.filter(
        (ch) => ch.chapter_id !== chapterId
      );
      setState((prev) => ({
        ...prev,
        chapters: updatedChapters,
      }));

      // Handle navigation if we're currently viewing the deleted chapter
      if (chapter_id == chapterId) {
        if (updatedChapters.length > 0) {
          navigate(
            `/books/${book_id}/chapters/${updatedChapters[0].chapter_id}`,
            { replace: true }
          );
        } else {
          navigate(`/books/${book_id}`);
        }
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete chapter");
    }
  };

  const handleConfirmAction = async () => {
    if (modalState.action === "delete") {
      await handleDeleteChapter(modalState.chapterId);
    } else if (modalState.action === "publish") {
      await handlePublish();
    }
    setModalState({
      isOpen: false,
      action: null,
      chapterId: null,
      chapterTitle: null,
    });
  };

  const handleCancelAction = () => {
    setModalState({
      isOpen: false,
      action: null,
      chapterId: null,
      chapterTitle: null,
    });
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

      {/* HEADER SECTION */}
      <div className="book-header">
        <h1 className="book-title">Editing: {bookTitle}</h1>
      </div>

      {/* CHAPTER HEADER WITH ACTIONS */}
      <div className="chapter-header-container">
        <div className="chapter-header">
          <h2 className="chapter-title">{chapterTitle || "Untitled"}</h2>
          <div className="chapter-actions">
            <div className="action-buttons">
              <button
                onClick={handleSaveDraft}
                disabled={saveState === "saving" || status === "published"}
              >
                {saveState === "saving" ? "Saving..." : "Save Draft"}
              </button>
              <button
                onClick={showPublishConfirmation}
                disabled={
                  saveState === "saving" ||
                  status === "published" ||
                  chapters
                    .slice(
                      0,
                      chapters.findIndex((ch) => ch.chapter_id == chapter_id)
                    )
                    .some((ch) => ch.chapter_status !== "published")
                }
                className="publish-btn"
                title={
                  chapters
                    .slice(
                      0,
                      chapters.findIndex((ch) => ch.chapter_id == chapter_id)
                    )
                    .some((ch) => ch.chapter_status !== "published")
                    ? "You must publish all previous chapters first"
                    : ""
                }
              >
                {saveState === "saving" ? "Publishing..." : "Publish Chapter"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="content-area">
        {/* CHAPTER SIDEBAR */}
        <div className="chapter-sidebar">
          <h3>Chapters</h3>
          <ul className="chapter-list">
            {chapters.map((chapter, index) => (
              <li
                key={chapter.chapter_id}
                className={chapter_id == chapter.chapter_id ? "active" : ""}
                onClick={() =>
                  navigate(
                    `/write/books/${book_id}/chapters/${chapter.chapter_id}`,
                    {
                      replace: true,
                    }
                  )
                }
              >
                {editingId === chapter.chapter_id &&
                chapter.chapter_status !== "published" ? (
                  <div
                    className="chapter-item-editing"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      value={tempTitle}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          tempTitle: e.target.value,
                        }))
                      }
                      onBlur={() => handleTitleUpdate(chapter.chapter_id)}
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        handleTitleUpdate(chapter.chapter_id)
                      }
                      autoFocus
                    />
                    {/* Only show delete button if not first chapter AND not published */}
                    {index > 0 && chapter.chapter_status !== "published" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          showDeleteConfirmation(chapter.chapter_id);
                        }}
                        className="delete-chapter-btn"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="chapter-item">
                    <div
                      className="chapter-text"
                      data-published={chapter.chapter_status === "published"}
                      onDoubleClick={(e) => {
                        if (chapter.chapter_status === "published") return;
                        e.stopPropagation();
                        setState((prev) => ({
                          ...prev,
                          editingId: chapter.chapter_id,
                          tempTitle: chapter.chapter_title || "",
                        }));
                      }}
                    >
                      {chapter.chapter_title || "Untitled"}
                      {chapter.chapter_status === "published" ? (
                        <span className="chapter-status-published">
                          • Published
                        </span>
                      ) : (
                        <span className="chapter-status-draft">• Draft</span>
                      )}
                    </div>
                    {/* Only show delete button if not first chapter AND not published */}
                    {index > 0 && chapter.chapter_status !== "published" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          showDeleteConfirmation(chapter.chapter_id);
                        }}
                        className="delete-chapter-btn"
                      >
                        🗑️
                      </button>
                    )}
                    {/* Show explanation if published */}
                    {chapter.chapter_status === "published" && index > 0 && (
                      <span className="cannot-delete-message">
                        (Cannot be edited)
                      </span>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
          <button onClick={createChapter} className="new-chapter-btn">
            + New Chapter
          </button>
        </div>

        {/* WRITING AREA */}
        <div className="writing-area">
          <textarea
            value={content}
            onChange={handleContentChange}
            readOnly={status === "published"}
            placeholder={
              status === "published" ? "Published (read-only)" : "Type here..."
            }
          />
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onCancel={handleCancelAction}
        onConfirm={handleConfirmAction}
        title={`Confirm ${
          modalState.action === "delete" ? "Deletion" : "Publishing"
        }`}
        confirmText={modalState.action === "delete" ? "Delete" : "Publish"}
      >
        {modalState.action === "delete" ? (
          <>
            <p>
              Are you sure you want to delete the chapter "
              {modalState.chapterTitle}"?
            </p>
            <p>
              <strong>This action cannot be undone.</strong>
            </p>
          </>
        ) : (
          <>
            <p>
              Are you sure you want to publish the chapter "
              {modalState.chapterTitle}"?
            </p>
            <p>
              <strong>Once published:</strong>
            </p>
            <ul>
              <li>This chapter cannot be deleted</li>
              <li>The content cannot be edited</li>
              <li>The title cannot be changed</li>
            </ul>
            <strong>This action cannot be undone.</strong>
          </>
        )}
      </ConfirmationModal>
    </div>
  );
}

export default WriteBook;
