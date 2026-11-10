// ─────────────────────────────────────────────────────────────────────────────
//  MUSIC on the desk's speaker (/desk/#music). Spotify's free embedded player:
//  no account, key or login needed to run it. Visitors logged in to Spotify in
//  their browser hear full songs; everyone else hears 30-second previews.
//
//  `picks` are the buttons in the player. Paste the share link of any Spotify
//  playlist, album, song, artist or podcast (Share → Copy link).
//  TODO: swap the starters (Spotify's own playlists) for your playlists.
// ─────────────────────────────────────────────────────────────────────────────
export const music = {
  picks: [
    { label: 'Deep Focus', url: 'https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ' },
    { label: 'Lofi beats', url: 'https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn' },
    { label: 'Peaceful Piano', url: 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO' },
    { label: 'Today’s Top Hits', url: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M' },
  ],
  // true while the picks are Spotify's starters, so the player says so
  starters: true,
};
