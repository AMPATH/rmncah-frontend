import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { App } from '@tinyhttp/app';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { watch } from 'chokidar';

import { createApp } from 'json-server/lib/app.js';
import { NormalizedAdapter } from 'json-server/lib/adapters/normalized-adapter.js';
import { Observer } from 'json-server/lib/adapters/observer.js';

const PORT = 3001;

async function createDatabase(fileName) {
  const filePath = resolve(process.cwd(), fileName);

  if (!existsSync(filePath)) {
    throw new Error(
      `Database file "${fileName}" does not exist. Refusing to create or replace it automatically.`,
    );
  }

  let writing = false;

  const observer = new Observer(
    new NormalizedAdapter(new JSONFile(filePath)),
  );

  const db = new Low(observer, {});

  observer.onWriteStart = () => {
    writing = true;
  };

  observer.onWriteEnd = () => {
    writing = false;
  };

  await db.read();

  if (db.data === null || typeof db.data !== 'object') {
    throw new Error(`Database "${fileName}" did not load a valid JSON object.`);
  }

  let fileWatcher;

  if (process.env.NODE_ENV !== 'production') {
    fileWatcher = watch(filePath);

    fileWatcher.on('change', () => {
      if (!writing) {
        db.read().catch((error) => {
          console.error(`Error reloading ${fileName}:`, error);
        });
      }
    });
  }

  return { db, fileName, fileWatcher };
}

async function startServer() {
  const mpdsr = await createDatabase('mpdsrdb.json');
  const emonc = await createDatabase('emoncdb.json');

  const mpdsrApp = createApp(mpdsr.db);
  const emoncApp = createApp(emonc.db);

  const app = new App();

  app.get('/', (_req, res) => {
    res.json({
      name: 'AMPATH API',
      port: PORT,
      databases: {
        mpdsr: '/api',
        emonc: '/emonc-api',
      },
    });
  });

  // Existing programme API — db.json
  app.use('/api', mpdsrApp);

  // Dedicated EmONC curriculum API — emoncdb.json
  app.use('/emonc-api', emoncApp);

  const server = app.listen(PORT, () => {
    console.log(`AMPATH API listening on port ${PORT}`);
    console.log('MPDSR and other programme data: /api/*');
    console.log('EmONC curriculum data: /emonc-api/*');
    console.log('Both databases are loaded independently.');
  });

  const shutdown = async () => {
    await Promise.all([
      mpdsr.fileWatcher?.close(),
      emonc.fileWatcher?.close(),
    ]);

    server.close(() => process.exit(0));
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

startServer().catch((error) => {
  console.error('Failed to start AMPATH API:', error);
  process.exit(1);
});
