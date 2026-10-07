import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-600.css';
import '@fontsource/dm-sans/latin-700.css';
import '@fontsource/manrope/latin-500.css';
import '@fontsource/manrope/latin-600.css';
import '@fontsource/manrope/latin-700.css';
import '@fontsource/manrope/latin-800.css';
// Bengali instructions need real Bengali glyph metrics; DM Sans and Manrope have none.
import '@fontsource/noto-sans-bengali/bengali-400.css';
import '@fontsource/noto-sans-bengali/bengali-500.css';
import '@fontsource/noto-sans-bengali/bengali-700.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './auth/AuthProvider';
import { App } from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js')
      // Phones otherwise keep the previous shell until the browser feels like
      // polling, which is how a fixed screen stays "broken" after a deploy.
      .then((registration) => void registration.update().catch(() => undefined))
      .catch((error: unknown) => {
        console.warn('Orbit could not register its offline app shell.', error);
      });
  });
}
