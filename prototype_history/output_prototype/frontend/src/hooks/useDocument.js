import { useState, useEffect, useCallback, useRef } from 'react';
import {
  listDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  getDocument,
} from '../api/documents';

const AUTOSAVE_DELAY = 2000;

export function useDocument() {
  const [documents, setDocuments] = useState([]);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [title, setTitle] = useState('Untitled Document');
  const [content, setContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'unsaved' | 'saving'
  const [sidebarLoading, setSidebarLoading] = useState(false);
  const [error, setError] = useState(null);

  const autosaveTimer = useRef(null);
  const isNewDoc = useRef(true);

  // Load document list on mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  // Autosave logic
  useEffect(() => {
    if (!isDirty) return;

    setSaveStatus('unsaved');

    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current);
    }

    autosaveTimer.current = setTimeout(() => {
      handleSave(true);
    }, AUTOSAVE_DELAY);

    return () => {
      if (autosaveTimer.current) {
        clearTimeout(autosaveTimer.current);
      }
    };
  }, [title, content, isDirty]);

  const fetchDocuments = useCallback(async () => {
    setSidebarLoading(true);
    setError(null);
    try {
      const docs = await listDocuments();
      setDocuments(docs);
    } catch (err) {
      setError('Failed to load documents.');
    } finally {
      setSidebarLoading(false);
    }
  }, []);

  const handleNew = useCallback(() => {
    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current);
    }
    setCurrentDoc(null);
    setTitle('Untitled Document');
    setContent('');
    setIsDirty(false);
    setSaveStatus('saved');
    isNewDoc.current = true;
  }, []);

  const handleSave = useCallback(
    async (isAutosave = false) => {
      setSaveStatus('saving');
      setError(null);
      try {
        if (currentDoc) {
          const updated = await updateDocument(currentDoc.id, { title, content });
          setCurrentDoc(updated);
        } else {
          const created = await createDocument({ title, content });
          setCurrentDoc(created);
          isNewDoc.current = false;
        }
        setIsDirty(false);
        setSaveStatus('saved');
        await fetchDocuments();
      } catch (err) {
        setSaveStatus('unsaved');
        setError(isAutosave ? 'Autosave failed.' : 'Failed to save document.');
      }
    },
    [currentDoc, title, content, fetchDocuments]
  );

  const handleLoad = useCallback(
    async (id) => {
      setError(null);
      try {
        const doc = await getDocument(id);
        if (autosaveTimer.current) {
          clearTimeout(autosaveTimer.current);
        }
        setCurrentDoc(doc);
        setTitle(doc.title);
        setContent(doc.content);
        setIsDirty(false);
        setSaveStatus('saved');
        isNewDoc.current = false;
      } catch (err) {
        setError('Failed to load document.');
      }
    },
    []
  );

  const handleDelete = useCallback(
    async (id) => {
      setError(null);
      try {
        await deleteDocument(id);
        if (currentDoc && currentDoc.id === id) {
          handleNew();
        }
        await fetchDocuments();
      } catch (err) {
        setError('Failed to delete document.');
      }
    },
    [currentDoc, handleNew, fetchDocuments]
  );

  const handleTitleChange = useCallback((newTitle) => {
    setTitle(newTitle);
    setIsDirty(true);
  }, []);

  const handleContentChange = useCallback((newContent) => {
    setContent(newContent);
    setIsDirty(true);
  }, []);

  const handleClear = useCallback(() => {
    setContent('');
    setIsDirty(true);
  }, []);

  return {
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
    fetchDocuments,
  };
}