// Makes sure db.json exists before json-server starts.
// db.json is git-ignored (it holds each developer's own test data), so a fresh clone
// doesn't have one: this creates it from db.seed.json, which is committed.
const fs = require('fs');

if (!fs.existsSync('db.json')) {
  fs.copyFileSync('db.seed.json', 'db.json');
  console.log('Created db.json from db.seed.json');
}
