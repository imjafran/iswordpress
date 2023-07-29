const fs = require('fs');
const path = require('path');

// read output.json 
const output = fs.readFileSync(path.resolve(__dirname, './output.json'), 'utf8');

console.log(output.length);