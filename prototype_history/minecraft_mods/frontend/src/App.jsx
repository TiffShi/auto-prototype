import React, { useState, useEffect, useCallback } from 'react';
import StatsHeader from './components/StatsHeader.jsx';
import FilterBar from './components/FilterBar.jsx';
import ConflictList from './components/ConflictList.jsx';
import ConflictForm from './components/ConflictForm.jsx';
import {
  fetchConflicts,
  fetchStats,
  createConflict,
  updateConflict,
  toggleResolve,
  deleteConflict,
} from './api/conflicts.js';

export default function App() {
  const [conflicts, setConflicts] = useState([]);
  const [stats, setStats] = useState({ total: 0, resolved: 0, unresolved: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [resolvedFilter, setResolvedFilter] = useState(null); // null = all, true = resolved, false = unresolved

  const [showForm, setShowForm] = useState(false);
  const [editingConflict, setEditingConflict] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const data = await fetchStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  const loadConflicts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (resolvedFilter !== null) params.resolved = resolvedFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();
      const data = await fetchConflicts(params);
      setConflicts(data.conflicts);
    } catch (err) {
      setError('Failed to load conflicts. Is the backend running?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [resolvedFilter, searchTerm]);

  useEffect(() => {
    loadConflicts();
    loadStats();
  }, [loadConflicts, loadStats]);

  const handleCreate = () => {
    setEditingConflict(null);
    setShowForm(true);
  };

  const handleEdit = (conflict) => {
    setEditingConflict(conflict);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (editingConflict) {
        await updateConflict(editingConflict.id, formData);
      } else {
        await createConflict(formData);
      }
      setShowForm(false);
      setEditingConflict(null);
      await loadConflicts();
      await loadStats();
    } catch (err) {
      console.error('Form submit error:', err);
      throw err;
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingConflict(null);
  };

  const handleToggleResolve = async (conflict) => {
    try {
      await toggleResolve(conflict.id, !conflict.is_resolved);
      await loadConflicts();
      await loadStats();
    } catch (err) {
      console.error('Toggle resolve error:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteConflict(id);
      await loadConflicts();
      await loadStats();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-title-group">
            <span className="app-icon">⚔️</span>
            <h1 className="app-title">Mod Conflict Tracker</h1>
            <span className="app-subtitle">Minecraft Modpack Debugger</span>
          </div>
          <button className="btn btn-primary" onClick={handleCreate}>
            + New Conflict
          </button>
        </div>
      </header>

      <main className="app-main">
        <StatsHeader stats={stats} />

        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          resolvedFilter={resolvedFilter}
          onResolvedFilterChange={setResolvedFilter}
        />

        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <ConflictList
          conflicts={conflicts}
          loading={loading}
          onEdit={handleEdit}
          onToggleResolve={handleToggleResolve}
          onDelete={handleDelete}
        />
      </main>

      {showForm && (
        <ConflictForm
          conflict={editingConflict}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          loading={formLoading}
        />
      )}
    </div>
  );
}