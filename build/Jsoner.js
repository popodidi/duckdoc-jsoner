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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Jsoner = function () {
  function Jsoner(outputPath) {
    _classCallCheck(this, Jsoner);

    this.ouputPath = outputPath;
  }

  _createClass(Jsoner, [{
    key: '_mkdirIfNecessary',
    value: function _mkdirIfNecessary() {
      // if (!fs.existsSync(this.ouputPath)) {
      //   fs.mkdirSync(this.ouputPath);
      // }

      this.ouputPath.split('/').forEach(function (dir, index, splits) {
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
      var fileName = api.method + '_' + (0, _filenamify2.default)(api.url, { replacement: '+' });
      var filePath = _path2.default.join(this.ouputPath, fileName + '.json');
      this._mkdirIfNecessary();
      _fs2.default.writeFileSync(filePath, JSON.stringify(api));
      console.log(_chalk2.default.green.bold("  Create: ") + _chalk2.default.blue(filePath));
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
    key: 'createFromResponse',
    value: function createFromResponse(path, res, body) {
      var api = {
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
        api.req.body = null;
        api.req.bodyParams = null;
      }

      //處理response body
      if (_lodash2.default.isObject(body)) {
        var res_body = [];
        if (_lodash2.default.isUndefined(body.data)) {
          this._sortBodyValue(body, null, res_body);
        } else if (_lodash2.default.isArray(body.data)) {
          //如果有data代表他是array
          var _reqbody = _lodash2.default.head(body.data);
          this._sortBodyValue(_reqbody, null, res_body);
        } //end if
        api.res.raw_body = JSON.stringify(body, null, 2);
        api.res.body = this._syntaxHighlight(api.res.raw_body);
        api.res.bodyParams = res_body;
      } else {
        api.res.raw_body = body;
        api.res.body = null;
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