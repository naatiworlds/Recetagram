import { HTMLRewriter } from "https://ghuc.cc/worker-tools/html-rewriter/index.ts";

export default async (request, context) => {
  const url = new URL(request.url);
  
  // Solo procesar rutas de posts
  const postMatch = url.pathname.match(/^\/posts\/(\d+)$/);
  
  if (!postMatch) {
    // Si no es una ruta de post, servir normalmente
    return context.next();
  }
  
  const postId = postMatch[1];
  
  // Intentar obtener datos del post
  try {
    const apiUrl = "https://vps-a29998d6.vps.ovh.net:8443/api/v1";
    const response = await fetch(`${apiUrl}/posts/${postId}`);
    const data = await response.json();
    
    if (data.status !== 'success' || !data.data) {
      return context.next();
    }
    
    const post = data.data;
    const storageUrl = 'https://vps-a29998d6.vps.ovh.net:8443/storage';
    const imageUrl = post.imagen?.startsWith('http') 
      ? post.imagen 
      : `${storageUrl}/${post.imagen}`;
    
    const postUrl = `https://recetagram.netlify.app/posts/${postId}`;
    
    // Obtener el HTML original
    const originalResponse = await context.next();
    const html = await originalResponse.text();
    
    // Reemplazar los meta tags
    const updatedHtml = html
      .replace(
        /<meta property="og:title" content="[^"]*">/,
        `<meta property="og:title" content="${escapeHtml(post.title)}">`
      )
      .replace(
        /<meta property="og:description" content="[^"]*">/,
        `<meta property="og:description" content="${escapeHtml(post.description || '¡Mira esta increíble receta en Recetagram!')}">`
      )
      .replace(
        /<meta property="og:image" content="[^"]*">/,
        `<meta property="og:image" content="${imageUrl}">`
      )
      .replace(
        /<meta property="og:url" content="[^"]*">/,
        `<meta property="og:url" content="${postUrl}">`
      )
      .replace(
        /<meta name="twitter:title" content="[^"]*">/,
        `<meta name="twitter:title" content="${escapeHtml(post.title)}">`
      )
      .replace(
        /<meta name="twitter:description" content="[^"]*">/,
        `<meta name="twitter:description" content="${escapeHtml(post.description || '¡Mira esta increíble receta en Recetagram!')}">`
      )
      .replace(
        /<meta name="twitter:image" content="[^"]*">/,
        `<meta name="twitter:image" content="${imageUrl}">`
      )
      .replace(
        /<title>[^<]*<\/title>/,
        `<title>${escapeHtml(post.title)} - Recetagram</title>`
      );
    
    return new Response(updatedHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      }
    });
    
  } catch (error) {
    console.error('Error fetching post:', error);
    return context.next();
  }
};

function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

export const config = {
  path: "/posts/*"
};
