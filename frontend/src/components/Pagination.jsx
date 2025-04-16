import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Pagination.css";

const Pagination = ({ totalPages, currentPage, basePath }) => {
  const location = useLocation();

  const getPagePath = (pageNum) => {
    return `${basePath}/page/${pageNum}${location.search}`;
  };

  return (
    <div className="pagination">
      {currentPage > 1 && (
        <Link to={getPagePath(currentPage - 1)} className="pagination-link">
          Previous
        </Link>
      )}

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

      {currentPage < totalPages && (
        <Link to={getPagePath(currentPage + 1)} className="pagination-link">
          Next
        </Link>
      )}
    </div>
  );
};

export default Pagination;
