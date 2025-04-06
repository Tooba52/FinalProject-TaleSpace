import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/Readbook.css";

function ReadBook() {
  const { book_id, chapter_id } = useParams();
  const [firstName, setFirstName] = useState("");
  const navigate = useNavigate();

  const [state, setState] = useState({
    isLoading: true,
    chapters: [],
    content: "",
    chapterTitle: "",
    bookTitle: "",
    status: "draft",
  });

  // Destructure for cleaner access
  const { isLoading, chapters, content, chapterTitle, bookTitle, status } =
    state;

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

        // If we're on a chapter URL but that chapter doesn't exist, redirect to first chapter
        if (
          chapter_id &&
          !currentChapterExists &&
          chaptersRes.data.length > 0
        ) {
          navigate(
            `/read/${book_id}/chapters/${chaptersRes.data[0].chapter_id}`,
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
      }
    };

    fetchUserProfile();
    fetchData();
  }, [book_id, chapter_id]);

  const fetchUserProfile = () => {
    api
      .get("/api/user/profile/")
      .then((res) => {
        setFirstName(res.data.first_name);
      })
      .catch((err) => console.error("Error fetching user profile", err));
  };

  // Render
  if (isLoading) return <div className="loading">Loading...</div>;

  return (
    <div className="read-book-container">
      <Navbar firstName={firstName} showSearch={false} showWriteButton={true} />

      {/* HEADER SECTION */}
      <div className="book-header">
        <h1 className="book-title">{bookTitle}</h1>
      </div>

      {/* CHAPTER HEADER */}
      <div className="chapter-header-container">
        <div className="chapter-header">
          <h2 className="chapter-title">{chapterTitle || "Untitled"}</h2>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="content-area">
        {/* CHAPTER SIDEBAR */}
        <div className="chapter-sidebar">
          <h3>Chapters</h3>
          <ul className="chapter-list">
            {chapters.map((chapter) => (
              <li
                key={chapter.chapter_id}
                className={chapter_id == chapter.chapter_id ? "active" : ""}
                onClick={() =>
                  navigate(`/read/${book_id}/chapters/${chapter.chapter_id}`)
                }
              >
                <div className="chapter-item">
                  <div className="chapter-text">
                    {chapter.chapter_title || "Untitled"}
                    {chapter.chapter_status === "published" ? (
                      <span className="chapter-status-published">
                        • Published
                      </span>
                    ) : (
                      <span className="chapter-status-draft">• Draft</span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* READING AREA */}
        <div className="reading-area">
          <div
            className="content-display"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* Navigation buttons */}
          <div className="chapter-navigation">
            {chapters.findIndex((ch) => ch.chapter_id == chapter_id) > 0 && (
              <button
                onClick={() => {
                  const currentIndex = chapters.findIndex(
                    (ch) => ch.chapter_id == chapter_id
                  );
                  navigate(
                    `/read/${book_id}/chapters/${
                      chapters[currentIndex - 1].chapter_id
                    }`
                  );
                }}
                className="nav-button prev-button"
              >
                ← Previous Chapter
              </button>
            )}

            {chapters.findIndex((ch) => ch.chapter_id == chapter_id) <
              chapters.length - 1 && (
              <button
                onClick={() => {
                  const currentIndex = chapters.findIndex(
                    (ch) => ch.chapter_id == chapter_id
                  );
                  navigate(
                    `/read/${book_id}/chapters/${
                      chapters[currentIndex + 1].chapter_id
                    }`
                  );
                }}
                className="nav-button next-button"
              >
                Next Chapter →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default ReadBook;
