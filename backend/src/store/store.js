const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, 'data.json');

function read() {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

function write(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = { read, write };
