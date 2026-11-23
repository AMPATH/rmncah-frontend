// Makes sure mpdsrdb.json exists before json-server starts.
// mpdsrdb.json is git-ignored (it holds each developer's own test data), so a fresh clone
// doesn't have one: this creates it from db.seed.json, which is committed.
const fs = require('fs');

const DB = 'mpdsrdb.json';
const OLD_DB = 'db.json';
const SEED = 'db.seed.json';

if (!fs.existsSync(DB) && fs.existsSync(OLD_DB)) {
  fs.renameSync(OLD_DB, DB);
  console.log(`Renamed ${OLD_DB} to ${DB}`);
}

if (!fs.existsSync(DB)) {
  fs.copyFileSync(SEED, DB);
  console.log(`Created ${DB} from ${SEED}`);
}

const seed = JSON.parse(fs.readFileSync(SEED, 'utf8'));
const db = JSON.parse(fs.readFileSync(DB, 'utf8'));
const missing = Object.keys(seed).filter((key) => db[key] === undefined);
if (missing.length > 0) {
  for (const key of missing) db[key] = seed[key];
  fs.writeFileSync(DB, JSON.stringify(db, null, 2) + '\n');
  console.log(`Added to ${DB} from ${SEED}: ` + missing.join(', '));
}
