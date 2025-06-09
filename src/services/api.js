import axios from "axios";
import setupInterceptors from "./apiInterceptors";
import { useNotificationStore } from "@/stores/notification";
import { useUserStore } from "@/stores/user";
// import { useNotificationStore } from "../stores/notification";
// import { useUserStore } from "../stores/user";

// Configura Axios con las opciones básicas
const api = axios.create({
  baseURL: "https://recetagram-api.onrender.com/api/v1",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "Error en la petición:",
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

setupInterceptors(api);

// Interceptor de respuesta
axios.interceptors.response.use(
  (response) => {
    // Si se recibe una notificación de tipo token_expiration, mostramos la advertencia
    if (response.data?.data?.type === "token_expiration") {
      const notificationStore = useNotificationStore();
      notificationStore.handleTokenExpiration(response.data.data.message);
    }
    return response;
  },
  (error) => {
    const notificationStore = useNotificationStore();
    const userStore = useUserStore();

    // Si el token ha expirado, se dispara esta lógica
    if (error.response?.data?.code === "token_expired") {
      userStore.logout();
      notificationStore.show(
        "Su sesión ha expirado. Por favor, inicie sesión nuevamente.",
        "error"
      );
    }

    return Promise.reject(error);
  }
);

export const apiService = {
  // Método para establecer el token
  setAuthToken: (token) => {
    if (token) {
      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    }
  },


  // Luego, en el método login lo usamos:
  login: async (credentials) => {
    // Luego realizamos la petición de login
    return api.post('/login', credentials);
  },

  register: (userData) => {
    return api.post("/register", userData);
  },

  logout: () => {
    api.post('/fcm-token', { fcm_token: null });
    return api.post("/logout");

  },

  getMe: () => {
    return api.get("/me");
  },

  // Users
  getUsers: () => api.get("/users"),
  getUser: (userId) => api.get(`/users/${userId}`),
  updateUser: (userId, userData) => {
    return api.put(`/users/${userId}`, userData);
  },
  deleteUser: (userId) => api.delete(`/users/${userId}`),
  getUserPosts: (userId) => api.get(`/users/${userId}/posts`),

  // Posts
  getPublicPosts: () => api.get("/posts/public"),

  getPosts(params = {}) {
    const endpoint = params.public ? "/posts/public" : "/posts/following";
  },
  getAllPosts: () => api.get("/posts"),

  async getPost(postId) {
    return api.get(`/posts/${postId}`);
  },

  createPost: (formData) => {
    return api.post("/posts", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  updatePost: (postId, formData) => {
    return api.put(`/posts/${postId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  async deletePost(postId) {
    return api.delete(`/posts/${postId}`);
  },

  // Comments
  getComments: async (postId) => {
    if (!postId) {
      throw new Error("Se requiere un postId para obtener los comentarios.");
    }
    try {
      console.log(`[API] Solicitando comentarios para el post ${postId}`);
      const response = await api.get(`/posts/${postId}/comments`);
      // Asumimos que la respuesta ya envía la data en el formato deseado
      return {
        data: {
          status: "success",
          message: "Comentarios obtenidos con éxito",
          data: response.data.data || []
        }
      };
    } catch (error) {
      console.error("[API] Error al obtener comentarios del post:", error);
      throw error;
    }
  },
  getAdminComments: async (postId) => {
    try {
      console.log("[API] Solicitando todos los comentarios");

      // Primero obtenemos todos los posts
      const postsResponse = await api.get("/posts");
      const posts = postsResponse.data.data;

      // Luego obtenemos los comentarios de cada post
      const commentsPromises = posts.map((post) =>
        api
          .get(`/posts/${post.id}/comments`)
          .then((response) => {
            // Añadimos información del post a cada comentario
            const comments = response.data.data || [];
            return comments.map((comment) => ({
              ...comment,
              post: {
                id: post.id,
                title: post.title,
              },
            }));
          })
          .catch((error) => {
            console.error(
              `[API] Error al obtener comentarios del post ${post.id}:`,
              error
            );
            return []; // Devolvemos array vacío si hay error
          })
      );

      // Esperamos a que se resuelvan todas las promesas
      const commentsArrays = await Promise.all(commentsPromises);

      // Aplanamos el array de arrays de comentarios
      const allComments = commentsArrays.flat();

      return {
        data: {
          status: "success",
          message: "Comentarios obtenidos con éxito",
          data: allComments,
        },
      };
    } catch (error) {
      console.error("[API] Error al obtener todos los comentarios:", error);
      throw error;
    }
  },
  getComment: (postId, commentId) =>
    api.get(`/posts/${postId}/comments/${commentId}`),
  createComment: (postId, comment) =>
    api.post(`/posts/${postId}/comments`, { content: comment }),
  updateComment: (postId, commentId, content) =>
    api.put(`/posts/${postId}/comments/${commentId}`, { content }),
  deleteComment: (postId, commentId) =>
    api.delete(`/posts/${postId}/comments/${commentId}`),

  // Likes
  toggleLike: (postId) => api.post(`/posts/${postId}/like`),

  // Follows
  getFollowers: (userId) => api.get(`/users/${userId}/followers`),
  getFollowing: (userId) => api.get(`/users/${userId}/following`),
  getPendingFollows: () => api.get("/follows/pending"),
  async followUser(userId) {
    return api.post(`/users/${userId}/follow`);
  },
  async unfollowUser(userId) {
    return api.delete(`/users/${userId}/unfollow`);
  },
  acceptFollow: (followId) => api.post(`/follows/${followId}/accept`),
  rejectFollow: (followId) => api.post(`/follows/${followId}/reject`),


  getNotifications: () => api.get("/notifications"),
  markNotificationAsRead: (notificationId) =>
    api.patch(`/notifications/${notificationId}/read`),
  markAllNotificationsAsRead: () => api.patch("/notifications/markAllRead"),



  // Additional helpers
  acceptFollowRequest: (fromUserId) => {
    return api.post(`/follows/${fromUserId}/accept`);
  },
  rejectFollowRequest: (fromUserId) => {
    return api.post(`/follows/${fromUserId}/reject`);
  },
  sharePost: (postId) => api.post(`/posts/${postId}/share`),

  // Obtener perfil de usuario
  getUserProfile: (userId) => {
    return api.get(`/users/${userId}`);
  },

  // Obtener solicitudes pendientes
  getPendingFollows: () => api.get("/follows/pending"),

  // Aceptar solicitud de seguimiento
  acceptFollow: (followId) => api.post(`/follows/${followId}/accept`),

  // Rechazar solicitud de seguimiento
  rejectFollow: (followId) => api.post(`/follows/${followId}/reject`),

  // Verificar estado de seguimiento
  checkFollowStatus: async (userId) => {
    const response = await axios.get(`/api/v1/follows/check/${userId}`);
    return response.data.data.status;
  },

  async getFollowData(userId) {
    const [followers, following] = await Promise.all([
      api.get(`/users/${userId}/followers`),
      api.get(`/users/${userId}/following`),
    ]);
    return {
      data: {
        status: "success",
        data: {
          followers_count: followers.data.data.length,
          following_count: following.data.data.length,
        },
      },
    };
  },

  async getFollowStatus(userId) {
    return api.get(`/follows/check/${userId}`);
  },

  // Obtener posts de usuarios seguidos (feed)
  getFollowingPosts: () => api.get("/posts/following"),

  /**
   * Enviar acciones agrupadas al endpoint /batch
   * @param {Object} batchData - Objeto con las acciones agrupadas (likes, comments, notifications, follows)
   * @returns {Promise} - Respuesta del servidor
   */
  async sendBatchRequests(batchData) {
    try {
      const response = await api.post('/batch', batchData);
      console.log('[API] Peticiones en lote enviadas con éxito:', response.data);
      return response.data;
    } catch (error) {
      console.error('[API] Error al enviar peticiones en lote:', error);
      throw error;
    }
  },
};

export default apiService;
