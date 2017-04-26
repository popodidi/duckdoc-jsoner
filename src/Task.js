/**
 * Created by Rubyxiao on 2017/4/20.
 */
import _ from 'lodash';

class Task {

  // constructor(name, description) {
  //   this.name = name;
  //   this.description = description;
  // }

  // _parseName(name, statusCode) {
  //   let new_name;
  //   if (!_.isEmpty(name)) {
  //     new_name = name.replace("{statusCode}", statusCode);
  //   } else {
  //     new_name = name;
  //   }
  //   return new_name;
  // }


  static createFromRequest(response, body) {
    let t = new Task();

    t.method = response.request.method;
    t.url = response.request.uri.href;

    t.req = {
      headers: response.request.headers,
      body: response.request.body
    };

    t.res = {
      headers: response.headers,
      status: {
        code: response.statusCode,
        message: response.statusMessage
      },
      body: body
    };

    t.options = {};

    return t;
  }

  static createFromAxios(response) {
    let t = new Task();

    t.method = response.config.method.toUpperCase();
    t.url = response.config.url;

    t.req = {
      headers: response.config.headers,
      body: response.config.data
    };

    t.res = {
      headers: response.headers,
      status: {
        code: response.status,
        message: response.statusText
      },
      body: response.data
    };

    t.options = {};

    return t;

  }

}

export default Task;
