# Sargam Lab

A browser-based local music player built with HTML, CSS, and vanilla JavaScript.

## Features

- Browse music by folder and play local audio files.
- Play, pause, skip tracks, seek, and adjust volume.
- Admin page for adding and removing demo listener accounts.
- Responsive interface with standalone admin styling and scripts.

## Run locally

From this directory, run `npm install` once and then `npm run dev`. Use
`npm run build` to create the production app in `dist`. Select **Open Folder**
in the player to load music from your device.

## Demo logins

- Listener: `user` / `user`
- Admin: `admin` / `admin`

## Notes

This is a static front-end demo with no backend or database. Demo account
records are stored in browser `localStorage`; credentials are not secure and
should not be reused or used for private data. Imported music folders are
loaded locally and need to be selected again after refreshing the page.
