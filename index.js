'use strict'

const fs = require('fs');

/*
 * Code from dotenv (https://github.com/motdotla/dotenv/blob/master/lib/main.js)
 * Copyright (c) 2015, Scott Motte
 * 
 * Parses a string or buffer into an object
 * @param {(string|Buffer)} src - source to be parsed
 * @returns {Object} keys and values from src
*/
function parse(src) {
  var obj = {}

  // convert Buffers before splitting into lines and processing
  src.toString().split('\n').forEach(function (line) {
    // matching "KEY' and 'VAL' in 'KEY=VAL'
    var keyValueArr = line.match(/^\s*([\w\.\-]+)\s*=\s*(.*)?\s*$/)
    // matched?
    if (keyValueArr != null) {
      var key = keyValueArr[1]

      // default undefined or missing values to empty string
      var value = keyValueArr[2] || ''

      // expand newlines in quoted values
      var len = value ? value.length : 0
      if (len > 0 && value.charAt(0) === '"' && value.charAt(len - 1) === '"') {
        value = value.replace(/\\n/gm, '\n')
      }

      // remove any surrounding quotes and extra spaces
      value = value.replace(/(^['"]|['"]$)/g, '').trim()

      obj[key] = value
    }
  })

  return obj
}

function generate(options) {
  options = options || {};
  const outFile = options.outFile || 'config.js'
  const readFile = options.readFile || '.env';
  const path = '.env';

  let valuesFromFile = {};
  if (fs.existsSync(readFile)) {
    // Read values from .env file
    valuesFromFile = parse(fs.readFileSync(readFile));
  }

  if (fs.existsSync(outFile)) {
    fs.unlinkSync(outFile);
  }
  fs.appendFileSync(outFile, 'module.exports = ');

  const result = valuesFromFile;
  if (options.whitelist && Array.isArray(options.whitelist)) {
    options.whitelist.forEach(prop => {
      if (process.env[prop]) {
        result[prop] = process.env[prop];
      }
    });
  }

  fs.appendFileSync(outFile, JSON.stringify(result));
}

module.exports = {
  generate,
};