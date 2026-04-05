const fetch = require('node-fetch');

function decodeHtmlEntities(value) {
  const text = String(value || '');
  if (!text) return '';

  const namedMap = {
    amp: '&',
    quot: '"',
    apos: "'",
    lt: '<',
    gt: '>',
    nbsp: ' ',
  };

  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (fullMatch, entity) => {
    const normalized = String(entity || '').toLowerCase();

    if (normalized.startsWith('#x')) {
      const code = parseInt(normalized.slice(2), 16);
      return Number.isNaN(code) ? fullMatch : String.fromCodePoint(code);
    }

    if (normalized.startsWith('#')) {
      const code = parseInt(normalized.slice(1), 10);
      return Number.isNaN(code) ? fullMatch : String.fromCodePoint(code);
    }

    return namedMap[normalized] ?? fullMatch;
  });
}

function resolveUrl(candidateUrl) {
  try {
    const parsed = new URL(candidateUrl);
    if (!/^https?:$/.test(parsed.protocol)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function extractOgImage(html) {
  if (!html) return '';

  const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/i);

  if (ogMatch && ogMatch[1]) return decodeHtmlEntities(ogMatch[1].trim());

  const twitterMatch = html.match(/<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["'][^>]*>/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image(?::src)?["'][^>]*>/i);

  return twitterMatch && twitterMatch[1] ? decodeHtmlEntities(twitterMatch[1].trim()) : '';
}

function extractMetaContent(html, keys) {
  for (const key of keys) {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const firstPattern = new RegExp(`<meta[^>]+(?:property|name)=["']${escapedKey}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i');
    const secondPattern = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escapedKey}["'][^>]*>`, 'i');

    const match = html.match(firstPattern) || html.match(secondPattern);
    if (match && match[1]) return decodeHtmlEntities(match[1].trim());
  }
  return '';
}

exports.handler = async function (event) {
  try {
    const sourceUrl = resolveUrl(event.queryStringParameters?.url || '');
    if (!sourceUrl) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: '', title: '', description: '' }),
      };
    }

    const response = await fetch(sourceUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'RecetagramSharePreview/1.0',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    if (!response.ok) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: '', title: '', description: '' }),
      };
    }

    const html = await response.text();
    const rawImage = extractOgImage(html);
    const rawTitle = extractMetaContent(html, ['og:title', 'twitter:title', 'title']);
    const rawDescription = extractMetaContent(html, ['og:description', 'twitter:description', 'description']);
    const imageUrl = rawImage ? new URL(rawImage, sourceUrl).toString() : '';

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
      body: JSON.stringify({ image: imageUrl, title: rawTitle, description: rawDescription }),
    };
  } catch (error) {
    console.error('share-preview error:', error);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: '', title: '', description: '' }),
    };
  }
};
