import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { ENDPOINTS } from '../config.js';

const StreamContext = createContext(null);

export function StreamProvider({ children }) {
  const [streams, setStreams] = useState([]);
  const [currentStream, setCurrentStream] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStreams = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.get(ENDPOINTS.streams);
      setStreams(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch streams');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createStream = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.post(ENDPOINTS.streams, data);
      setCurrentStream(res.data);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to create stream';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteStream = useCallback(async (streamId) => {
    try {
      await axios.delete(`${ENDPOINTS.streams}/${streamId}`);
      setCurrentStream(null);
      setStreams((prev) => prev.filter((s) => s.stream_id !== streamId));
    } catch (err) {
      console.error('Failed to delete stream:', err);
    }
  }, []);

  const getStream = useCallback(async (streamId) => {
    try {
      const res = await axios.get(`${ENDPOINTS.streams}/${streamId}`);
      return res.data;
    } catch {
      return null;
    }
  }, []);

  return (
    <StreamContext.Provider
      value={{
        streams,
        currentStream,
        setCurrentStream,
        isLoading,
        error,
        fetchStreams,
        createStream,
        deleteStream,
        getStream,
      }}
    >
      {children}
    </StreamContext.Provider>
  );
}

export function useStreamContext() {
  const ctx = useContext(StreamContext);
  if (!ctx) throw new Error('useStreamContext must be used within StreamProvider');
  return ctx;
}