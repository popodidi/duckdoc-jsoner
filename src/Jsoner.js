import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import filenamify from 'filenamify';
import chalk from 'chalk';
import tv4 from 'tv4';
import schema from './schema/schema';
import url from 'url';

class Jsoner {
  constructor(outputPath) {
    this.outputPath = outputPath;
  }

  _mkdirIfNecessary() {
    this.outputPath.split('/').forEach((dir, index, splits) => {
      const parent = splits.slice(0, index).join('/');
      const dirPath = path.resolve(parent, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
      }
    });
  }

  _createApiJson(api) {
    try {
      let fileName = `${api.method}_${filenamify(api.pathParams, {replacement: '+'})}`;
      let filePath = path.join(this.outputPath, `${fileName}.json`);
      this._mkdirIfNecessary();
      fs.writeFileSync(filePath, JSON.stringify(api));
      console.log(chalk.green.bold("  Create: ") + chalk.blue(filePath));
    } catch (e) {
      console.log(e);
    }
  }

  _syntaxHighlight(json) {
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

  _replaceDot(string) {
    let arr = string.split('.');
    arr = _.map(arr, (str, i) => {
      return ((i == 0) ? "" : `<br/>`)
        + ((i == 0) ? "" : (_.repeat("&nbsp", (i - 1) * 4) + "└&nbsp"))
        + str;
    });
    return _.reduce(arr, (pre, str) => {
      return pre + str
    }, "")
  }

  _sortBodyValue(body, key, sortData) {
    let objectKey = "";
    _.forEach(body, (v, k) => {
      if (_.isObject(v)) {
        if (!_.isNull(key)) {
          objectKey += `${key}.` + k;
        } else {
          objectKey = k;
        }//end if
        sortData.push({
          name: objectKey,
          type: typeof v,
          formatted: this._replaceDot(objectKey)
        });
        sortBodyValue(v, objectKey, sortData);
      } else {
        let objectKey = "";
        if (!_.isNull(key)) {
          objectKey += `${key}.` + k;
        } else {
          objectKey = k;
        }//end if
        sortData.push({
          name: objectKey,
          type: typeof v,
          formatted: this._replaceDot(objectKey)
        });
      }//end if
    });
  }

  _parseAPI(api, options) {
    let exportAPI = _.merge({}, api);

    //處理request body
    if (_.isObject(api.req.body)) {
      let req_body = [];
      let reqbody = api.req.body;
      this._sortBodyValue(reqbody, null, req_body);
      exportAPI.req.raw_body = JSON.stringify(reqbody, null, 2);
      exportAPI.req.body = this._syntaxHighlight(exportAPI.req.raw_body);
      exportAPI.req.bodyParams = req_body;
    } else {
      if (!_.isUndefined(api.req.body)) {
        exportAPI.req.raw_body = api.req.body;
        exportAPI.req.body = api.req.body;
        exportAPI.req.bodyParams = null;
      } else {
        exportAPI.req.raw_body = null;
        exportAPI.req.body = null;
        exportAPI.req.bodyParams = null;
      }//end if

    }

    //處理response body
    if (_.isObject(api.res.body)) {
      let res_body = [];
      if (_.isUndefined(api.res.body.data)) {
        this._sortBodyValue(api.res.body, null, res_body);
      } else if (_.isArray(api.res.body.data)) {
        //如果有data代表他可能是array
        let reqbody = _.head(api.res.body.data);
        this._sortBodyValue(reqbody, null, res_body);
      }//end if
      exportAPI.res.raw_body = JSON.stringify(api.res.body, null, 2);
      exportAPI.res.body = this._syntaxHighlight(exportAPI.res.raw_body);
      exportAPI.res.bodyParams = res_body;
    } else {
      if (!_.isUndefined(api.res.body)) {
        exportAPI.res.raw_body = api.res.body;
        exportAPI.res.body = api.res.body;
        exportAPI.res.bodyParams = null;
      } else {
        exportAPI.res.raw_body = null;
        exportAPI.res.body = null;
        exportAPI.res.bodyParams = null;
      }//end if
    }//end if

    if (_.isObject(api.req.headers)) {
      let headers = [];
      let omit = ['accept', 'content-length'];
      _.forEach(_.omit(api.req.headers, omit), (v, k) => {
        headers.push({
          key: k,
          value: v
        });
      });
      exportAPI.req.headers = headers;
    } else {
      exportAPI.req.headers = (_.isUndefined(api.req.headers)) ? null : api.req.headers;
    }//end if

    if (_.isNull(options)) {
      //處理options
      let urlObject = url.parse(api.url);
      exportAPI.pathParams = urlObject.pathname;
      exportAPI.endpointName = urlObject.pathname;
      // exportAPI.endpointName = `${api.method} ${urlObject.pathname}`;
      // console.log(exportAPI);
      this._createApiJson(exportAPI);
    } else {
      this._parseOptions(exportAPI, options);
    }//end if
  }

  _parseOptions(api, options) {
    let API = _.merge(api, options);
    this._createApiJson(API);
  }

  createFromAPI(api, options = null) {
    let result = tv4.validateMultiple(api, schema.apiSchema);
    if (result.valid) {
      this._parseAPI(api, options);
    } else {
      let err = _.first(result.errors);
      throw new Error(chalk.red.bold(`${err.message} : ${err.dataPath}`));
    }//end if
  }


  createFromResponse(endpointName, path, res, body) {
    let api = {
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
    if (_.isObject(body)) {
      let res_body = [];
      if (_.isUndefined(body.data)) {
        this._sortBodyValue(body, null, res_body);
      } else if (_.isArray(body.data)) {
        //如果有data代表他是array
        let reqbody = _.head(body.data);
        this._sortBodyValue(reqbody, null, res_body);
      }//end if
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
    this._createApiJson(api);
  }
}


export default Jsoner;