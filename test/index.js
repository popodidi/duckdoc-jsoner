import jsoner from '../src/index';
import path from 'path';
// let jsoner = require('../build/index');
let api = {
  "method": "POST",
  "url": "/captcha",
  "example_url": "https://localhost:8000/captcha",
  "req": {
    "headers": {
      "content-type": "application/json"
    },
    "body": {
      "email": "",
      "tel": "+886912810026",
      "deviceUUID": "D54EK21R-32JE71M-QM3N9-DDIOS-A1T56-55D6A6"
    }
  },
  "res": {
    "status": {
      "code": 200,
      "message": "OK"
    },
    "body": {
      "message": "Save captcha success."
    }
  }
};

//用request可抓到值
let api_test = {
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

//要自己手寫的
let options_example = {
  endpointName: "User register",
  pathParams: "/user/:id"

};

// console.log(path.join(__dirname, './duckdoc/json'));
jsoner.outputPath = path.join(__dirname, './duckdoc/json');
jsoner.createFromAPI(api_test);