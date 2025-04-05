import "../styles/ConfirmationModal.css";
import React from "react";

export const ConfirmationModal = ({ isOpen, onConfirm, onCancel, message }) => {
  if (!isOpen) return null;

  return (
    <div className="confirmation-modal-overlay">
      <div className="confirmation-modal-content">
        <p className="confirmation-modal-message">{message}</p>
        <div className="confirmation-modal-buttons">
          <button onClick={onCancel} className="confirmation-modal-cancel-btn">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="confirmation-modal-confirm-btn"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
