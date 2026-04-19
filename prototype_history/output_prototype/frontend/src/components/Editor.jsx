import React, { useRef, useCallback } from 'react';

export default function Editor({ content, onChange, onCursorChange }) {
  const textareaRef = useRef(null);

  const handleChange = useCallback(
    (e) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const updateCursor = useCallback(() => {
    const el = textareaRef.current;
    if (!el || !onCursorChange) return;
    const text = el.value.substring(0, el.selectionStart);
    const lines = text.split('\n');
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;
    onCursorChange({ line, col });
  }, [onCursorChange]);

  const handleKeyDown = useCallback(
    (e) => {
      // Tab key inserts spaces instead of changing focus
      if (e.key === 'Tab') {
        e.preventDefault();
        const el = textareaRef.current;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const newValue = content.substring(0, start) + '  ' + content.substring(end);
        onChange(newValue);
        // Restore cursor position after React re-render
        requestAnimationFrame(() => {
          el.selectionStart = start + 2;
          el.selectionEnd = start + 2;
        });
      }
    },
    [content, onChange]
  );

  return (
    <div className="editor-wrapper">
      <textarea
        ref={textareaRef}
        className="editor-textarea"
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onClick={updateCursor}
        onKeyUp={updateCursor}
        onSelect={updateCursor}
        placeholder="Start typing your document here…"
        spellCheck={true}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />
    </div>
  );
}