export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.setAttribute('tema', 'dark');
  } else {
    root.setAttribute('tema', 'light');
  }
  localStorage.setItem('selectedTheme', theme);
}

export function setupTheme() {
  const themeCheckbox = document.querySelector('input[name="light-dark"]');
  if (!themeCheckbox) return; // asegúrate de que existe

  let timerId;

  themeCheckbox.addEventListener('change', function (event) {
    clearTimeout(timerId);
    timerId = setTimeout(function () {
      const selectedTheme = event.target.checked ? 'dark' : 'light';
      applyTheme(selectedTheme);
    }, 3000);
  });

  const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const systemTheme = systemThemeQuery.matches ? 'dark' : 'light';

  const savedTheme = localStorage.getItem('selectedTheme') || systemTheme;

  applyTheme(savedTheme);

  // Reflejar el estado inicial en el checkbox
  themeCheckbox.checked = savedTheme === 'dark';
}

export default setupTheme;
