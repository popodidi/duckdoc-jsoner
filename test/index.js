import jsoner from '../src/index';
import path from 'path';
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

jsoner.ouputPath = path.join(__dirname, '../duckdoc/json');
// jsoner.createFromResponse(api);