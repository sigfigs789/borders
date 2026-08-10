// Inject Leaflet CSS via a link tag (Metro web doesn't process raw CSS imports)
if (typeof document !== 'undefined') {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(link);

  // Center the app and cap its width on desktop
  const style = document.createElement('style');
  style.textContent = `
    html, body, #root { height: 100%; margin: 0; background: #0f0f1a; }
    #root > div { max-width: 480px; margin: 0 auto; min-height: 100%; box-shadow: 0 0 60px rgba(0,0,0,0.5); }
  `;
  document.head.appendChild(style);
}

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
