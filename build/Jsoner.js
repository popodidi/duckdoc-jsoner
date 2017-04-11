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
      _lodash2.default.forEach(body, function (v, k) {
        if (_lodash2.default.isObject(v)) {
          if (!_lodash2.default.isNull(key)) {
            objectKey += key + '.' + k;
          } else {
            objectKey = k;
          } //end if
          sortData.push({
            name: objectKey,
            type: typeof v === 'undefined' ? 'undefined' : _typeof(v),
            formatted: _this._replaceDot(objectKey)
          });
          sortBodyValue(v, objectKey, sortData);
        } else {
          var _objectKey = "";
          if (!_lodash2.default.isNull(key)) {
            _objectKey += key + '.' + k;
          } else {
            _objectKey = k;
          } //end if
          sortData.push({
            name: _objectKey,
            type: typeof v === 'undefined' ? 'undefined' : _typeof(v),
            formatted: _this._replaceDot(_objectKey)
          });
        } //end if
      });
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
        if (_lodash2.default.isUndefined(api.res.body.data)) {
          this._sortBodyValue(api.res.body, null, res_body);
        } else if (_lodash2.default.isArray(api.res.body.data)) {
          //如果有data代表他可能是array
          var _reqbody = _lodash2.default.head(api.res.body.data);
          this._sortBodyValue(_reqbody, null, res_body);
        } //end if
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
        // exportAPI.endpointName = `${api.method} ${urlObject.pathname}`;
        // console.log(exportAPI);
        this._createApiJson(exportAPI);
      } else {
        this._parseOptions(exportAPI, options);
      } //end if
    }
  }, {
    key: '_parseOptions',
    value: function _parseOptions(api, options) {
      var API = _lodash2.default.merge(api, options);
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
    value: function createFromResponse(endpointName, path, res, body) {
      var api = {
        endpointName: endpointName,
        method: res.request.method,
        url: path,
        example_url: res.request.uri.href,
        req: {},
        res: {
          status: {
            code: res.statusCode,
            message: res.statusMessage
          }
        }
      };

      //處理request body
      try {
        var req_body = [];
        var reqbody = JSON.parse(res.request.body);
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
      if (_lodash2.default.isObject(body)) {
        var res_body = [];
        if (_lodash2.default.isUndefined(body.data)) {
          this._sortBodyValue(body, null, res_body);
        } else if (_lodash2.default.isArray(body.data)) {
          //如果有data代表他是array
          var _reqbody2 = _lodash2.default.head(body.data);
          this._sortBodyValue(_reqbody2, null, res_body);
        } //end if
        api.res.raw_body = JSON.stringify(body, null, 2);
        api.res.body = this._syntaxHighlight(api.res.raw_body);
        api.res.bodyParams = res_body;
      } else {
        api.res.raw_body = body;
        api.res.body = body;
        api.res.bodyParams = null;
      } //end if

      if (_lodash2.default.isObject(res.request.headers)) {
        var headers = [];
        var omit = ['accept', 'content-length'];
        _lodash2.default.forEach(_lodash2.default.omit(res.request.headers, omit), function (v, k) {
          headers.push({
            key: k,
            value: v
          });
        });
        api.req.headers = headers;
      } else {
        api.req.headers = null;
      } //end if
      this._createApiJson(api);
    }
  }]);

  return Jsoner;
}();

exports.default = Jsoner;
module.exports = exports['default'];