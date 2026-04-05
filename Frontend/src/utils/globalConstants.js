// API Configuration
export const API_ORIGIN = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
export const API_BASE_URL = `${API_ORIGIN}/api/v1`
export const STORAGE_URL = `${API_ORIGIN}/storage`

// Animation Configuration
export const ANIMATION = {
    SCROLL_AMOUNT: 400,
    PARTICLE_COUNT: 10
};

// Media Queries
export const BREAKPOINTS = {
    MOBILE: '600px',
    TABLET: '800px',
    DESKTOP: '1600px'
};

// Default Avatar
export const DEFAULT_AVATAR_URL = 'https://ui-avatars.com/api';  // Servicio de avatares por defecto
