import React, { useEffect } from 'react';
import './modal.css';

const Modal = ({ show, onClose, title, children }) => {
  // Pridanie event listenera na Escape key na zatvorenie modálu
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (show) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [show, onClose]);

  // Ak nemá byť zobrazený, nevykreslíme nič
  if (!show) {
    return null;
  }

  // Zastavenie propagácie klikov vo vnútri modálu
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={handleModalClick}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal; 