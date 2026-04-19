import { saveDrawing, listDrawings, removeDrawing } from '../api/drawingsApi';

export function useDrawings() {
  async function saveDrawingToServer(base64DataUrl, name) {
    const response = await saveDrawing(base64DataUrl, name);
    return response.drawing;
  }

  async function fetchDrawings() {
    const response = await listDrawings();
    return response.drawings;
  }

  async function deleteDrawing(id) {
    return await removeDrawing(id);
  }

  return { saveDrawingToServer, fetchDrawings, deleteDrawing };
}