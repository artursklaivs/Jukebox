const { spawn } = require('node:child_process');

function shuffle(items, random = Math.random) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }

  return copy;
}

function toWatchUrl(entry) {
  const candidate = entry.webpage_url || entry.url;

  if (candidate && /^https?:\/\//i.test(candidate)) {
    return candidate;
  }

  const id = entry.id || entry.url;
  return id ? `https://www.youtube.com/watch?v=${id}` : null;
}

function parseFlatPlaylist(stdout) {
  return stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line))
    .map((entry) => ({
      title: entry.title || entry.url || entry.id,
      url: toWatchUrl(entry),
    }))
    .filter((entry) => entry.url);
}

function loadPlaylist(playlistUrl, ytdlpCommand) {
  return new Promise((resolve, reject) => {
    const child = spawn(ytdlpCommand, ['--flat-playlist', '--dump-json', playlistUrl], {
      windowsHide: true,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('error', reject);

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`yt-dlp exited with code ${code}: ${stderr.trim()}`));
        return;
      }

      try {
        const items = parseFlatPlaylist(stdout);
        if (items.length === 0) {
          reject(new Error('yt-dlp returned an empty playlist.'));
          return;
        }
        resolve(items);
      } catch (error) {
        reject(error);
      }
    });
  });
}

class ShuffledPlaylist {
  constructor(items, random = Math.random) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('ShuffledPlaylist requires at least one item.');
    }

    this.items = items;
    this.random = random;
    this.remaining = [];
  }

  next() {
    if (this.remaining.length === 0) {
      this.remaining = shuffle(this.items, this.random);
    }

    return this.remaining.shift();
  }
}

module.exports = {
  ShuffledPlaylist,
  loadPlaylist,
  parseFlatPlaylist,
  shuffle,
};
