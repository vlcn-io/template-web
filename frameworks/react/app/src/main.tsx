import wasmUrl from '@vlcn.io/wa-crsqlite/crsqlite.wasm?url';
import sqliteWasm, { SQLite3 } from '@vlcn.io/wa-crsqlite';
import schema from 'template-web-shared/schemas/template-web-schema.sql?raw';
import deviceWorkspaces from './deviceWorkspaces';
import startSync from '@vlcn.io/client-websocket';
import tblrx from '@vlcn.io/rx-tbl';

async function main() {
  const sqlite = await sqliteWasm((_file) => wasmUrl);

  // Figure what database you'd like to open.
  // Why does this matter? The name of the DB you open will also be
  // the name of the DB that is synced with on the backend.
  //
  // You can do a few things depending on your use case:
  // 1. Authenticate the user and have the server return the name of their user DB.
  // 2. Pull the DB name from a URL so the user can share a link to a specific DB.
  // 3. Use the name of the last DB the user was using -- although you need to sync that to
  // their other devices in a side-channel.
  // 4. whatever you want!
  //
  // What we're doing here:
  // - Pulling the DB name from the URL if it's there.
  // - Otherwise, we'll use the name of the last DB the user was using on _this device_
  //
  // If the user wants to share their DB with themselves on another device, they can
  // just copy the URL and paste it into the other device's browser. Or bookmark it and sync their bookmarks.
  //
  // Another option is a "meta db" for the user which contains a list of all their DBs.
  // And sync this meta-db by tieing it to the user id or name.
  //
  // In the future we'll support multi-tenancy and users receiving all rows from all users
  // that have shared something with them.
  //
  // Currently a "file model" (each DB represents some sharable unit) or "user db model" (each user has a single DB)
  // are both supported.
  const requestedDB = new URLSearchParams(window.location.search).get('workspace');
  let dbToOpen: string;

  if (requestedDB != null) {
    dbToOpen = requestedDB;
  } else {
    if (deviceWorkspaces.lastWorkspace == null) {
      dbToOpen = crypto.randomUUID();
    } else {
      dbToOpen = deviceWorkspaces.lastWorkspace;
    }
  }

  // Open the DB
  const db = await sqlite.open(dbToOpen);
  await db.exec(schema);
  // Record the DB as being opened on this device
  // So we can open it again next time or purge it from local storage in the future.
  deviceWorkspaces.add(dbToOpen);

  // Wire up reactivity and sync.
  const rx = tblrx(db);
  const sync = await startSync(getConnString(), {
    localDb: db,
    remoteDbId: dbToOpen,
    create: {
      schemaName: 'todo-mvc',
    },
    rx,
    worker: true,
  });

  // Update the URI to include the DB name.
  // For easier sharing.
  if (requestedDB == null) {
    window.history.pushState({}, '', `?workspace=${dbToOpen}`);
  }

  const ctx = {
    db,
    rx,
  };

  // now mount or app!
}

function getConnString() {
  if (import.meta.env.DEV) {
    return `ws://${window.location.hostname}:8080/sync`;
  } else {
    return `wss://${window.location.hostname}/sync`;
  }
}

main();
