import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * On Windows, antivirus or indexing can briefly lock a folder while a file is
 * saved, which makes the file watcher emit EBUSY/EPERM. Without a listener that
 * error crashes the dev server, so we log it and keep running.
 */
const tolerantWatcher = {
  name: 'tolerant-watcher',
  configureServer(server) {
    server.watcher.on('error', (err) => {
      server.config.logger.warn(`[watcher] ${err.code || ''} ${err.message} — continuing`);
    });
  },
};

export default defineConfig({
  plugins: [react(), tolerantWatcher],
  server: { port: 5173 },
});
