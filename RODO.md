# Todo list

## Twitch live notification

### Setup
- [ ] `.env`: `TWITCH_PROXY_URL`, `TWITCH_PROXY_API_KEY`, `DISCORD_LIVE_CHANNEL_ID`, `LIVE_NOTIFY_ENABLED`
- [ ] Optional `LIVE_POLL_INTERVAL` in `.env` (default ~30-60 s)

### Detection
- [ ] Poll `GET /api/stream` on the Twitch proxy (header `X-API-Key`)
  - [ ] Parse `{ online, stream }` (`id`, `title`, `game_name`, `game_id`, `thumbnail_url`, `viewer_count`, `started_at`, `user_login`)
  - [ ] Treat proxy errors or timeouts (including `401` if the Twitch account isn't authorized) as "unknown": keep the previous state, never assume "offline"
- [ ] Trigger the announcement only on the offline -> online transition
- [ ] Persist `lastAnnouncedStreamId` in a small JSON file so a bot restart (PM2) during a stream doesn't announce again
- [ ] Cooldown: if the stream drops and comes back within a few minutes, don't send a new `@everyone`

### Announcement
- [ ] Send the message with `@everyone` to the live channel
  - [ ] Use `allowedMentions: { parse: ['everyone'] }` and give the bot the "Mention @everyone" permission
- [ ] Embed with stream title (linked to `https://twitch.tv/<user_login>`), game, thumbnail and start time
  - [ ] Replace `{width}x{height}` in `thumbnail_url` (e.g. 1280x720) and add `?t=<timestamp>` so Discord doesn't show a cached image
  - [ ] Optional: game box art via `/api/twitch/games?id=<game_id>` and channel avatar via `/api/profile` (cache both)
- [ ] Edit the message ~60 s after sending to refresh thumbnail, title and game
- [ ] (Optional) Edit the message when the stream ends ("Stream ended")

## Spotify integration

### Setup
- [ ] `.env` config: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN`, `SPOTIFY_REDIRECT_URI`
- [ ] One-time script to obtain the refresh token (Authorization Code flow)
  - [ ] Request scopes: `user-read-currently-playing`, `user-read-playback-state`, `user-modify-playback-state`, `playlist-read-private`, `playlist-read-collaborative`
- [ ] Auto-refresh the access token when it expires (save the new refresh token if Spotify returns one)
- [ ] Handle `429` responses using the `Retry-After` header
- [ ] Document the setup in the README (create Spotify app, run script, fill `.env`)
  - [ ] Note that the app owner needs Spotify Premium

### Now playing
- [ ] Discord presence synced with Spotify
  - [ ] Poll `currently-playing` every ~10-15 s (a `204` means nothing is playing)
  - [ ] Treat `is_playing: false` (paused) like "nothing playing"
  - [ ] Set the bot activity to `Listening to <title> - <artist>`
  - [ ] Only update the presence when the track changes (avoid rate limits)
  - [ ] Clear the activity (or set a default status) when nothing is playing
  - [ ] Optional `ENABLE_SPOTIFY_PRESENCE=true` in `.env`
  - [ ] Keep the last polled state in memory and reuse it for `/nowplaying`
- [ ] `/nowplaying`: show the song currently playing on the configured account
  - [ ] Embed with title, artist, album cover and progress
  - [ ] Handle "nothing playing" case

### Playlists
- [ ] `/playlist share <playlist>`: share one of the configured account's playlists in the channel
  - [ ] Embed with name, cover, track count and link
- [ ] Autocomplete for playlist names

### Queue
- [ ] `/queue add <song>`: search and add a song to the queue (needs an active Spotify device)
  - [ ] Autocomplete with search results
- [ ] `/queue remove <song>`: ⚠️ not supported by the Spotify API; needs a bot-managed queue, or drop it
- [ ] `/queue show`: display the current queue
- [ ] Restrict queue commands to the owner via `OWNER_DISCORD_ID` in `.env`