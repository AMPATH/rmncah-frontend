// Makes sure db.json exists before json-server starts.
// db.json is git-ignored (it holds each developer's own test data), so a fresh clone
// doesn't have one: this creates it from db.seed.json, which is committed.
const fs = require('fs');

if (!fs.existsSync('db.json')) {
  fs.copyFileSync('db.seed.json', 'db.json');
  console.log('Created db.json from db.seed.json');
}

const seed = JSON.parse(fs.readFileSync('db.seed.json', 'utf8'));
const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));
const missing = Object.keys(seed).filter((key) => db[key] === undefined);
if (missing.length > 0) {
  for (const key of missing) db[key] = seed[key];
  fs.writeFileSync('db.json', JSON.stringify(db, null, 2) + '\n');
  console.log('Added to db.json from db.seed.json: ' + missing.join(', '));
}
