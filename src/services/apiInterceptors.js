import { useNotificationStore } from "@/stores/notification";


const setupInterceptors = (api) => {
  // Interceptor para añadir el token a todas las peticiones
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      const notificationStore = useNotificationStore();

      if (error.response?.status === 500) {
        // Mostrar mensaje amigable al usuario
        notificationStore.show(
          "El servidor está recibiendo demasiadas peticiones. Por favor, espere unos momentos.",
          "error"
        );
      }

      return Promise.reject(error);
    }
  );
}

export default setupInterceptors 