const YOUTUBE_HOST_PATTERN = /(?:https?:\/\/)?(?:www\.|m\.|music\.)?(?:youtube\.com|youtu\.be)\/[\S]+/gi;

function normalizeCandidate(rawUrl) {
  const trimmed = rawUrl.replace(/[)>\].,!?]+$/g, '');
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(withProtocol);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');

    if (host === 'youtu.be') {
      return parsed.pathname.length > 1 ? parsed.toString() : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      if (parsed.pathname === '/watch' && parsed.searchParams.has('v')) {
        return parsed.toString();
      }

      if (parsed.pathname.startsWith('/shorts/') || parsed.pathname.startsWith('/live/')) {
        return parsed.toString();
      }
    }
  } catch (_error) {
    return null;
  }

  return null;
}

function extractYouTubeLinks(text) {
  if (!text) {
    return [];
  }

  const links = [];
  const seen = new Set();
  const matches = text.matchAll(YOUTUBE_HOST_PATTERN);

  for (const match of matches) {
    const normalized = normalizeCandidate(match[0]);
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      links.push(normalized);
    }
  }

  return links;
}

module.exports = {
  extractYouTubeLinks,
};
