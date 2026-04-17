import React, { useState, useEffect } from 'react';

const defaultForm = {
  primary_mod: '',
  conflicting_mod: '',
  crash_log_snippet: '',
  is_resolved: false,
};

export default function ConflictForm({ conflict, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  const isEditing = Boolean(conflict);

  useEffect(() => {
    if (conflict) {
      setForm({
        primary_mod: conflict.primary_mod || '',
        conflicting_mod: conflict.conflicting_mod || '',
        crash_log_snippet: conflict.crash_log_snippet || '',
        is_resolved: conflict.is_resolved ?? false,
      });
    } else {
      setForm(defaultForm);
    }
    setErrors({});
    setSubmitError(null);
  }, [conflict]);

  const validate = () => {
    const newErrors = {};
    if (!form.primary_mod.trim()) {
      newErrors.primary_mod = 'Primary mod name is required.';
    }
    if (!form.conflicting_mod.trim()) {
      newErrors.conflicting_mod = 'Conflicting mod name is required.';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      primary_mod: form.primary_mod.trim(),
      conflicting_mod: form.conflicting_mod.trim(),
      crash_log_snippet: form.crash_log_snippet.trim() || null,
      is_resolved: form.is_resolved,
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      setSubmitError('Failed to save conflict. Please try again.');
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">
            {isEditing ? '✏ Edit Conflict' : '+ New Conflict'}
          </h2>
          <button className="modal-close" onClick={onCancel} title="Close">
            ✕
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="primary_mod">
              Primary Mod <span className="required">*</span>
            </label>
            <input
              id="primary_mod"
              name="primary_mod"
              type="text"
              className={`form-input ${errors.primary_mod ? 'input-error' : ''}`}
              placeholder="e.g. OptiFine"
              value={form.primary_mod}
              onChange={handleChange}
              disabled={loading}
              autoFocus
            />
            {errors.primary_mod && (
              <span className="field-error">{errors.primary_mod}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="conflicting_mod">
              Conflicting Mod <span className="required">*</span>
            </label>
            <input
              id="conflicting_mod"
              name="conflicting_mod"
              type="text"
              className={`form-input ${errors.conflicting_mod ? 'input-error' : ''}`}
              placeholder="e.g. Sodium"
              value={form.conflicting_mod}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.conflicting_mod && (
              <span className="field-error">{errors.conflicting_mod}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="crash_log_snippet">
              Crash Log Snippet <span className="optional">(optional)</span>
            </label>
            <textarea
              id="crash_log_snippet"
              name="crash_log_snippet"
              className="form-textarea"
              placeholder="Paste relevant crash log lines here..."
              value={form.crash_log_snippet}
              onChange={handleChange}
              disabled={loading}
              rows={6}
            />
          </div>

          <div className="form-group form-group-inline">
            <label className="form-label-inline" htmlFor="is_resolved">
              Mark as Resolved
            </label>
            <div
              className={`toggle-switch ${form.is_resolved ? 'toggle-on' : 'toggle-off'}`}
              onClick={() =>
                !loading &&
                setForm((prev) => ({ ...prev, is_resolved: !prev.is_resolved }))
              }
              role="checkbox"
              aria-checked={form.is_resolved}
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === ' ' &&
                !loading &&
                setForm((prev) => ({ ...prev, is_resolved: !prev.is_resolved }))
              }
            >
              <div className="toggle-thumb" />
            </div>
            <span className="toggle-label">
              {form.is_resolved ? 'Resolved ✅' : 'Unresolved ❌'}
            </span>
          </div>

          {submitError && (
            <div className="submit-error">
              <span>⚠️</span> {submitError}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Conflict'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}