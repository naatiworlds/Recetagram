const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const postId = event.queryStringParameters.id;
  
  if (!postId) {
    return {
      statusCode: 400,
      body: 'Missing post ID'
    };
  }

  try {
    // Obtener datos del post desde tu API
    const apiUrl = "https://vps-a29998d6.vps.ovh.net:8443/api/v1";
    const response = await fetch(`${apiUrl}/api/posts/${postId}`);
    const data = await response.json();
    
    if (!data.status === 'success' || !data.data) {
      throw new Error('Post not found');
    }

    const post = data.data;
    const storageUrl = process.env.VITE_STORAGE_URL || 'https://recetagramapi-production.up.railway.app/storage';
    const imageUrl = post.imagen?.startsWith('http') 
      ? post.imagen 
      : `${storageUrl}/${post.imagen}`;
    
    const siteUrl = 'https://recetagram.netlify.app';
    const postUrl = `${siteUrl}/posts/${postId}`;

    // HTML con meta tags dinámicos
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Open Graph Meta Tags -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(post.title)}">
  <meta property="og:description" content="${escapeHtml(post.description || '¡Mira esta increíble receta en Recetagram!')}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:url" content="${postUrl}">
  <meta property="og:site_name" content="Recetagram">
  
  <!-- Twitter Card Meta Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(post.title)}">
  <meta name="twitter:description" content="${escapeHtml(post.description || '¡Mira esta increíble receta en Recetagram!')}">
  <meta name="twitter:image" content="${imageUrl}">
  
  <!-- Redirect to the actual post page -->
  <meta http-equiv="refresh" content="0; url=${postUrl}">
  <script>window.location.href = '${postUrl}';</script>
  
  <title>${escapeHtml(post.title)} - Recetagram</title>
</head>
<body>
  <p>Redirigiendo a <a href="${postUrl}">${escapeHtml(post.title)}</a>...</p>
</body>
</html>
    `;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      },
      body: html
    };
  } catch (error) {
    console.error('Error fetching post:', error);
    
    // Fallback a la página principal
    return {
      statusCode: 302,
      headers: {
        'Location': 'https://recetagram.netlify.app'
      }
    };
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
  return text.replace(/[&<>"']/g, m => map[m]);
}
