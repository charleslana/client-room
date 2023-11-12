import BoardView from '@/views/BoardView.vue';
import HomeView from '@/views/HomeView.vue';
import LobbyView from '@/views/LobbyView.vue';
import RoomView from '@/views/RoomView.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/lobby',
      name: 'lobby',
      component: LobbyView
    },
    {
      path: '/room/:roomName',
      name: 'room-name',
      component: RoomView
    },
    {
      path: '/board',
      name: 'board',
      component: BoardView
    },
    {
      path: '/model',
      name: 'model',
      component: () => import('@/views/ModelView.vue')
    }
  ]
});

interface RouteMeta {
  title?: string;
}

router.beforeEach((to, _from, next) => {
  const meta = to.meta as RouteMeta;
  if (meta && meta.title) {
    document.title = meta.title;
  } else {
    document.title = 'App';
  }
  next();
});

export default router;
