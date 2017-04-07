## Usage

`jsoner.outputPath`
> `json`檔案輸出的路徑

`jsoner.createFromResponse(endpointName, endpointPathParam, response, body)`
> `response`為`npm project request`,`request(options, function (error, response, body) {})`的`response`

- example
```js
request(options, function (error, response, body) {
  jsoner.ouputPath = path.join(__dirname, '../../test_doc/json');
  jsoner.createFromResponse('GET Test', '/test', response, body);
});
```

- request
https://www.npmjs.com/package/request