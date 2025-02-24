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

  const savedTheme = localStorage.getItem("selectedTheme") || systemTheme;
  changeTheme(savedTheme);
};

export { changeTheme, loadTheme };
