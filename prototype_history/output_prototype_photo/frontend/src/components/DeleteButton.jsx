import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DeleteButton({ photoId, photoTitle, onDelete, isDeleting }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      await onDelete(photoId);
      navigate('/');
    } catch {
      // error handled in hook
    }
  };

  if (showConfirm) {
    return (
      <div className="delete-btn__confirm">
        <p className="delete-btn__confirm-text">
          Delete <strong>"{photoTitle}"</strong>? This cannot be undone.
        </p>
        <div className="delete-btn__confirm-actions">
          <button
            className="delete-btn delete-btn--ghost"
            onClick={() => setShowConfirm(false)}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            className="delete-btn delete-btn--danger"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="delete-btn__spinner" />
                Deleting…
              </>
            ) : (
              '🗑 Delete Photo'
            )}
          </button>
        </div>

        <style>{`
          .delete-btn__confirm {
            background: var(--color-danger-light);
            border: 1px solid rgba(224, 92, 106, 0.3);
            border-radius: var(--radius-lg);
            padding: 16px 20px;
            display: flex;
            flex-direction: column;
            gap: 14px;
          }
          .delete-btn__confirm-text {
            font-size: 14px;
            color: var(--color-text-muted);
            line-height: 1.5;
          }
          .delete-btn__confirm-text strong {
            color: var(--color-text);
          }
          .delete-btn__confirm-actions {
            display: flex;
            gap: 10px;
          }
          .delete-btn {
            padding: 9px 18px;
            border-radius: var(--radius-md);
            font-size: 14px;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            border: 1px solid transparent;
            transition: all var(--transition);
          }
          .delete-btn--danger {
            background: var(--color-danger);
            color: #fff;
          }
          .delete-btn--danger:hover:not(:disabled) {
            background: var(--color-danger-hover);
          }
          .delete-btn--ghost {
            background: var(--color-surface-2);
            border-color: var(--color-border);
            color: var(--color-text-muted);
          }
          .delete-btn--ghost:hover:not(:disabled) {
            background: var(--color-border);
            color: var(--color-text);
          }
          .delete-btn__spinner {
            display: inline-block;
            width: 13px;
            height: 13px;
            border: 2px solid rgba(255,255,255,0.3);
            border-top-color: #fff;
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <button
        className="delete-btn delete-btn--outline-danger"
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
      >
        🗑 Delete Photo
      </button>
      <style>{`
        .delete-btn {
          padding: 9px 18px;
          border-radius: var(--radius-md);
          font-size: 14px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid transparent;
          transition: all var(--transition);
          cursor: pointer;
        }
        .delete-btn--outline-danger {
          background: transparent;
          border-color: var(--color-danger);
          color: var(--color-danger);
        }
        .delete-btn--outline-danger:hover:not(:disabled) {
          background: var(--color-danger);
          color: #fff;
        }
      `}</style>
    </>
  );
}