export function post(fragmento) {
    if (fragmento) {
  
      const articles = document.querySelectorAll("article");
  
      // Iterar sobre cada artículo y ocultarlo
      articles.forEach(article => {
        article.style.display = "none";
      });
  
      const postId = `post-${fragmento}`;
  
      const publicacion = document.getElementById(postId);
  
      // Mostrar solo la publicación deseada
      if (publicacion) {
        publicacion.style.display = 'block';
      } else {
      }
    } else {
    }
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    const fragmento = window.location.hash.substring(1);
    post(fragmento);
  });
  