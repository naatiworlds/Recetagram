import apiService from './api';


const BUFFER_KEY = 'requestBuffer';
const MAX_BUFFER_SIZE = 30; // Número máximo de peticiones antes de enviarlas
const FLUSH_INTERVAL = 60000; // Tiempo en milisegundos para enviar el buffer automáticamente
let isFlushing = false;



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

function removeBuffer() {
    console.log('Limpiando buffer del localStorage');
    localStorage.removeItem(BUFFER_KEY);
}

// Agregar una petición al buffer
export function addToBuffer(actionType, data, notificationStore, options = {}) {
    // options puede incluir: { uniqueKey: ['post_id', 'user_id'], replace: true }
    // Ejemplo: addToBuffer('likes', { post_id, user_id }, store, { uniqueKey: ['post_id', 'user_id'], replace: true })

    console.log(`addToBuffer llamado con actionType: ${actionType}, data:`, data);

    try {
        const buffer = getBuffer();

        if (!buffer[actionType]) {
            buffer[actionType] = [];
        }

        // Si se pasa uniqueKey, busca si ya existe una acción igual y la reemplaza o elimina según options
        if (options.uniqueKey && Array.isArray(options.uniqueKey)) {
            const index = buffer[actionType].findIndex(item =>
                options.uniqueKey.every(key => item[key] === data[key])
            );
            if (index !== -1) {
                if (options.replace) {
                    // Reemplaza la acción existente
                    buffer[actionType][index] = data;
                } else if (options.removeIfExists) {
                    // Elimina la acción existente (toggle)
                    buffer[actionType].splice(index, 1);
                } else {
                    // Si no se especifica, no hace nada (no duplica)
                    return;
                }
            } else {
                buffer[actionType].push(data);
            }
        } else {
            // Si no hay uniqueKey, simplemente añade la acción
            buffer[actionType].push(data);
        }

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
                notificationStore?.show?.('Petición enviada directamente al backend', 'success');
            })
            .catch(err => {
                console.error('Error al enviar la petición directamente al backend:', err);
            });
    }
}


// Enviar el buffer al servidor
// Variable global para trackear el flush en curso
let flushPromise = null;

export async function flushBuffer() {
    if (flushPromise) {
        // Si ya hay un flush en curso, devolvemos esa promesa para que otros esperen
        return flushPromise;
    }

    const buffer = getBuffer();
    if (Object.keys(buffer).length === 0) {
        return Promise.resolve(); // No hay nada que enviar
    }

    flushPromise = (async () => {
        try {
            const response = await apiService.sendBatchRequests(buffer);
            console.log('Buffer enviado con éxito:', response);
            removeBuffer();
        } catch (error) {
            console.error('Error al enviar el buffer:', error);
            // Puedes manejar aquí el reintento o respaldo
        } finally {
            flushPromise = null; // Limpiar la promesa al terminar
        }
    })();

    return flushPromise;
}

// Ahora, flushBufferAndReloadProfile solo espera a flushBuffer y luego recarga
export async function flushBufferAndReloadProfile(loadUserProfileFn) {
    try {
        await flushBuffer();
        await loadUserProfileFn();
    } catch (error) {
        console.error('Error en flushBufferAndReloadProfile:', error);
        throw error;
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

