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

    if (!_.isUndefined(_.get(body, 'data'))) {
      if (!_.isNull(key)) {
        objectKey += `${key}.` + "data";
      } else {
        objectKey = "data";
      }
      this._sortBodyValue.bind(this)(body.data, objectKey, sortData);
      return
    }


    if (_.isArray(body)) {
      sortData.push({
        name: key,
        type: this._typeOf(body, key),
        formatted: this._replaceDot(key)
      });

      objectKey = "";
      if (!_.isNull(key)) {
        objectKey += `${key}.` + "__first_item";
      } else {
        objectKey = "__first_item";
      }
      let firstObject = _.head(body);
      this._sortBodyValue.bind(this)(firstObject, objectKey, sortData);
      return
    }

    if (_.isObject(body)) {
      _.forEach(body, (v, k) => {
        objectKey = "";
        if (!_.isNull(key)) {
          objectKey += `${key}.` + k;
        } else {
          objectKey = k.toString();
        }//end if
        this._sortBodyValue.bind(this)(v, objectKey, sortData);
      })
      return
    }

    if (_.isUndefined(key) || _.isNull(key)) {
      key = "";
    }
    sortData.push({
      name: key,
      type: this._typeOf(body, key),
      formatted: this._replaceDot(key)
    });

  }

  _parseBody(body) {
    let temp;
    try {
      temp = JSON.parse(body)
    } catch (e) {
      temp = body;
    }
    console.log(temp);
    return temp;
  }

  _typeOf(v, key) {
    let typeStr = "";
    if (_.isString(key)) {
      _.forEach(key, (c) => {
        if (c == ".") {
          typeStr += `<br/>`;
        }
      })
    }
    if (_.isArray(v)) {
      return typeStr + "array"
    } else {
      return typeStr + typeof v
    }
  }

  _parseAPI(api, options) {
    let exportAPI = _.merge({}, api);

    //處理request body
    if (_.isObject(this._parseBody(api.req.body))) {
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
    if (_.isObject(this._parseBody(api.res.body))) {
      let res_body = [];
      this._sortBodyValue(api.res.body, null, res_body);
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
      this._createApiJson(exportAPI);
    } else {
      this._parseOptions(exportAPI, options);
    }//end if
  }

  _parseOptions(api, options) {
    let API = Object.assign(api, {
      endpointName: options.endpointName,
      pathParams: options.pathParams,
      req: Object.assign(api.req, {
        bodyParams: _.map(api.req.bodyParams, (o) => {
          o["description"] = _.get(_.get(options, 'req.body.description'), o.name)
          var optionalParams = _.get(options, 'req.body.optionalParams');
          if (!_.isUndefined(optionalParams) && _.indexOf(optionalParams, o.name) >= 0) {
            o["optional"] = true;
          }
          return o
        })
      }),
      res: Object.assign(api.res, {
        bodyParams: _.map(api.res.bodyParams, (o) => {
          o["description"] = _.get(_.get(options, 'res.body.description'), o.name)
          var optionalParams = _.get(options, 'res.body.optionalParams');
          if (!_.isUndefined(optionalParams) && _.indexOf(optionalParams, o.name) >= 0) {
            o["optional"] = true;
          }
          return o
        })
      })
    });
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


  createFromResponse(endpointName, pathParams, res, body) {
    let api = {
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

    let options = {
      endpointName: endpointName,
      pathParams: pathParams,
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

    this.createFromAPI(api, options);
    // this._createApiJson(api);
  }
}


export default Jsoner;