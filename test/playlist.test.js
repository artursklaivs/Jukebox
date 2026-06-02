const test = require('node:test');
const assert = require('node:assert/strict');
const { ShuffledPlaylist, parseFlatPlaylist } = require('../src/playlist');

test('parseFlatPlaylist converts yt-dlp json lines to tracks', () => {
  const output = [
    JSON.stringify({ title: 'First', webpage_url: 'https://www.youtube.com/watch?v=one' }),
    JSON.stringify({ title: 'Second', id: 'two' }),
  ].join('\n');

  assert.deepEqual(parseFlatPlaylist(output), [
    { title: 'First', url: 'https://www.youtube.com/watch?v=one' },
    { title: 'Second', url: 'https://www.youtube.com/watch?v=two' },
  ]);
});

test('ShuffledPlaylist keeps returning tracks across shuffle rounds', () => {
  const playlist = new ShuffledPlaylist([
    { title: 'A', url: 'a' },
    { title: 'B', url: 'b' },
  ], () => 0);

  assert.equal(playlist.next().title, 'B');
  assert.equal(playlist.next().title, 'A');
  assert.equal(playlist.next().title, 'B');
});
