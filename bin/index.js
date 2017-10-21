'use strict'

const fs = require('fs');
const path = require('path');
const parse = require('dotenv').parse;

if (!module.parent) {
  runFromCli();
}

function generate(o) {
  // set up options
  o = o || {}
  const options = {
    outFile: o.outFile || 'config.js',
    readFile: o.readFile || '.env',
    whitelist: o.whitelist && o.whitelist.length ? o.whitelist : false,
    json: path.extname(o.outFile || 'config.js').toUpperCase() === '.JSON',
  };

  // read values from .env file
  let valuesFromFile = {};
  if (fs.existsSync(options.readFile)) {
    valuesFromFile = parse(fs.readFileSync(options.readFile));
  }

  // delete the previous output file if it exists
  if (fs.existsSync(options.outFile)) {
    fs.unlinkSync(options.outFile);
  }
  if (!options.json) {
    fs.appendFileSync(options.outFile, 'module.exports = ');
  }

  const result = valuesFromFile;
  if (options.whitelist && Array.isArray(options.whitelist)) {
    options.whitelist.forEach(prop => {
      if (process.env[prop]) {
        result[prop] = process.env[prop];
      }
    });
  }

  fs.appendFileSync(options.outFile, JSON.stringify(result));
}

function runFromCli() {
  const argv = require('minimist')(process.argv.slice(2));
  const options = {
    outFile: argv.o || argv.outFile,
    readFile: argv.f || argv.readFile,
    whitelist: argv._,
  };
  generate(options);
}

module.exports = {
  generate,
};