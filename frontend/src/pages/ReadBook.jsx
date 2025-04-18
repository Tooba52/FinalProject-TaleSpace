import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/Readbook.css";

function ReadBook() {
  // Destructure `book_id` and `chapter_id` from URL parameters
  const { book_id, chapter_id } = useParams();
  const navigate = useNavigate();

  // Component state for managing loading, chapters, content, and metadata
  const [state, setState] = useState({
    isLoading: true,
    chapters: [],
    content: "",
    chapterTitle: "",
    bookTitle: "",
    status: "draft",
  });

  const { isLoading, chapters, content, chapterTitle, bookTitle, status } =
    state;

  // Navigate to a specific chapter when clicked in the sidebar
  const navigateToChapter = (chapterId) => {
    const newPath = `/read/${book_id}/chapters/${chapterId}`;
    window.history.replaceState(null, "", newPath);
    navigate(newPath, { replace: true });
  };

  // Fetch book and chapter data when `book_id` or `chapter_id` changes
  useEffect(() => {
    // Set the current chapter in the URL when `chapter_id` exists
    if (chapter_id) {
      window.history.replaceState(
        null,
        "",
        `/read/${book_id}/chapters/${chapter_id}`
      );
    }

    // Handle back button event to prevent navigating away from the reading page
    const handleBackButton = (e) => {
      if (window.location.pathname.includes("/read/")) {
        e.preventDefault();
        window.history.replaceState(null, "", "/");
        navigate("/", { replace: true });
      }
    };
    window.addEventListener("popstate", handleBackButton);

    // Fetch chapters and content based on the `book_id` and `chapter_id`
    const fetchData = async () => {
      try {
        const [chaptersRes, contentRes] = await Promise.all([
          api.get(`/api/books/${book_id}/chapters/?published_only=true`),
          chapter_id
            ? api
                .get(`/api/books/${book_id}/chapters/${chapter_id}/`)
                .catch(() => null)
            : null,
        ]);

        // Check if the requested chapter exists; otherwise, redirect to the first available chapter
        const currentChapterExists = chaptersRes.data.some(
          (ch) => ch.chapter_id == chapter_id
        );

        if (
          chapter_id &&
          !currentChapterExists &&
          chaptersRes.data.length > 0
        ) {
          navigateToChapter(chaptersRes.data[0].chapter_id);
          return;
        }

        // Update state with fetched data: book title, chapters, and content
        setState((prev) => ({
          ...prev,
          bookTitle: chaptersRes.data[0]?.book_detail?.title || "Untitled Book",
          chapters: chaptersRes.data,
          content: contentRes?.data?.chapter_content || "",
          chapterTitle: contentRes?.data?.chapter_title || "",
          status: contentRes?.data?.chapter_status || "draft",
          isLoading: false,
        }));
      } catch (err) {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    // Call the fetch function to get the data
    fetchData();

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [book_id, chapter_id, navigate]);

  // Show loading spinner while data is being fetched
  if (isLoading) return <div className="loading">Loading...</div>;

  return (
    <div className="read-book-container">
      <Navbar />

      {/* Book header section */}
      <div className="book-header">
        <h1 className="read-book-title">{bookTitle}</h1>
      </div>

      {/* Chapter header section with back button */}
      <div className="chapter-header-container">
        <div className="chapter-header">
          <button onClick={() => navigate("/")} className="back-to-home-button">
            ← Back to Home
          </button>
          <h2 className="chapter-title">{chapterTitle || "Untitled"}</h2>
        </div>
      </div>

      {/* Main content area */}
      <div className="content-area">
        {/* Sidebar with list of chapters */}
        <div className="chapter-sidebar">
          <ul className="chapter-list">
            {chapters.map((chapter) => (
              <li
                key={chapter.chapter_id}
                className={chapter_id == chapter.chapter_id ? "active" : ""}
                onClick={() => navigateToChapter(chapter.chapter_id)}
              >
                <div className="chapter-item">
                  <div className="chapter-text">
                    {chapter.chapter_title || "Untitled"}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Reading area displaying the chapter content */}
        <div className="reading-area">
          <div
            className="content-display"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* Chapter navigation buttons (Previous and Next Chapter) */}
          <div className="chapter-navigation">
            {chapters.findIndex((ch) => ch.chapter_id == chapter_id) > 0 && (
              <button
                onClick={() => {
                  const currentIndex = chapters.findIndex(
                    (ch) => ch.chapter_id == chapter_id
                  );
                  navigateToChapter(chapters[currentIndex - 1].chapter_id);
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
                  navigateToChapter(chapters[currentIndex + 1].chapter_id);
                }}
                className="nav-button next-button"
              >
                Next Chapter →
              </button>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default ReadBook;
