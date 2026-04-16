<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">🖼 Gallery</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <div v-if="loading" class="state-msg">Loading drawings...</div>
        <div v-else-if="error" class="state-msg error">{{ error }}</div>
        <div v-else-if="drawings.length === 0" class="state-msg">
          No saved drawings yet. Start drawing and save!
        </div>
        <div v-else class="gallery-grid">
          <div
            v-for="drawing in drawings"
            :key="drawing.id"
            class="gallery-item"
          >
            <div class="gallery-img-wrap">
              <img
                :src="getImageUrl(drawing.url)"
                :alt="drawing.name"
                class="gallery-img"
                loading="lazy"
              />
              <div class="gallery-overlay">
                <button class="overlay-btn load" @click="$emit('load-drawing', getImageUrl(drawing.url))">
                  📂 Load
                </button>
                <button class="overlay-btn delete" @click="handleDelete(drawing.id)">
                  🗑 Delete
                </button>
              </div>
            </div>
            <div class="gallery-info">
              <span class="gallery-name">{{ drawing.name }}</span>
              <span class="gallery-date">{{ formatDate(drawing.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useDrawings } from '../composables/useDrawings';

const emit = defineEmits(['close', 'load-drawing']);

const { fetchDrawings, deleteDrawing } = useDrawings();
const drawings = ref([]);
const loading = ref(true);
const error = ref(null);

const API_URL = import.meta.env.VITE_API_URL;

function getImageUrl(relativeUrl) {
  return `${API_URL}${relativeUrl}`;
}

async function loadDrawings() {
  loading.value = true;
  error.value = null;
  try {
    drawings.value = await fetchDrawings();
  } catch (err) {
    error.value = 'Failed to load drawings. Is the server running?';
  } finally {
    loading.value = false;
  }
}

async function handleDelete(id) {
  if (!confirm('Delete this drawing?')) return;
  try {
    await deleteDrawing(id);
    drawings.value = drawings.value.filter(d => d.id !== id);
  } catch (err) {
    alert('Failed to delete drawing.');
  }
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

onMounted(loadDrawings);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal {
  background: #16213e;
  border: 2px solid #0f3460;
  border-radius: 16px;
  width: 90vw;
  max-width: 860px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1px solid #0f3460;
  flex-shrink: 0;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #e2e8f0;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #a0aec0;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.15s;
}

.close-btn:hover {
  background: #e94560;
  color: #fff;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

.state-msg {
  text-align: center;
  color: #a0aec0;
  font-size: 15px;
  padding: 40px 0;
}

.state-msg.error {
  color: #e94560;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.gallery-item {
  background: #0f3460;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid transparent;
  transition: border-color 0.15s;
}

.gallery-item:hover {
  border-color: #e94560;
}

.gallery-img-wrap {
  position: relative;
  aspect-ratio: 4/3;
  overflow: hidden;
  background: #fff;
}

.gallery-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.gallery-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.gallery-img-wrap:hover .gallery-overlay {
  opacity: 1;
}

.overlay-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.1s;
}

.overlay-btn:hover {
  transform: scale(1.05);
}

.overlay-btn.load {
  background: #27ae60;
  color: #fff;
}

.overlay-btn.delete {
  background: #e94560;
  color: #fff;
}

.gallery-info {
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.gallery-name {
  font-size: 12px;
  font-weight: 600;
  color: #e2e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gallery-date {
  font-size: 10px;
  color: #718096;
}
</style>