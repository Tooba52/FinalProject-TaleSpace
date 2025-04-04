import React from "react";
import { Link } from "react-router-dom";

const ChapterList = ({ book_id, chapters }) => {
  return (
    <div>
      <h2>Chapters</h2>
      <ul>
        {chapters.map((chapter) => (
          <li key={chapter.chapter_id}>
            <Link to={`/books/${book_id}/chapters/${chapter.chapter_id}`}>
              {chapter.chapter_title || `Chapter ${chapter.chapter_number}`}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChapterList;
