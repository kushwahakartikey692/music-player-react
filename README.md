# Sargam Lab

A responsive local music player built with React, HTML, CSS, JavaScript,
Bootstrap utilities, and Vite. The app runs entirely in the browser.

## Features

- Browse music by folder and play local audio files.
- Play, pause, skip tracks, seek, and adjust volume.
- Navigate between the folder library and individual track lists.
- Listener signup requests that require admin approval before login.
- Admin page for approving signup requests and managing listener accounts.
- Responsive interface with a standalone admin page.

## Front-end structure

- `main.jsx` mounts the React application and imports Bootstrap and custom CSS.
- `App.jsx` contains reusable React components for login, navigation, folders,
  track lists, and the player.
- `style.css` provides the custom visual design and responsive breakpoints.

## Run locally

From this directory, run `npm install` once and then `npm run dev`. Use
`npm run build` to create the production app in `dist`. Select **Open Folder**
in the player to load music from your device.

## Demo logins

- Listener: `user` / `user`
- Admin: `admin` / `admin`

## Signup approval

Listeners can submit an account request from the **Sign up** tab. An admin
signs in at **Admin login** and approves the request before those credentials
can be used to log in.

## Notes

This is a front-end demo with no backend or database. Demo account records are
stored in browser `localStorage`; credentials are not secure and should not be
reused or used for private data. Imported music folders are loaded locally and
need to be selected again after refreshing the page. Signup requests and their
approval status are also stored in browser `localStorage`, so they are only
shared in the same browser profile and are not secure against browser-storage
tampering. The admin page is a separate static front-end page using the same
browser storage.
