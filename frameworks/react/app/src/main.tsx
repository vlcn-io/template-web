import wasmUrl from '@vlcn.io/wa-crsqlite/crsqlite.wasm?url';
import sqliteWasm, { SQLite3 } from '@vlcn.io/wa-crsqlite';

async function main() {
  const sqlite = await sqliteWasm((_file) => wasmUrl);

  // TODO:
  // check for:
  // - URL encoded DB
  // - existing DBs on the device
}

main();
