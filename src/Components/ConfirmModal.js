import React, { useEffect } from 'react';
import './Modal.css';

const ConfirmModal = ({ isOpen, onConfirm, onCancel, message }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Confirm Submission</h2>
        <p className="modal-message">{message}</p>
        <div className="modal-buttons">
          <button
            onClick={onCancel}
            className="modal-button cancel-button"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="modal-button submit-button"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;