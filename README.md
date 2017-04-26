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
  "url": "https://localhost:8000/register",
  "req": {
    "headers": {
      "content-type": "application/json"
    },
    "body": {
      "email": "xxx@xxx.xxx",
      "tel": "xxxxxxx",
      "deviceUUID": "xxxx-xxx-xxx",
      "isAnArray": [
        {
          "name": "user name"
        }//, {...}, {...}
      ]
    }
  },
  "res": {
    "status": {
      "code": 200,
      "message": "OK",
    },
    "body": {
      "message": "Register success."
    },
    "headers": {
      "content-type": "image/png"
    },
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
  pathParams: "/user/:id",
  req: {
    body: {
      description: {
        email: "user email",
        "isAnArray.__first_item.name": "name description"
      },
      optionalParams: [
        "deviceUUID",  // optional parameter
        "isAnArray.__first_item.name"
      ]
    }
  },
  res: {
    body: {
      // same as req.body
    }
  }
};

jsoner.createFromAPI(api, options);
```

> use `__first.item` to indicate the items of array.

As the jsoner is designed to be integrated within the testing process, the concept is to load `api` from realistic http request. The manually added informations are specified in `options`.


## Using with [request](https://www.npmjs.com/package/request) or [request-promise](https://www.npmjs.com/package/request-promise)

```javascript
var jsoner = require('duckdoc-jsoner');
jsoner.ouputPath = "path/to/output/folder";

request(options, function (error, response, body) {
  let opt = {
    endpointName :'GET Test', 
    pathParams: '/test'
  };
  jsoner.createFromResponse(response, body, opt);
});

// options: resolveWithFullResponse: true
rq(options).then(function (response) {
  jsoner.createFromResponse(response, response.body);
});

```

### properties
- `jsoner.outputPath`: `.json` file output path
- `jsoner.createFromAPI(api, options)`
- `jsoner.createFromResponse(response, body, options)`

## Endpoint && Task
```js
let jsoner,{Task,Endpoint} = require('duckdoc-jsoner');
// let Endpoint = require('duckdoc-jsoner').Endpoint;

let endpoint = new Endpoint("Get customer info.", "/customer");
let task = Task.createFromRequest();
endpoint.tasks.push(task);

jsoner.createEndpoint(endpoint);

```

### properties
- `Task.createFromRequest(response, body)`
- `Task.createFromAxios(response)`
- `task.options`
```js
let task = Task.createFromRequest(response, response.body);
task.options = {
  name: "Success({StatusCode})",
  description: "success situation",
  req: {
    body: {
      description: {
        email: "user email",
        "isAnArray.__first_item.name": "name description"
      },
      optionalParams: [
        "deviceUUID",  // optional parameter
        "isAnArray.__first_item.name"
      ],
    }
  },
  res: {
    body: {
        // same as req.body
    }
  }
};
```