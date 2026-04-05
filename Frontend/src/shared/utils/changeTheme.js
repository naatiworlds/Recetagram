import { ANIMATION } from './globalConstants';

const changeTheme = (theme) => {
  const root = document.documentElement;

  if (theme === "default") {
    root.removeAttribute("tema");
  } else {
    root.setAttribute("tema", theme);
  }

  // Guardar la selección en localStorage
  localStorage.setItem("selectedTheme", theme);
};

const loadTheme = () => {
  const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const systemTheme = systemThemeQuery.matches ? "aqua" : "pink";

  setTimeout(() => {
    const savedTheme = localStorage.getItem("selectedTheme") || systemTheme;
    changeTheme(savedTheme);
  }, ANIMATION.THEME_CHANGE_DELAY);
};

export { changeTheme, loadTheme };
