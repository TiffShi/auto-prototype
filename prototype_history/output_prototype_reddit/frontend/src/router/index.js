import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CommunitiesView from '../views/CommunitiesView.vue'
import CommunityView from '../views/CommunityView.vue'
import CreatePostView from '../views/CreatePostView.vue'
import PostDetailView from '../views/PostDetailView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/communities', component: CommunitiesView },
  { path: '/communities/:id', component: CommunityView },
  { path: '/posts/create', component: CreatePostView },
  { path: '/posts/:id', component: PostDetailView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router