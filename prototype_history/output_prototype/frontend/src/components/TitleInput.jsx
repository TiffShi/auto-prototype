import React from 'react';

export default function TitleInput({ title, onChange, isDirty }) {
  return (
    <div className="title-input-wrapper">
      <input
        type="text"
        className="title-input"
        value={title}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Document title…"
        spellCheck={false}
        maxLength={200}
      />
      {isDirty && <span className="title-dirty-dot" title="Unsaved changes" />}
    </div>
  );
}