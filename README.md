# duckdoc-jsoner

[![NPM version](https://img.shields.io/npm/v/duckdoc-jsoner.svg?style=flat-square)](https://npmjs.org/package/duckdoc-jsoner)

create `.json` file for [duckdoc](https://github.com/popodidi/duckdoc) to generate api doc.

## install
```
$ npm install --save-dev duckdoc-jsoner
```

## Basic Usage

### create with javscript object

```javascript
var jsoner = require('duckdoc-jsoner');
let api = {
  "method": "GET",
  "url": "https://localhost:8000/captcha",
  "req": {
    "body": {
      "email": "",
      "tel": "+886912810026",
      "deviceUUID": "D54EK21R-32JE71M-QM3N9-DDIOS-A1T56-55D6A6"
    }
  },
  "res": {
    "status": {
      "code": 200,
      "message": "OK",
    },
    "body": {
      "message": "Save captcha success."
    }
  }
};

jsoner.outputPath = path.join(__dirname, './duckdoc/json');
jsoner.createFromAPI(api);
```

### options
```javascript
// ...

let options = {
  endpointName: "User register",
  pathParams: "/user/:id"
};
jsoner.createFromAPI(api, options);
```

As the jsoner is designed to be integrated within the testing process, the concept is to load `api` from realistic http request. The manually added informations are specified in `options`.


## Using with [request](https://www.npmjs.com/package/request)

```javascript
var jsoner = require('duckdoc-jsoner');
jsoner.ouputPath = "path/to/output/folder";

request(options, function (error, response, body) {
  jsoner.createFromResponse('GET Test', '/test', response, body);
});
```

### properties
- `jsoner.outputPath`: `.json` file output path
- `jsoner.createFromAPI(api, options)`
- `jsoner.createFromResponse(endpointName, endpointPathParam, response, body)`