# browser-env-vars
Enable configuring your frontend application with environment variables. Reads from environment variables and/or an .env file and produces a file that you can import into your frontend application.

[![BuildStatus](https://img.shields.io/travis/motdotla/dotenv/master.svg?style=flat-square)](https://travis-ci.org/amygdaloideum/browser-env-vars)
[![NPM version](https://img.shields.io/npm/v/dotenv.svg?style=flat-square)](https://www.npmjs.com/package/browser-env-vars)
## Install

```bash
npm install dotenv --save
```
## Usage
This script will read the variable `ENDPOINT_URL` the environment:
```js
var generateConfig = require('browser-env-vars').generate;

var options = {
    outFile: 'src/config.js',
    whitelist: ['ENDPOINT_URL'],
};

generateConfig();
```
and produces the following file:
```js
/* src/config.js */
module.exports = {
  "ENDPOINT_URL": "http://some.where.com/api"
}
```
You can then proceed and import the file in your frontend application:
```js
import config from './config.js';
console.log(config.ENDPOINT_URL); // 'http://some.where.com/api'
```
the script will also load values from a `.env` file int the project root if present [dotenv-style](https://www.npmjs.com/package/dotenv) (duplicate values in the environment will always have precedence):
```
# API
ENDPOINT_URL=http://some.where.com/api

# FACEBOOK AUTH
PUBLIC_KEY="as123asd7787tasduy#"
```

## Options
#### outFile
Default: `config.js`

Path to the file that should be produced by the script. Produces a json file instead of a module if the path has a `.json` extension.
```js
require('browser-env-vars').generate({outFile: 'src/config.js'})
```

#### readFile
Default: `.env`

Optional file containing key/values. See usage example. For more information regarding this file see the  [dotenv docs](https://www.npmjs.com/package/dotenv#rules).
```js
require('browser-env-vars').generate({readFile: 'path/to/my/file/.env'})
```

#### whitelist

An array containing the names of the variables you wish to be read from the environment.
```js
require('browser-env-vars').generate({whitelist: ['ENV_VAR_1', 'ENV_VAR_2']})
```

#### esm

If set to true, the module produced will have ES6 syntax. E.g. `export default` instead of `module.exports =`
```js
require('browser-env-vars').generate({esm: true})
```

## Contribute
Any suggestions or contributions to this package are welcome at [github](https://github.com/amygdaloideum/browser-env-vars).