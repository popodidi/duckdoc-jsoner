# duckdoc-jsoner

[![NPM version](https://img.shields.io/npm/v/duckdoc-jsoner.svg?style=flat-square)](https://npmjs.org/package/duckdoc-jsoner)

create `.json` file for [duckdoc](https://github.com/popodidi/duckdoc) to generate api doc.

## install
```
$ npm install --save-dev duckdoc-jsoner
```

## Usage

### using with [request](https://www.npmjs.com/package/request)

```js
var jsoner = require('duckdoc-jsoner').default;

jsoner.ouputPath = "path/to/output/folder";

request(options, function (error, response, body) {
  jsoner.ouputPath = path.join(__dirname, '../../test_doc/json');
  jsoner.createFromResponse('GET Test', '/test', response, body);
});
```

### properties
- `jsoner.outputPath`: `.json` file output path

- `jsoner.createFromResponse(endpointName, endpointPathParam, response, body)`