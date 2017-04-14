'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _filenamify = require('filenamify');

var _filenamify2 = _interopRequireDefault(_filenamify);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _tv = require('tv4');

var _tv2 = _interopRequireDefault(_tv);

var _schema = require('./schema/schema');

var _schema2 = _interopRequireDefault(_schema);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Jsoner = function () {
  function Jsoner(outputPath) {
    _classCallCheck(this, Jsoner);

    this.outputPath = outputPath;
  }

  _createClass(Jsoner, [{
    key: '_mkdirIfNecessary',
    value: function _mkdirIfNecessary() {
      this.outputPath.split('/').forEach(function (dir, index, splits) {
        var parent = splits.slice(0, index).join('/');
        var dirPath = _path2.default.resolve(parent, dir);
        if (!_fs2.default.existsSync(dirPath)) {
          _fs2.default.mkdirSync(dirPath);
        }
      });
    }
  }, {
    key: '_createApiJson',
    value: function _createApiJson(api) {
      try {
        var fileName = api.method + '_' + (0, _filenamify2.default)(api.pathParams, { replacement: '+' });
        var filePath = _path2.default.join(this.outputPath, fileName + '.json');
        this._mkdirIfNecessary();
        _fs2.default.writeFileSync(filePath, JSON.stringify(api));
        console.log(_chalk2.default.green.bold("  Create: ") + _chalk2.default.blue(filePath));
      } catch (e) {
        console.log(e);
      }
    }
  }, {
    key: '_syntaxHighlight',
    value: function _syntaxHighlight(json) {
      json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'json-number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            // cls = 'json-key';
            return '<span class="json-key">' + match.slice(0, -1) + '</span>:';
          } else {
            cls = 'json-string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'json-boolean';
        } else if (/null/.test(match)) {
          cls = 'json-null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
      });
    }
  }, {
    key: '_replaceDot',
    value: function _replaceDot(string) {
      var arr = string.split('.');
      arr = _lodash2.default.map(arr, function (str, i) {
        return (i == 0 ? "" : '<br/>') + (i == 0 ? "" : _lodash2.default.repeat("&nbsp", (i - 1) * 4) + "└&nbsp") + str;
      });
      return _lodash2.default.reduce(arr, function (pre, str) {
        return pre + str;
      }, "");
    }
  }, {
    key: '_sortBodyValue',
    value: function _sortBodyValue(body, key, sortData) {
      var _this = this;

      var objectKey = "";

      if (!_lodash2.default.isUndefined(_lodash2.default.get(body, 'data'))) {
        if (!_lodash2.default.isNull(key)) {
          objectKey += key + '.' + "data";
        } else {
          objectKey = "data";
        }
        this._sortBodyValue.bind(this)(body.data, objectKey, sortData);
        return;
      }

      if (_lodash2.default.isArray(body)) {
        sortData.push({
          name: key,
          type: this._typeOf(body, key),
          formatted: this._replaceDot(key)
        });

        objectKey = "";
        if (!_lodash2.default.isNull(key)) {
          objectKey += key + '.' + "__first_item";
        } else {
          objectKey = "__first_item";
        }
        var firstObject = _lodash2.default.head(body);
        this._sortBodyValue.bind(this)(firstObject, objectKey, sortData);
        return;
      }

      if (_lodash2.default.isObject(body)) {
        _lodash2.default.forEach(body, function (v, k) {
          objectKey = "";
          if (!_lodash2.default.isNull(key)) {
            objectKey += key + '.' + k;
          } else {
            objectKey = k.toString();
          } //end if
          _this._sortBodyValue.bind(_this)(v, objectKey, sortData);
        });
        return;
      }

      sortData.push({
        name: key,
        type: this._typeOf(body, key),
        formatted: this._replaceDot(key)
      });
    }
  }, {
    key: '_typeOf',
    value: function _typeOf(v, key) {
      var typeStr = "";
      if (_lodash2.default.isString(key)) {
        _lodash2.default.forEach(key, function (c) {
          if (c == ".") {
            typeStr += '<br/>';
          }
        });
      }
      if (_lodash2.default.isArray(v)) {
        return typeStr + "array";
      } else {
        return typeStr + (typeof v === 'undefined' ? 'undefined' : _typeof(v));
      }
    }
  }, {
    key: '_parseAPI',
    value: function _parseAPI(api, options) {
      var exportAPI = _lodash2.default.merge({}, api);

      //處理request body
      if (_lodash2.default.isObject(api.req.body)) {
        var req_body = [];
        var reqbody = api.req.body;
        this._sortBodyValue(reqbody, null, req_body);
        exportAPI.req.raw_body = JSON.stringify(reqbody, null, 2);
        exportAPI.req.body = this._syntaxHighlight(exportAPI.req.raw_body);
        exportAPI.req.bodyParams = req_body;
      } else {
        if (!_lodash2.default.isUndefined(api.req.body)) {
          exportAPI.req.raw_body = api.req.body;
          exportAPI.req.body = api.req.body;
          exportAPI.req.bodyParams = null;
        } else {
          exportAPI.req.raw_body = null;
          exportAPI.req.body = null;
          exportAPI.req.bodyParams = null;
        } //end if
      }

      //處理response body
      if (_lodash2.default.isObject(api.res.body)) {
        var res_body = [];
        this._sortBodyValue(api.res.body, null, res_body);
        exportAPI.res.raw_body = JSON.stringify(api.res.body, null, 2);
        exportAPI.res.body = this._syntaxHighlight(exportAPI.res.raw_body);
        exportAPI.res.bodyParams = res_body;
      } else {
        if (!_lodash2.default.isUndefined(api.res.body)) {
          exportAPI.res.raw_body = api.res.body;
          exportAPI.res.body = api.res.body;
          exportAPI.res.bodyParams = null;
        } else {
          exportAPI.res.raw_body = null;
          exportAPI.res.body = null;
          exportAPI.res.bodyParams = null;
        } //end if
      } //end if

      if (_lodash2.default.isObject(api.req.headers)) {
        var headers = [];
        var omit = ['accept', 'content-length'];
        _lodash2.default.forEach(_lodash2.default.omit(api.req.headers, omit), function (v, k) {
          headers.push({
            key: k,
            value: v
          });
        });
        exportAPI.req.headers = headers;
      } else {
        exportAPI.req.headers = _lodash2.default.isUndefined(api.req.headers) ? null : api.req.headers;
      } //end if

      if (_lodash2.default.isNull(options)) {
        //處理options
        var urlObject = _url2.default.parse(api.url);
        exportAPI.pathParams = urlObject.pathname;
        exportAPI.endpointName = urlObject.pathname;
        this._createApiJson(exportAPI);
      } else {
        this._parseOptions(exportAPI, options);
      } //end if
    }
  }, {
    key: '_parseOptions',
    value: function _parseOptions(api, options) {
      var API = Object.assign(api, {
        endpointName: options.endpointName,
        pathParams: options.pathParams,
        req: Object.assign(api.req, {
          bodyParams: _lodash2.default.map(api.req.bodyParams, function (o) {
            o["description"] = _lodash2.default.get(_lodash2.default.get(options, 'req.body.description'), o.name);
            var optionalParams = _lodash2.default.get(options, 'req.body.optionalParams');
            if (!_lodash2.default.isUndefined(optionalParams) && _lodash2.default.indexOf(optionalParams, o.name) >= 0) {
              o["optional"] = true;
            }
            return o;
          })
        }),
        res: Object.assign(api.res, {
          bodyParams: _lodash2.default.map(api.res.bodyParams, function (o) {
            o["description"] = _lodash2.default.get(_lodash2.default.get(options, 'res.body.description'), o.name);
            var optionalParams = _lodash2.default.get(options, 'res.body.optionalParams');
            if (!_lodash2.default.isUndefined(optionalParams) && _lodash2.default.indexOf(optionalParams, o.name) >= 0) {
              o["optional"] = true;
            }
            return o;
          })
        })
      });
      this._createApiJson(API);
    }
  }, {
    key: 'createFromAPI',
    value: function createFromAPI(api) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      var result = _tv2.default.validateMultiple(api, _schema2.default.apiSchema);
      if (result.valid) {
        this._parseAPI(api, options);
      } else {
        var err = _lodash2.default.first(result.errors);
        throw new Error(_chalk2.default.red.bold(err.message + ' : ' + err.dataPath));
      } //end if
    }
  }, {
    key: 'createFromResponse',
    value: function createFromResponse(endpointName, pathParams, res, body) {
      var api = {
        endpointName: endpointName,
        pathParams: pathParams,
        method: res.request.method,
        url: res.request.uri.href,
        // example_url: res.request.uri.href,
        req: {
          headers: res.request.headers,
          body: res.request.body
        },
        res: {
          status: {
            code: res.statusCode,
            message: res.statusMessage
          },
          body: body
        }
      };

      /*
        //處理request body
       try {
       let req_body = [];
       let reqbody = JSON.parse(res.request.body);
       this._sortBodyValue(reqbody, null, req_body);
       api.req.raw_body = JSON.stringify(JSON.parse(res.request.body), null, 2);
       api.req.body = this._syntaxHighlight(api.req.raw_body);
       api.req.bodyParams = req_body;
       } catch (e) {
       api.req.raw_body = res.request.body;
       api.req.body = res.request.body;
       api.req.bodyParams = null;
       }
        //處理response body
       body = JSON.parse(body);
       if (_.isObject(body)) {
       let res_body = [];
       this._sortBodyValue(body, null, res_body);
       api.res.raw_body = JSON.stringify(body, null, 2);
       api.res.body = this._syntaxHighlight(api.res.raw_body);
       api.res.bodyParams = res_body;
       } else {
        api.res.raw_body = body;
       api.res.body = body;
       api.res.bodyParams = null;
       }//end if
        if (_.isObject(res.request.headers)) {
       let headers = [];
       let omit = ['accept', 'content-length'];
       _.forEach(_.omit(res.request.headers, omit), (v, k) => {
       headers.push({
       key: k,
       value: v
       });
       });
       api.req.headers = headers;
       } else {
       api.req.headers = null;
       }//end if
       */

      this.createFromAPI(api);
      // this._createApiJson(api);
    }
  }]);

  return Jsoner;
}();

exports.default = Jsoner;
module.exports = exports['default'];