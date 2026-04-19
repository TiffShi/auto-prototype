import React, { useState } from "react";
import NoteList from "./components/NoteList.jsx";
import NoteEditor from "./components/NoteEditor.jsx";
import NoteDetail from "./components/NoteDetail.jsx";
import SearchBar from "./components/SearchBar.jsx";
import ConfirmDelete from "./components/ConfirmDelete.jsx";
import { useNotes } from "./hooks/useNotes.js";

// View states: "list" | "detail" | "create" | "edit"
export default function App() {
  const {
    notes,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    createNote,
    updateNote,
    deleteNote,
    refreshNotes,
  } = useNotes();

  const [view, setView] = useState("list");
  const [selectedNote, setSelectedNote] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleSelectNote = (note) => {
    setSelectedNote(note);
    setView("detail");
  };

  const handleNewNote = () => {
    setSelectedNote(null);
    setView("create");
  };

  const handleEditNote = (note) => {
    setSelectedNote(note);
    setView("edit");
  };

  const handleBack = () => {
    setSelectedNote(null);
    setView("list");
  };

  const handleSave = async (data) => {
    setActionLoading(true);
    try {
      if (view === "create") {
        await createNote(data);
      } else if (view === "edit" && selectedNote) {
        await updateNote(selectedNote.id, data);
      }
      setView("list");
      setSelectedNote(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRequest = (note) => {
    setDeleteTarget(note);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await deleteNote(deleteTarget.id);
      setDeleteTarget(null);
      if (view === "detail" && selectedNote?.id === deleteTarget.id) {
        setView("list");
        setSelectedNote(null);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteTarget(null);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-inner">
          <div className="header-brand" onClick={handleBack} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && handleBack()}>
            <span className="header-icon">📝</span>
            <h1 className="header-title">Notes</h1>
          </div>
          {view === "list" && (
            <button className="btn btn-primary" onClick={handleNewNote}>
              <span className="btn-icon">+</span> New Note
            </button>
          )}
          {(view === "detail" || view === "edit" || view === "create") && (
            <button className="btn btn-ghost" onClick={handleBack}>
              ← Back
            </button>
          )}
        </div>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
            <button className="error-retry" onClick={refreshNotes}>
              Retry
            </button>
          </div>
        )}

        {view === "list" && (
          <>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
            />
            <NoteList
              notes={notes}
              loading={loading}
              onSelect={handleSelectNote}
              onEdit={handleEditNote}
              onDelete={handleDeleteRequest}
              onNewNote={handleNewNote}
            />
          </>
        )}

        {view === "detail" && selectedNote && (
          <NoteDetail
            note={selectedNote}
            onEdit={handleEditNote}
            onDelete={handleDeleteRequest}
          />
        )}

        {(view === "create" || view === "edit") && (
          <NoteEditor
            note={view === "edit" ? selectedNote : null}
            onSave={handleSave}
            onCancel={handleBack}
            loading={actionLoading}
          />
        )}
      </main>

      {deleteTarget && (
        <ConfirmDelete
          note={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          loading={actionLoading}
        />
      )}
    </div>
  );
}