import { useState, useEffect, useCallback, useRef } from "react";
import { notesApi } from "../api/notesApi.js";

export function useNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Debounce timer ref
  const debounceTimer = useRef(null);

  const fetchNotes = useCallback(async (query = "") => {
    setLoading(true);
    setError(null);
    try {
      const data = await notesApi.getAll(query);
      setNotes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      fetchNotes(searchQuery);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery, fetchNotes]);

  const refreshNotes = useCallback(() => {
    fetchNotes(searchQuery);
  }, [fetchNotes, searchQuery]);

  const createNote = useCallback(
    async (payload) => {
      const newNote = await notesApi.create(payload);
      setNotes((prev) => [newNote, ...prev]);
      return newNote;
    },
    []
  );

  const updateNote = useCallback(async (id, payload) => {
    const updated = await notesApi.update(id, payload);
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? updated : note))
    );
    return updated;
  }, []);

  const deleteNote = useCallback(async (id) => {
    await notesApi.delete(id);
    setNotes((prev) => prev.filter((note) => note.id !== id));
  }, []);

  return {
    notes,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    createNote,
    updateNote,
    deleteNote,
    refreshNotes,
  };
}