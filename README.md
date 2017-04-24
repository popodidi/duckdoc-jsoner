# duckdoc-jsoner

[![NPM version](https://img.shields.io/npm/v/duckdoc-jsoner.svg?style=flat-square)](https://npmjs.org/package/duckdoc-jsoner)

Integrating duckdoc-jsoner within the testing process and prepares `.json` files of each endpoint based on tests of each endpoint. [duckdoc][duckdoc] then parses those files and renders to static document sites (i.e., `.html`).

## compatibility

duckdoc | duckdoc-jsoner
--- | ---
0.10.x | 0.7.x
0.11.x | 0.8.x

## install
```
$ npm install --save-dev duckdoc-jsoner
```

## Endpoint && Task

### definition

- Endpoint: ONE url with ONE http method, ex. `GET` `http://example.com/api/user`
- Task: making ONE request to an Endpoint, containing the information of request and response.

### example
```js
let path = require('path');
let jsoner, { Task, Endpoint } = require('duckdoc-jsoner');
// let Endpoint = require('duckdoc-jsoner').Endpoint;
jsoner.outputPath = path.join(__dirname, './duckdoc/json');

let endpoint = new Endpoint("Get customer info.", "/customer");
// Endpiont.contructor(endpointName, pathParams)

let task = Task.createFromRequest(response, response.body);
endpoint.tasks.push(task);

jsoner.createEndpoint(endpoint);

```

### `task.options`
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
### properties

#### jsoner
- `jsoner.outputPath`: `.json` file output path
- `jsoner.createEndpoint(endpoint)`: create `.json` of `endpoint`

#### Endpoint
- `Endpoint.endpointName`: name of the endpoint
- `Endpoint.pathParms`: path parameters, ex. `/user/:id`
- `Endpoint.tasks`: an Array of `Task` objects

#### Task
- `Task.createFromRequest(response, body)`: return `Task` object generated from response of [request][request]
- `Task.createFromAxios(response)`
- `task.options`
	- `name`: endpoint name with `{StatusCode}` keyword
	- `description`: endpoint description
	- `(req/res).(headers/body)`:
		- description: `Object`, external description of each field
		- optionalParams: `Array`, specification optional fields

> `jsoner` parses the first item of an array to get a sense of the data format. Use `__first.item` to indicate the items of array.

As the jsoner is designed to be integrated within the testing process, the concept is to load `req/res` from realistic http request. The manually added informations are specified in `options`.

----
## deprecated usage

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


## Using with [request][request] or [request-promise](https://www.npmjs.com/package/request-promise)

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

[duckdoc]: https://github.com/popodidi/duckdoc
[request]: https://www.npmjs.com/package/request
[axios]: https://github.com/mzabriskie/axios