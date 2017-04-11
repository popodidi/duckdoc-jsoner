import jsoner from '../src/index';
import path from 'path';
// let jsoner = require('../build/index');
let api = {
  "method": "GET",
  "url": "https://localhost:8000/register",
  "req": {
    "body": {
      "email": "xxx@xxx.xxx",
      "tel": "xxxxxxx",
      "deviceUUID": "xxxx-xxx-xxx"
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

//要自己手寫的
let options_example = {
  endpointName: "User register",
  pathParams: "/user/:id"

};

// console.log(path.join(__dirname, './duckdoc/json'));
jsoner.outputPath = path.join(__dirname, './duckdoc/json');
jsoner.createFromAPI(api, options_example);