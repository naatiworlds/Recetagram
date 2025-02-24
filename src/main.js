import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import router from './router/router.js'
import { loadTheme } from "./utils/changeTheme"; // Importa la función
import { setupTheme } from './utils/changeLightDark.js';

loadTheme(); 

createApp(App)
    .use(router)    
    .mount('#app')
