import path from 'path';
import Jsoner from '../src/Jsoner';

let jsoner = new Jsoner("output/path");
let api = {
  method: "POST",
  url: "url/:id",
  example_url: "http://url/123",
  req: {
    headers: {
      Authorization: "Bearer token"
    },
    body: {
      para: "hello"
    }
  },
  res: {
    status:{
      code: 200,
      message: "OK"
    },
    body: {
      para: "hi"
    }
  }
}

jsoner.ouputPath = path.join(__dirname, '../duckdoc/json');
jsoner.createApiJson(api)