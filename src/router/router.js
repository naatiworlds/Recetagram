import { createRouter, createWebHashHistory, createWebHistory } from "vue-router";
import Home from "../pages/Home.vue";

const routes = [
    {
        path: '/',
        component: Home,
        children: [
            {
                path: '',
                component: () => import('../components/HomeSection.vue'),
            }
        ]
    },
    {
        path: '/contacto',
        component: () => import('../pages/Contacto.vue'),
    },
    {
        path: '/explorar',
        component: () => import('../pages/Explorar.vue'),
    },
    {
        path: '/:pathMatch(.*)*',
        component: () => import('../pages/404.vue'),
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// guard global
// router.beforeEach((to, from, next) => {
//     const userStore = useUserStore();

//     if (to.matched.some(record => record.meta.requiresAuth)) {
//         if (userStore.isLogged()) {
//             next();
//         } else {
//             next('/login');
//         }
//     } else {
//         next();
//     }
// });

export default router;