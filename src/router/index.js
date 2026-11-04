import { createRouter, createWebHistory } from 'vue-router'
import StudentListView from '../views/StudentListView.vue'
import StudentDetailView from '../views/StudentDetailView.vue'
import NotFoundView from '../views/NotFoundView.vue'

const routes = [
  { path: '/', component: StudentListView },
  { path: '/etudiant/:id', component: StudentDetailView },
  { path: '/:pathMatch(.*)*', component: NotFoundView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
