import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
]

const router = createRouter({
  history: createWebHashHistory(), //hash模式，有#,如http://localhost:8080/#/，而另一种history模式需要后端(服务器端)支持,需要配置
  routes
})

export default router
