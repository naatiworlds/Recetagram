import axios from "axios";
import setupInterceptors from "./apiInterceptors";
import { useNotificationStore } from "@/stores/notification";
import { useUserStore } from "@/stores/user";
import throttle from 'lodash/throttle';

// =====================================
// Configuración de Axios
// =====================================
const api = axios.create({
  baseURL: "https://51.178.85.46:8443/api/v1",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
setupInterceptors(api);

// =====================================
// Interceptores personalizados
// =====================================
api.interceptors.response.use(
  (response) => {
    if (response.data?.data?.type === "token_expiration") {
      const notificationStore = useNotificationStore();
      notificationStore.handleTokenExpiration(response.data.data.message);
    }
    return response;
  },
  (error) => {
    const notificationStore = useNotificationStore();
    const userStore = useUserStore();
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


// =====================================
// Lógica para limitar peticiones y reintentos
// =====================================
const MAX_RETRIES = 5;
const RETRY_DELAY_BASE = 6000;


const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function requestWithLimit(apiCall, retries = 0) {
  try {
    return await apiCall();
  } catch (error) {
    const status = error.response?.status;
    const message = error.response?.data?.message || "";

    if (
      (status === 429 || (status === 500 && message.includes("Too Many Attempts"))) &&
      retries < MAX_RETRIES
    ) {
      const delay = RETRY_DELAY_BASE * 2 ** retries;
      console.warn(`[API] Too Many Attempts, retrying en ${delay}ms (intento ${retries + 1})`);
      await wait(delay);
      return requestWithLimit(apiCall, retries + 1);
    }

    throw error;
  }
}

// =====================================
// Exportación del servicio API
// =====================================
export const apiService = {
  // ----------- Autenticación & Token -----------
  setAuthToken: (token) => {
    if (token) {
      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
    }
  },

  login: (credentials) => api.post("/login", credentials),
  register: (userData) => api.post("/register", userData),
  logout: () => {
    api.post("/fcm-token", { fcm_token: null });
    return api.post("/logout");
  },
  getMe: () => requestWithLimit(() => api.get("/me")),

  // ----------- Usuarios -----------
  getUsers: () => requestWithLimit(() => api.get("/users")),
  getUser: (userId) => requestWithLimit(() => api.get(`/users/${userId}`)),
  updateUser: (userId, userData) => api.put(`/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/users/${userId}`),
  getUserPosts: (userId) => requestWithLimit(() => api.get(`/users/${userId}/posts`)),

  // Versión alternativa para obtener perfil
  getUserProfile: (userId) => requestWithLimit(() => api.get(`/users/${userId}`)),

  // ----------- Posts -----------
  getPublicPosts: () => requestWithLimit(() => api.get("/posts/public")),
  getAllPosts: () => requestWithLimit(() => api.get("/posts")),
  getPost: (postId) => requestWithLimit(() => api.get(`/posts/${postId}`)),
  createPost: (formData) =>
    api.post("/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updatePost: (postId, formData) =>
    api.post(`/posts/${postId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deletePost: (postId) => api.delete(`/posts/${postId}`),
  getFollowingPosts: () => requestWithLimit(() => api.get("/posts/following")),

  // ----------- Comments -----------
  getComments: async (postId) => {
    if (!postId) throw new Error("Se requiere un postId para obtener los comentarios.");
    const response = await requestWithLimit(() => api.get(`/posts/${postId}/comments`));
    return {
      data: {
        status: "success",
        message: "Comentarios obtenidos con éxito",
        data: response.data.data || [],
      },
    };
  },

  getAdminComments: async () => {
    try {
      const postsResponse = await requestWithLimit(() => api.get("/posts"));
      const posts = postsResponse.data.data;

      const commentsPromises = posts.map((post) =>
        requestWithLimit(() => api.get(`/posts/${post.id}/comments`))
          .then((response) => {
            const comments = response.data.data || [];
            return comments.map((comment) => ({
              ...comment,
              post: { id: post.id, title: post.title },
            }));
          })
          .catch((error) => {
            console.error(`[API] Error al obtener comentarios del post ${post.id}:`, error);
            return [];
          })
      );

      const commentsArrays = await Promise.all(commentsPromises);
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
    requestWithLimit(() => api.get(`/posts/${postId}/comments/${commentId}`)),
  createComment: (postId, comment) =>
    api.post(`/posts/${postId}/comments`, { content: comment }),
  updateComment: (postId, commentId, content) =>
    api.put(`/posts/${postId}/comments/${commentId}`, { content }),
  deleteComment: (postId, commentId) =>
    api.delete(`/posts/${postId}/comments/${commentId}`),

  // ----------- Likes -----------
  toggleLike: (postId) => api.post(`/posts/${postId}/like`),

  // ----------- Follows -----------
  getFollowers: (userId) => requestWithLimit(() => api.get(`/users/${userId}/followers`)),
  getFollowing: (userId) => requestWithLimit(() => api.get(`/users/${userId}/following`)),
  getFollowData: async (userId) => {
    const [followers, following] = await Promise.all([
      requestWithLimit(() => api.get(`/users/${userId}/followers`)),
      requestWithLimit(() => api.get(`/users/${userId}/following`)),
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
  getFollowStatus: (userId) =>
    requestWithLimit(() => api.get(`/follows/check/${userId}`)),
  followUser: (userId) => api.post(`/users/${userId}/follow`),
  unfollowUser: (userId) => api.delete(`/users/${userId}/unfollow`),
  acceptFollow: (followId) => api.post(`/follows/${followId}/accept`),
  rejectFollow: (followId) => api.post(`/follows/${followId}/reject`),

  // ----------- Notifications -----------
  sendTokenNotification: (currentToken) => {
    const formattedToken = `"${currentToken}"`;
    return api
      .post("/fcm-token", { fcm_token: formattedToken })
      .then((response) => {
        // Token FCM sent to backend
        return response.data;
      })
      .catch((err) => {
        console.error("Error al enviar el token al backend:", err.response?.data || err.message);
        throw err;
      });
  },
  getNotifications: () => requestWithLimit(() => api.get("/notifications")),
  markNotificationAsRead: (notificationId) =>
    api.patch(`/notifications/${notificationId}/read`),
  markAllNotificationsAsRead: () => api.patch("/notifications/markAllRead"),

  // ----------- Batch Requests -----------
  sendBatchRequests: async (batchData) => {
    try {
      const response = await api.post("/batch", batchData);
      // batch requests sent successfully
      return response.data;
    } catch (error) {
      console.error("[API] Error al enviar peticiones en lote:", error);
      throw error;
    }
  },

  // ----------- Additional Helpers -----------
  sharePost: (postId) => api.post(`/posts/${postId}/share`),
};

export default apiService;
