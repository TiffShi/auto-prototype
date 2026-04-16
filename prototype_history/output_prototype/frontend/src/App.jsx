import React, { useState } from 'react';
import Toolbar from './components/Toolbar.jsx';
import Editor from './components/Editor.jsx';
import Sidebar from './components/Sidebar.jsx';
import StatusBar from './components/StatusBar.jsx';
import TitleInput from './components/TitleInput.jsx';
import { useDocument } from './hooks/useDocument.js';

export default function App() {
  const {
    documents,
    currentDoc,
    title,
    content,
    isDirty,
    saveStatus,
    sidebarLoading,
    error,
    handleNew,
    handleSave,
    handleLoad,
    handleDelete,
    handleTitleChange,
    handleContentChange,
    handleClear,
  } = useDocument();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="app-logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <span>TextEditor</span>
        </div>
        <Toolbar
          onNew={handleNew}
          onSave={() => handleSave(false)}
          onClear={handleClear}
          saveStatus={saveStatus}
          isDirty={isDirty}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          sidebarOpen={sidebarOpen}
        />
      </header>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <span>⚠ {error}</span>
        </div>
      )}

      {/* Main Layout */}
      <div className="main-layout">
        {/* Sidebar */}
        <aside className={`sidebar-wrapper ${sidebarOpen ? 'open' : 'closed'}`}>
          <Sidebar
            documents={documents}
            currentDocId={currentDoc?.id}
            loading={sidebarLoading}
            onLoad={handleLoad}
            onDelete={handleDelete}
            onNew={handleNew}
          />
        </aside>

        {/* Editor Area */}
        <main className="editor-area">
          <TitleInput title={title} onChange={handleTitleChange} isDirty={isDirty} />
          <Editor
            content={content}
            onChange={handleContentChange}
            onCursorChange={setCursorPos}
          />
          <StatusBar content={content} cursorPos={cursorPos} saveStatus={saveStatus} />
        </main>
      </div>
    </div>
  );
}