const fetch = require('node-fetch');

function resolveUrl(candidateUrl) {
  try {
    const parsed = new URL(candidateUrl);
    if (!/^https?:$/.test(parsed.protocol)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

exports.handler = async function (event) {
  try {
    const sourceUrl = resolveUrl(event.queryStringParameters?.url || '');
    if (!sourceUrl) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid image url' }),
      };
    }

    const upstream = await fetch(sourceUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'RecetagramShareImage/1.0',
        Accept: 'image/*,*/*;q=0.8',
      },
    });

    if (!upstream.ok) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Image not found' }),
      };
    }

    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    const buffer = await upstream.buffer();

    return {
      statusCode: 200,
      isBase64Encoded: true,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=300',
      },
      body: buffer.toString('base64'),
    };
  } catch (error) {
    console.error('share-image error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Unable to fetch image' }),
    };
  }
};
