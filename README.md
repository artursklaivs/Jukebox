# Jukebox WhatsApp Bot

Šis projekts ir WhatsApp bots Windows 11 datoram. Tas atskaņo tavu YouTube playlisti jauktā secībā, klausās WhatsApp ziņas un, tiklīdz saņem YouTube linku, ieliek šo dziesmu pieprasījumu rindā pirms nākamās playlistes dziesmas. Kad WhatsApp pieprasījumu vairs nav, bots automātiski turpina atskaņot esošo playlisti.

## Kā tas strādā

- Bots pieslēdzas WhatsApp Web ar QR kodu, izmantojot `whatsapp-web.js`.
- YouTube playlistes saraksts tiek nolasīts ar `yt-dlp` bez YouTube API atslēgas.
- Atskaņošana notiek ar `mpv`, tāpēc Windows datorā dzirdama audio izvade.
- Playlistes dziesmas tiek sajauktas katrā jaunā aplī.
- WhatsApp ziņās atrastie YouTube linki tiek ielikti pieprasījumu rindā.
- Pēc pašreizējās dziesmas beigām bots vispirms atskaņo WhatsApp pieprasījumus, pēc tam atgriežas pie playlistes.

## Windows 11 priekšnosacījumi

1. Instalē [Node.js LTS](https://nodejs.org/).
2. Instalē `yt-dlp` un pārliecinies, ka `yt-dlp.exe` ir pieejams `PATH`.
3. Instalē `mpv` un pārliecinies, ka `mpv.exe` ir pieejams `PATH`.
4. WhatsApp telefonā jābūt iespējai pieslēgt jaunu WhatsApp Web ierīci.

Ja `yt-dlp.exe` vai `mpv.exe` nav `PATH`, norādi pilno ceļu `.env` failā ar `YTDLP_COMMAND` un `PLAYER_COMMAND`.

## Uzstādīšana

```powershell
npm install
Copy-Item .env.example .env
notepad .env
```

`.env` failā obligāti nomaini:

```dotenv
YOUTUBE_PLAYLIST_URL=https://www.youtube.com/playlist?list=YOUR_PLAYLIST_ID
```

## Palaišana

```powershell
npm start
```

Pirmajā reizē terminālī parādīsies QR kods. Atver WhatsApp telefonā, izvēlies **Linked devices / Saistītās ierīces** un noskenē QR kodu. Sesija tiks saglabāta mapē `.wwebjs_auth/`, lai nākamreiz nebūtu jāpieslēdzas no jauna.

## Dziesmu pieprasījumi WhatsApp

Nosūti botam vai grupā, kur bots redz ziņas, jebkuru no šiem linkiem:

- `https://youtu.be/...`
- `https://www.youtube.com/watch?v=...`
- `https://music.youtube.com/watch?v=...`
- `https://www.youtube.com/shorts/...`
- `https://www.youtube.com/live/...`

Bots atbildēs ar apstiprinājumu un atskaņos linku pēc pašreizējās dziesmas. Ja ienāk vairāki pieprasījumi, tie tiek atskaņoti saņemšanas secībā.

## Opcijas

| Mainīgais | Noklusējums | Apraksts |
| --- | --- | --- |
| `YOUTUBE_PLAYLIST_URL` | nav | Tavas YouTube playlistes URL. Obligāts. |
| `PLAYER_COMMAND` | `mpv` | Atskaņotāja komanda vai pilns ceļš uz `mpv.exe`. |
| `YTDLP_COMMAND` | `yt-dlp` | Komanda vai pilns ceļš uz `yt-dlp.exe`. |
| `WHATSAPP_HEADLESS` | `0` | `0` rāda pārlūka logu, `1` palaiž bez redzama loga. |
| `INTERRUPT_ON_REQUEST` | `0` | `1` pārtrauc pašreizējo dziesmu un sāk WhatsApp pieprasījumu uzreiz. |

## Testi

```powershell
npm test
```

## Piezīmes

- Bots izmanto WhatsApp Web automatizāciju, tāpēc datoram jāpaliek ieslēgtam un ar interneta savienojumu.
- Šis projekts nelejupielādē mūziku; tas padod YouTube URL `mpv` atskaņotājam.
- Publiskas vai neiekļautas (`unlisted`) playlistes parasti strādā stabilāk nekā privātas playlistes.
