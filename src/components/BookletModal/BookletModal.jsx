// src/components/BookletModal/BookletModal.jsx
import { useEffect } from 'react';
import './BookletModal.css';

const INTERNAL_BOOKLET_URL = "https://YOUR_INTERNAL_SHERIFF_BOOKLET_LINK";
const EXTERNAL_BOOKLET_URL = "https://YOUR_EXTERNAL_STRANGER_BOOKLET_LINK";

export default function BookletModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="booklet-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="booklet-modal-title"
    >
      <div className="booklet-modal-card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="booklet-modal-close"
          onClick={onClose}
          aria-label="Close booklet selector"
        >
          ✕
        </button>

        <p className="booklet-modal-kicker">RODEO KICKOFF BOOKLET</p>
        <h2 id="booklet-modal-title" className="booklet-modal-title">
          Who rides into town?
        </h2>
        <p className="booklet-modal-sub">
          Pick your trail to open the right delegate booklet.
        </p>

        <div className="booklet-choices">
          <a
            href={INTERNAL_BOOKLET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="booklet-choice"
            onClick={onClose}
          >
            <span className="booklet-choice-badge">INTERNAL</span>
            <span className="booklet-choice-title">Local Sheriff</span>
            <span className="booklet-choice-desc">
              AIESEC in Constantine members
            </span>
          </a>

          <a
            href={EXTERNAL_BOOKLET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="booklet-choice"
            onClick={onClose}
          >
            <span className="booklet-choice-badge">EXTERNAL</span>
            <span className="booklet-choice-title">Stranger in Town</span>
            <span className="booklet-choice-desc">
              Delegates from other LCs / out of town
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}