'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Created by Rubyxiao on 2017/4/20.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Endpoint = function () {
  function Endpoint(endpointName, pathParams) {
    _classCallCheck(this, Endpoint);

    if (_lodash2.default.isUndefined(endpointName) || _lodash2.default.isUndefined(pathParams)) {
      throw new Error("endpointName and pathParams are required.");
    }

    if (!_lodash2.default.isString(endpointName) || !_lodash2.default.isString(pathParams)) {
      throw new Error("endpointName and pathParams must be a String.");
    }

    this.endpointName = endpointName;
    this.pathParams = pathParams;
    this.tasks = [];
    this.method = null;
  }

  _createClass(Endpoint, [{
    key: '_checkMethod',
    value: function _checkMethod(tasks) {
      var method = [];
      _lodash2.default.forEach(tasks, function (v, k) {
        method.push(v.method);
      });
      if (_lodash2.default.uniq(method).length > 1) {
        console.log('Task methods: ', method);
        throw new Error("Tasks method is not same!!");
      } else {
        return true;
      } //end if
    }
  }, {
    key: '_createEndpointJson',
    value: function _createEndpointJson() {
      if (this._checkMethod(this.tasks)) {
        var first = _lodash2.default.head(this.tasks);
        this.api = {
          method: first.method,
          url: first.url,
          tasks: this.tasks
        };
        this.endpointOption = {
          endpointName: this.endpointName,
          pathParams: this.pathParams
        };
      } //end if
    }
  }]);

  return Endpoint;
}();

exports.default = Endpoint;
module.exports = exports['default'];