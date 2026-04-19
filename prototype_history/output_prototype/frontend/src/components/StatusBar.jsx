import React, { useMemo } from 'react';

function computeStats(content) {
  const chars = content.length;
  const charsNoSpaces = content.replace(/\s/g, '').length;
  const lines = content === '' ? 1 : content.split('\n').length;
  const words =
    content.trim() === '' ? 0 : content.trim().split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(words / 200));
  return { chars, charsNoSpaces, lines, words, readingTime };
}

export default function StatusBar({ content, cursorPos, saveStatus }) {
  const stats = useMemo(() => computeStats(content), [content]);

  return (
    <div className="status-bar">
      <div className="status-group">
        <span className="status-item">
          <span className="status-label">Words</span>
          <span className="status-value">{stats.words.toLocaleString()}</span>
        </span>
        <span className="status-divider" />
        <span className="status-item">
          <span className="status-label">Chars</span>
          <span className="status-value">{stats.chars.toLocaleString()}</span>
        </span>
        <span className="status-divider" />
        <span className="status-item">
          <span className="status-label">No-space</span>
          <span className="status-value">{stats.charsNoSpaces.toLocaleString()}</span>
        </span>
        <span className="status-divider" />
        <span className="status-item">
          <span className="status-label">Lines</span>
          <span className="status-value">{stats.lines.toLocaleString()}</span>
        </span>
        <span className="status-divider" />
        <span className="status-item">
          <span className="status-label">~Read</span>
          <span className="status-value">{stats.readingTime} min</span>
        </span>
      </div>

      <div className="status-group">
        <span className="status-item">
          <span className="status-label">Ln</span>
          <span className="status-value">{cursorPos.line}</span>
        </span>
        <span className="status-divider" />
        <span className="status-item">
          <span className="status-label">Col</span>
          <span className="status-value">{cursorPos.col}</span>
        </span>
      </div>
    </div>
  );
}