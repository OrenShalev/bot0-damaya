const fs = require(`fs`);

function read(file) {
  return JSON.parse(fs.readFileSync(file));
}
function write(file, json) {
  fs.writeFileSync(file, JSON.stringify(json, ' ', 4), { encoding: `utf8` });
}

module.exports = { read, write };