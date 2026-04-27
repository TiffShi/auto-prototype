import React, { useRef, useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_MB = 10;

export default function ImageUploader({ currentImageUrl, onFileSelect, disabled = false }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(currentImageUrl || null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  const validateAndSet = useCallback(
    (file) => {
      setError('');
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('Only JPEG, PNG, WebP, or GIF images are allowed.');
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`Image must be smaller than ${MAX_SIZE_MB} MB.`);
        return;
      }
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) validateAndSet(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSet(file);
  };

  const handleClear = () => {
    setPreview(currentImageUrl || null);
    setError('');
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover"
            onError={() => setPreview(null)}
          />
          {!disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700
                         rounded-full p-1.5 shadow transition-colors"
              aria-label="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div
          className={`
            border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
            transition-colors duration-150
            ${dragOver ? 'border-brand-400 bg-brand-50' : 'border-gray-300 hover:border-brand-400 hover:bg-gray-50'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onClick={() => !disabled && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={!disabled ? handleDrop : undefined}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => e.key === 'Enter' && !disabled && inputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-2 text-gray-500">
            {dragOver ? (
              <Upload className="w-8 h-8 text-brand-500" />
            ) : (
              <ImageIcon className="w-8 h-8" />
            )}
            <p className="text-sm font-medium">
              {dragOver ? 'Drop image here' : 'Click or drag image here'}
            </p>
            <p className="text-xs text-gray-400">
              JPEG, PNG, WebP, GIF — max {MAX_SIZE_MB} MB
            </p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />

      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <X className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}