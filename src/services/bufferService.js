import apiService from './api';

const BUFFER_KEY = 'requestBuffer';
const MAX_BUFFER_SIZE = 10; // Número máximo de peticiones antes de enviarlas
const FLUSH_INTERVAL = 30000; // Tiempo en milisegundos para enviar el buffer automáticamente

// Obtener el buffer desde localStorage
function getBuffer() {
    const buffer = localStorage.getItem(BUFFER_KEY);
    console.log('Obteniendo buffer desde localStorage:', buffer); // Verificar datos obtenidos
    return buffer ? JSON.parse(buffer) : {}; // Cambiar [] por {}
}

// Guardar el buffer en localStorage
function saveBuffer(buffer) {
    console.log('Guardando buffer en localStorage:', JSON.stringify(buffer, null, 2)); // Verificar datos guardados
    localStorage.setItem(BUFFER_KEY, JSON.stringify(buffer));
}

// Agregar una petición al buffer
export function addToBuffer(actionType, data) {
    console.log(`addToBuffer llamado con actionType: ${actionType}, data:`, data);

    try {
        const buffer = getBuffer();

        // Validar si ya existe un like para el mismo post
        if (actionType === 'likes') {
            const alreadyLiked = buffer.likes?.some(like => like.post_id === data.post_id);
            if (alreadyLiked) {
                console.log(`Ya existe un like para el post con ID ${data.post_id}. No se agregará al buffer.`);
                return;
            }
        }

        if (!buffer[actionType]) {
            buffer[actionType] = [];
        }
        buffer[actionType].push(data);
        console.log('Buffer actualizado:', JSON.stringify(buffer, null, 2));
        saveBuffer(buffer);

        // Si el buffer alcanza el tamaño máximo, enviarlo
        const totalActions = Object.values(buffer).reduce((sum, actions) => sum + actions.length, 0);
        if (totalActions >= MAX_BUFFER_SIZE) {
            flushBuffer();
        }
    } catch (error) {
        console.error('Error al agregar al buffer:', error);

        // Enviar la petición directamente al backend como respaldo
        apiService.sendBatchRequests({ [actionType]: [data] })
            .then(response => {
                console.log('Petición enviada directamente al backend:', response);
            })
            .catch(err => {
                console.error('Error al enviar la petición directamente al backend:', err);
            });
    }
}

// Enviar el buffer al servidor
export async function flushBuffer() {
    const buffer = getBuffer();
    if (Object.keys(buffer).length === 0) return; // No hay nada que enviar

    console.log('Enviando buffer:', buffer);

    try {
        const response = await apiService.sendBatchRequests(buffer);
        console.log('Buffer enviado con éxito:', response);

        // Limpiar el buffer después de enviarlo
        console.log('Limpiando buffer del localStorage');
        localStorage.removeItem(BUFFER_KEY);
    } catch (error) {
        console.error('Error al enviar el buffer:', error);

        // Enviar cada acción directamente al backend como respaldo
        Object.entries(buffer).forEach(([actionType, actions]) => {
            actions.forEach(action => {
                apiService.sendBatchRequests({ [actionType]: [action] })
                    .then(response => {
                        console.log(`Petición directa enviada para ${actionType}:`, response);
                    })
                    .catch(err => {
                        console.error(`Error al enviar la petición directa para ${actionType}:`, err);
                    });
            });
        });
    }
}

// Configurar un intervalo para enviar el buffer automáticamente
setInterval(() => {
    flushBuffer();
}, FLUSH_INTERVAL);

// Enviar el buffer cuando el usuario cambia de pestaña o ventana
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        flushBuffer();
    }
});

// Enviar el buffer cuando el usuario vuelve a estar en línea
window.addEventListener('online', () => {
    flushBuffer();
});