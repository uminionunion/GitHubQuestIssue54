{/*
  File: /client/src/main.tsx
  Folder: /client/src

  Purpose:
  This is the main entry point for the React application's JavaScript. It's the file that gets
  referenced by `index.html`. Its primary job is to render the root React component (`App`)
  into the DOM element with the ID `root`. It also imports global CSS files (`index.css` and `leaflet.css`)
  so that their styles are applied to the entire application.

  Connections:
  - `client/index.html`: This file is the script target for the `<script>` tag in `index.html`.
  - `./App`: Imports and renders the root `App` component.
  - `./index.css`: Imports the global stylesheet for the application, including Tailwind CSS and custom styles.
  - `leaflet/dist/leaflet.css`: Imports the necessary CSS for the Leaflet map library.

  PHP/HTML/CSS/JS/SQL Equivalent:
  - This file is the modern equivalent of the main `<script>` tag at the bottom of an `index.html` page.
  - JS: In a traditional setup, you might have a `main.js` or `app.js` file that contains an `init()` function. This function would be called on page load (`window.onload`) to set up event listeners, initialize libraries (like a map), and perform initial AJAX requests. This file serves that same "kick-off" purpose for the React application.
*/}
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';

import './index.css';
import 'leaflet/dist/leaflet.css';

// Always apply dark theme
document.documentElement.classList.add('dark');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
{/*
  Connections Summary:
  - line 19: import App from './App'; -> Connects to `client/src/App.tsx`.
  - line 21: import './index.css'; -> Connects to `client/src/index.css`.
  - line 26: ReactDOM.createRoot(document.getElementById('root')!) -> Mounts the React app into the `<div id="root">` in `client/index.html`.
*/}
