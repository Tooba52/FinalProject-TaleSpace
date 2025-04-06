import "../styles/ConfirmationModal.css";
import React from "react";

export const ConfirmationModal = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  confirmText = "Confirm",
  children,
}) => {
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
