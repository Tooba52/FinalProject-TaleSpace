// WriteBook.jsx
import { useState, useEffect } from "react";
import api from "../api"; // Assuming you have an API utility
import { useParams } from "react-router-dom"; // To get the book ID from the URL

function WriteBook() {
  const { bookId } = useParams(); // Get the book ID from the URL
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [content, setContent] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");

  useEffect(() => {
    // Fetch chapters for the book
    api
      .get(`/api/books/${bookId}/chapters/`)
      .then((res) => {
        setChapters(res.data);
        if (res.data.length > 0) {
          // Load the first chapter content if chapters exist
          setSelectedChapter(res.data[0]);
          setContent(res.data[0].content);
          setChapterTitle(res.data[0].title);
        }
      })
      .catch((err) => console.error("Error fetching chapters", err));
  }, [bookId]);

  const handleChapterClick = (chapterId) => {
    // Fetch the content of the selected chapter
    api
      .get(`/api/chapters/${chapterId}/`)
      .then((res) => {
        setSelectedChapter(res.data);
        setContent(res.data.content);
        setChapterTitle(res.data.title);
      })
      .catch((err) => console.error("Error fetching chapter", err));
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleSave = () => {
    if (selectedChapter) {
      api
        .put(`/api/chapters/${selectedChapter.id}/`, {
          content,
          title: chapterTitle,
          status: "draft", // Mark as draft
        })
        .then(() => alert("Chapter saved as draft"))
        .catch((err) => console.error("Error saving chapter", err));
    }
  };

  const handlePublish = () => {
    if (selectedChapter) {
      api
        .put(`/api/chapters/${selectedChapter.id}/`, {
          content,
          title: chapterTitle,
          status: "published", // Mark as published
        })
        .then(() => alert("Chapter published"))
        .catch((err) => console.error("Error publishing chapter", err));
    }
  };

  return (
    <div className="write-book-container">
      <div className="sidebar">
        <h3>Chapters</h3>
        {chapters.map((chapter) => (
          <div key={chapter.id} onClick={() => handleChapterClick(chapter.id)}>
            {chapter.number}. {chapter.title}
          </div>
        ))}
        <button
          onClick={() =>
            setChapters([
              ...chapters,
              { title: "New Chapter", number: chapters.length + 1 },
            ])
          }
        >
          Add New Chapter
        </button>
      </div>

      <div className="content-area">
        {selectedChapter && (
          <div>
            <h2>Edit Chapter: {selectedChapter.title}</h2>
            <textarea
              value={content}
              onChange={handleContentChange}
              placeholder="Start writing your chapter here..."
            />
            <button onClick={handleSave}>Save Draft</button>
            <button onClick={handlePublish}>Publish</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WriteBook;
