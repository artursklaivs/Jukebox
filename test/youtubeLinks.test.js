const test = require('node:test');
const assert = require('node:assert/strict');
const { extractYouTubeLinks } = require('../src/youtubeLinks');

test('extracts supported YouTube links and trims punctuation', () => {
  const links = extractYouTubeLinks('play https://youtu.be/abc123, and https://www.youtube.com/watch?v=xyz!');

  assert.deepEqual(links, [
    'https://youtu.be/abc123',
    'https://www.youtube.com/watch?v=xyz',
  ]);
});

test('ignores non-video YouTube URLs', () => {
  const links = extractYouTubeLinks('channel https://www.youtube.com/@openai and site https://example.com');

  assert.deepEqual(links, []);
});
