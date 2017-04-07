## Usage

`jsoner.outputPath`
> `json`檔案輸出的路徑

`jsoner.createFromResponse(endpointName, endpointPathParam, response, body)`
> `response`為`npm project request`,`request(options, function (error, response, body) {})`的`response`

- example
```js
jsoner.outputPath = path.join(__dirname, '../../test_doc/json');
jsoner.createFromResponse('GET Captcha', '/captcha', response, body);
```

- request
https://www.npmjs.com/package/request