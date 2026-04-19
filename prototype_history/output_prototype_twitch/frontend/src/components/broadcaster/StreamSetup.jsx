import React, { useState } from 'react';

const SOURCE_OPTIONS = [
  { value: 'camera', label: '📷 Webcam', desc: 'Stream from your camera' },
  { value: 'screen', label: '🖥️ Screen', desc: 'Share your screen' },
  { value: 'both', label: '🎬 Both', desc: 'Screen + camera audio' },
];

export default function StreamSetup({ onStart, error, isLoading }) {
  const [title, setTitle] = useState('');
  const [broadcasterName, setBroadcasterName] = useState(
    () => localStorage.getItem('broadcaster_name') || ''
  );
  const [description, setDescription] = useState('');
  const [source, setSource] = useState('camera');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !broadcasterName.trim()) return;
    localStorage.setItem('broadcaster_name', broadcasterName);
    onStart({ title, broadcasterName, description, source });
  };

  return (
    <form className="stream-setup" onSubmit={handleSubmit}>
      <h2 className="stream-setup-title">Configure Your Stream</h2>

      {error && (
        <div className="stream-setup-error">
          <span>⚠️ {error}</span>
        </div>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor="broadcaster-name">
          Your Name
        </label>
        <input
          id="broadcaster-name"
          className="form-input"
          type="text"
          placeholder="e.g. CoolStreamer"
          value={broadcasterName}
          onChange={(e) => setBroadcasterName(e.target.value)}
          maxLength={50}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="stream-title">
          Stream Title
        </label>
        <input
          id="stream-title"
          className="form-input"
          type="text"
          placeholder="e.g. Gaming Session, Work Demo..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="stream-desc">
          Description <span className="form-label-optional">(optional)</span>
        </label>
        <textarea
          id="stream-desc"
          className="form-input form-textarea"
          placeholder="What are you streaming today?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          rows={3}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Video Source</label>
        <div className="source-options">
          {SOURCE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`source-option ${source === opt.value ? 'source-option--active' : ''}`}
              onClick={() => setSource(opt.value)}
            >
              <span className="source-option-label">{opt.label}</span>
              <span className="source-option-desc">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-live btn-full"
        disabled={isLoading || !title.trim() || !broadcasterName.trim()}
      >
        {isLoading ? (
          <span className="btn-loading">
            <span className="spinner-sm" /> Starting...
          </span>
        ) : (
          '🔴 Go Live'
        )}
      </button>
    </form>
  );
}