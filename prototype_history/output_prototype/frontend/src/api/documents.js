import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const listDocuments = async () => {
  const response = await api.get('/documents');
  return response.data;
};

export const createDocument = async ({ title, content }) => {
  const response = await api.post('/documents', { title, content });
  return response.data;
};

export const getDocument = async (id) => {
  const response = await api.get(`/documents/${id}`);
  return response.data;
};

export const updateDocument = async (id, { title, content }) => {
  const response = await api.put(`/documents/${id}`, { title, content });
  return response.data;
};

export const deleteDocument = async (id) => {
  await api.delete(`/documents/${id}`);
};