import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notification'
import PostsAdmin from '../pages/Admin/Posts.vue'
import CommentsAdmin from '../pages/Admin/Comments.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../pages/Home.vue')  // Actualizado
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../pages/Login.vue')  // Actualizado
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../pages/Register.vue')  // Actualizado
    },
    {
      path: '/explorar',
      name: 'explorar',
      component: () => import('../pages/Explorar.vue')
    },
    {
      path: '/contacto',
      name: 'contacto',
      component: () => import('../pages/Contacto.vue')
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../pages/Profile.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/post/:id',
      name: 'post',
      component: () => import('../pages/Post.vue'),
      props: true
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../pages/Admin/Dashboard.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('../pages/Admin/Users.vue')
        },
        {
          path: 'posts',
          name: 'PostsAdmin',
          component: PostsAdmin,
          meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'comments',
          name: 'CommentsAdmin',
          component: CommentsAdmin,
          meta: { requiresAuth: true, requiresAdmin: true }
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../pages/404.vue')
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const notificationStore = useNotificationStore()
  
  notificationStore.hideNotification()

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authStore.isAuthenticated) {
      notificationStore.showNotification(
        'Debes iniciar sesión para acceder a esta sección',
        'error',
        5000
      )
      return next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }
  }
  
  if (to.meta.showNotification && !authStore.isAuthenticated) {
    notificationStore.showNotification(
      'Inicia sesión para acceder a todas las funcionalidades',
      'info',
      5000
    )
  }
  
  if (to.meta.requiresAdmin && authStore.user?.role?.toLowerCase() !== 'admin') {
    notificationStore.showNotification('Acceso denegado: Solo administradores', 'error')
    next('/')
    return
  }
  
  next()
})

export default router
