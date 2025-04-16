import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import debounce from "lodash.debounce";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ConfirmationModal from "../components/ConfirmationModal";
import "../styles/Writebook.css";

function WriteBook() {
  const { book_id, chapter_id } = useParams();
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
    action: null,
    chapterId: null,
    chapterTitle: null,
  });

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
      }
    }, 5000),
    [book_id, chapter_id, status]
  );

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

        const bookTitle =
          chaptersRes.data[0]?.book_detail?.title || "Untitled Book";

        const currentChapterExists = chaptersRes.data.some(
          (ch) => ch.chapter_id == chapter_id
        );

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
        setState((prev) => ({ ...prev, isLoading: false }));
        navigate(`/books/${book_id}`);
      }
    };

    fetchData();
    return () => autoSave.cancel();
  }, [book_id, chapter_id, autoSave]);

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
    }
  };

  const handlePublish = async () => {
    try {
      const currentChapterIndex = chapters.findIndex(
        (ch) => ch.chapter_id == chapter_id
      );

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

      await api.put(
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
      alert("Failed to update chapter title");
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
    } catch (err) {
      alert("Failed to create new chapter");
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
    const chapterIndex = chapters.findIndex(
      (ch) => ch.chapter_id === chapterId
    );
    if (chapterIndex === 0) {
      alert("The first chapter cannot be deleted");
      return;
    }

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

      const updatedChapters = chapters.filter(
        (ch) => ch.chapter_id !== chapterId
      );
      setState((prev) => ({
        ...prev,
        chapters: updatedChapters,
      }));

      if (chapter_id == chapterId) {
        if (updatedChapters.length > 0) {
          navigate(
            `/write/books/${book_id}/chapters/${updatedChapters[0].chapter_id}`,
            { replace: true }
          );
        } else {
          navigate(`/books/${book_id}`);
        }
      }
    } catch (err) {
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

  if (isLoading) return <div className="loading">Loading...</div>;

  return (
    <div className="write-book-container">
      <Navbar showWriteButton={false} />

      <div className="book-header">
        <h1 className="write-book-title">{bookTitle}</h1>
      </div>

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
                {saveState === "saving" ? "Publishing..." : "Publish"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="content-area">
        <div className="chapter-sidebar">
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

      <Footer />

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
