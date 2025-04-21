import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Pagination.css";

const Pagination = ({ totalPages, currentPage, basePath }) => {
  const location = useLocation();

  // helper to build page url
  const getPagePath = (pageNum) => {
    return `${basePath}/page/${pageNum}${location.search}`;
  };

  return (
    <div className="pagination">
      {/* previous page link */}
      {currentPage > 1 && (
        <Link to={getPagePath(currentPage - 1)} className="pagination-link">
          Previous
        </Link>
      )}

      {/* all page number links */}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
        <Link
          key={pageNum}
          to={getPagePath(pageNum)}
          className={`pagination-link ${
            currentPage === pageNum ? "active" : ""
          }`}
        >
          {pageNum}
        </Link>
      ))}

      {/* next page link */}
      {currentPage < totalPages && (
        <Link to={getPagePath(currentPage + 1)} className="pagination-link">
          Next
        </Link>
      )}
    </div>
  );
};

export default Pagination;
