'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Created by Rubyxiao on 2017/4/20.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Task = function () {
  function Task() {
    _classCallCheck(this, Task);
  }

  _createClass(Task, null, [{
    key: 'createFromRequest',


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


    value: function createFromRequest(response, body) {
      var t = new Task();

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

      return t;
    }
  }, {
    key: 'createFromAxios',
    value: function createFromAxios(response) {
      var t = new Task();

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
      return t;
    }
  }]);

  return Task;
}();

exports.default = Task;
module.exports = exports['default'];