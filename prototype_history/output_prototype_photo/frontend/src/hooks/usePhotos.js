import { useState, useEffect, useCallback } from 'react';
import { fetchAllPhotos, uploadPhoto, deletePhoto } from '../api/photosApi.js';

export default function usePhotos() {
  const [photos, setPhotos] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleting, setDeleting] = useState(null); // photo id being deleted

  const loadPhotos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllPhotos();
      setPhotos(data.photos || []);
      setTotal(data.total || 0);
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.message ||
        'Failed to load photos.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const upload = useCallback(
    async (file, title, description) => {
      setUploading(true);
      setUploadProgress(0);
      setError(null);
      try {
        const newPhoto = await uploadPhoto(file, title, description, (evt) => {
          if (evt.total) {
            setUploadProgress(Math.round((evt.loaded / evt.total) * 100));
          }
        });
        setPhotos((prev) => [newPhoto, ...prev]);
        setTotal((prev) => prev + 1);
        return newPhoto;
      } catch (err) {
        const message =
          err?.response?.data?.detail ||
          err?.message ||
          'Upload failed.';
        setError(message);
        throw new Error(message);
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    []
  );

  const remove = useCallback(async (photoId) => {
    setDeleting(photoId);
    setError(null);
    try {
      await deletePhoto(photoId);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      setTotal((prev) => Math.max(0, prev - 1));
      return true;
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.message ||
        'Delete failed.';
      setError(message);
      throw new Error(message);
    } finally {
      setDeleting(null);
    }
  }, []);

  return {
    photos,
    total,
    loading,
    error,
    uploading,
    uploadProgress,
    deleting,
    loadPhotos,
    upload,
    remove,
  };
}