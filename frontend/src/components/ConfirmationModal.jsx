import "../styles/ConfirmationModal.css";
import React from "react";

// Reusable confirmation modal with customisable text and actions
const ConfirmationModal = ({
  isOpen, // Controls visibility
  onConfirm, // Callback for confirmation
  onCancel, // Callback for cancellation
  title, // Optional modal title
  confirmText = "Confirm", // Button text (default: Confirm)
  children, // Custom message or content inside modal
}) => {
  // If modal is not open, render nothing
  if (!isOpen) return null;

  return (
    <div className="confirmation-modal-overlay">
      <div className="confirmation-modal-content">
        {title && <h3 className="confirmation-modal-title">{title}</h3>}
        <div className="confirmation-modal-message">{children}</div>
        <div className="confirmation-modal-buttons">
          <button onClick={onCancel} className="confirmation-modal-cancel-btn">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="confirmation-modal-confirm-btn"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
