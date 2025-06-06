import { createRouter, createWebHistory } from 'vue-router'
import CommentsAdmin from '../pages/Admin/Comments.vue'
import PostsAdmin from '../pages/Admin/Posts.vue'
import Home from '../pages/Home.vue'
import Post from '../pages/Post.vue'
import { useNotificationStore } from '../stores/notification'
import { useUserStore } from '../stores/user'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../pages/Login.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../pages/Register.vue')
  },
  {
    path: '/explorar',
    name: 'Explorar',
    component: () => import('../pages/Explorar.vue')
  },
  {
    path: '/contacto',
    name: 'contacto',
    component: () => import('../pages/Contacto.vue')
  },
  {
    path: '/profile',
    name: 'MyProfile',
    component: () => import('../pages/Profile.vue')
  },
  {
    path: '/user/:id',
    name: 'UserProfile',
    component: () => import('../pages/Profile.vue'),
    props: true
  },
  {
    path: '/posts/:id',
    name: 'Post',
    component: Post,
    props: true
  },
  {
    path: '/settings',
    name: 'UserConfig',
    component: () => import('../pages/Config/UserConfig.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'account',
        name: 'Account',
        component: () => import('../pages/Config/Account.vue'),
      },
      {
        path: 'preferences',
        name: 'Preferences',
        component: () => import('../pages/Config/Preferences.vue'),
      },
      {
        path: 'security',
        name: 'Security',
        component: () => import('../pages/Config/Security.vue'),
      },
    ],
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
        component: () => import('../pages/Admin/Users.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
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

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const notificationStore = useNotificationStore()

  notificationStore.clear()

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !userStore.isAuthenticated) {
    notificationStore.show(
      'Debes iniciar sesión para acceder a esta sección',
      'error',
      5000
    )
    next('/')
    return
  }

  if (to.meta.show && !userStore.isAuthenticated) {
    notificationStore.show(
      'Inicia sesión para acceder a todas las funcionalidades',
      'info',
      5000
    )
  }

  if (to.meta.requiresAdmin && userStore.user?.role?.toLowerCase() !== 'admin') {
    notificationStore.show('Acceso denegado: Solo administradores', 'error')
    next('/')
    return
  }

  next()
})

export default router
