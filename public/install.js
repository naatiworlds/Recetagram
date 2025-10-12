let deferredPrompt;
const installBtn = document.getElementById('installBtn');
const installBanner = document.getElementById('installBanner');
const closeBanner = document.getElementById('closeBanner');

// Detectar si es iOS
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

// Función para mostrar mensaje de iOS
function showIOSMessage() {
  if (installBanner) {
    installBanner.style.display = 'block';
    installBtn.onclick = () => {
      alert('Para instalar: toca Compartir → Añadir a pantalla de inicio');
    };
  }
}

// Función para cerrar el banner
function hideBanner() {
  if (installBanner) {
    installBanner.style.display = 'none';
  }
}

// Escuchar el evento beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('beforeinstallprompt event fired');
  e.preventDefault();
  deferredPrompt = e;
  
  if (installBanner) {
    installBanner.style.display = 'block';
  }
});

// Manejar clic en el botón de instalación
if (installBtn) {
  installBtn.addEventListener('click', async () => {
    if (isIOS) {
      showIOSMessage();
      return;
    }
    
    if (!deferredPrompt) {
      console.log('No hay deferredPrompt disponible');
      return;
    }
    
    try {
      // Mostrar el prompt de instalación
      deferredPrompt.prompt();
      
      // Esperar la respuesta del usuario
      const choice = await deferredPrompt.userChoice;
      console.log('Instalación:', choice.outcome);
      
      if (choice.outcome === 'accepted') {
        console.log('Usuario aceptó la instalación');
      } else {
        console.log('Usuario rechazó la instalación');
      }
      
      // Limpiar el prompt
      deferredPrompt = null;
      
      // Ocultar el banner
      hideBanner();
    } catch (error) {
      console.error('Error durante la instalación:', error);
    }
  });
}

// Escuchar cuando la app se instala
window.addEventListener('appinstalled', () => {
  console.log('PWA instalada exitosamente');
  
  // Ocultar el banner después de la instalación
  hideBanner();
});

// Manejar clic en el botón de cerrar
if (closeBanner) {
  closeBanner.addEventListener('click', () => {
    hideBanner();
  });
}

// Para iOS, mostrar el mensaje después de un delay
if (isIOS) {
  setTimeout(() => {
    showIOSMessage();
  }, 3000);
}

// Verificar si ya está instalada
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('PWA ya está instalada');
  hideBanner();
}
