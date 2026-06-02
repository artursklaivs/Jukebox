const { loadEnv } = require('./env');

loadEnv();

const { ensureInstalledPackages, requireInstalledPackage } = require('./dependencies');
const { Player } = require('./player');
const { loadPlaylist, ShuffledPlaylist } = require('./playlist');
const { RequestQueue } = require('./requestQueue');
const { extractYouTubeLinks } = require('./youtubeLinks');

const config = {
  playlistUrl: process.env.YOUTUBE_PLAYLIST_URL,
  playerCommand: process.env.PLAYER_COMMAND || 'mpv',
  ytdlpCommand: process.env.YTDLP_COMMAND || 'yt-dlp',
  whatsappHeadless: process.env.WHATSAPP_HEADLESS === '1',
  interruptOnRequest: process.env.INTERRUPT_ON_REQUEST === '1',
};

function ensureConfig() {
  if (!config.playlistUrl) {
    throw new Error('YOUTUBE_PLAYLIST_URL is required. Copy .env.example to .env and set your playlist URL.');
  }
}

function createWhatsAppClient() {
  const { Client, LocalAuth } = requireInstalledPackage('whatsapp-web.js');
  const qrcode = requireInstalledPackage('qrcode-terminal');

  const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: config.whatsappHeadless,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  });

  client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('WhatsApp QR code is ready. Scan it in the opened WhatsApp Web browser window or from the terminal.');
  });

  client.on('authenticated', () => {
    console.log('WhatsApp authenticated.');
  });

  client.on('ready', () => {
    console.log('WhatsApp bot is ready. Send a YouTube link to queue it next.');
  });

  client.on('auth_failure', (message) => {
    console.error('WhatsApp authentication failed:', message);
  });

  return client;
}

function createTrackFromRequest(url, contactName) {
  return {
    title: `WhatsApp request from ${contactName || 'unknown contact'}`,
    url,
    requestedBy: contactName,
  };
}

async function start() {
  ensureConfig();
  ensureInstalledPackages(['whatsapp-web.js', 'qrcode-terminal']);

  console.log('Loading YouTube playlist...');
  const playlistItems = await loadPlaylist(config.playlistUrl, config.ytdlpCommand);
  const playlist = new ShuffledPlaylist(playlistItems);
  const requestQueue = new RequestQueue();
  const player = new Player(config.playerCommand);
  const client = createWhatsAppClient();

  client.on('message', async (message) => {
    const links = extractYouTubeLinks(message.body);
    if (links.length === 0) {
      return;
    }

    let contactName = message.from;
    try {
      const contact = await message.getContact();
      contactName = contact.pushname || contact.name || contact.number || message.from;
    } catch (error) {
      console.warn('Could not read WhatsApp contact name:', error.message);
    }

    const tracks = links.map((url) => createTrackFromRequest(url, contactName));
    const queuedCount = requestQueue.enqueueNext(tracks);
    console.log(`Queued ${queuedCount} WhatsApp YouTube request(s). Pending requests: ${requestQueue.size()}`);

    if (config.interruptOnRequest) {
      player.skip();
    }

    await message.reply(
      queuedCount === 1
        ? '✅ YouTube links ir ielikts rindā kā nākamā dziesma.'
        : `✅ ${queuedCount} YouTube linki ir ielikti rindā.`
    );
  });

  await client.initialize();

  while (true) {
    const requestedTrack = requestQueue.takeNext();
    const track = requestedTrack || playlist.next();
    const source = requestedTrack ? 'WhatsApp request' : 'playlist';

    console.log(`Playing from ${source}: ${track.title} (${track.url})`);
    await player.play(track);
  }
}

start().catch((error) => {
  if (error.code === 'MISSING_NPM_PACKAGE') {
    console.error(error.message);
  } else {
    console.error(error);
  }

  process.exitCode = 1;
});