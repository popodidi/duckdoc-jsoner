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
      const dirPath = path.resolve('/', parent, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
      }
    });
  }

  _createApiJson(api) {
    try {
      let fileName = `_${filenamify(api.pathParams, {replacement: '_'})}_${api.method}`;
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
      throw new Error("unexpected body format.");
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

  _parseAPI(api, options, tasks) {
    let exportAPI = _.merge({}, api);

    //處理request body
    api.req.body = this._parseBody(api.req.body);
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
    api.res.body = this._parseBody(api.res.body);
    if (_.isObject(api.res.body)) {
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

    tasks.push(this._parseOptions(exportAPI, options));
    // tasks.push(exportAPI);

  }

  _parseOptions(api, options) {
    let name, desc;
    //handle tasks name
    if (_.isUndefined(options.name)) {
      name = _.toString(api.res.status.code);
    } else {
      name = options.name.replace("{statusCode}", api.res.status.code);
    }

    //handle tasks description
    if (_.isUndefined(options.description)) {
      desc = "";
    } else {
      desc = options.description;
    }

    return Object.assign({}, api, {
      // let API = Object.assign({}, api, {
      // endpointName: options.endpointName,
      // pathParams: options.pathParams,
      name: name,
      description: desc,
      req: Object.assign({}, api.req, {
        bodyParams: _.map(api.req.bodyParams, (o) => {
          o["description"] = _.get(_.get(options, 'req.body.description'), o.name);
          var optionalParams = _.get(options, 'req.body.optionalParams');
          if (!_.isUndefined(optionalParams) && _.indexOf(optionalParams, o.name) >= 0) {
            o["optional"] = true;
          }
          return o
        })
      }),
      res: Object.assign({}, api.res, {
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
    // this._createApiJson(API);
  }

  _parseTask(api, endpointOptions) {
    let jsoner_task = [];
    _.forEach(api.tasks, (v, k) => {
      this._parseAPI(_.omit(v, 'options'), v.options, jsoner_task);
    });
    // console.log("==================");
    // console.log(jsoner_task);
    // console.log("==================");
    this._combineEndpoint(jsoner_task, endpointOptions);

  }

  _combineEndpoint(tasks, api_options) {
    let endpoint = {
      tasks: tasks
    };
    let picks = ['endpointName', 'pathParams'];
    let api = _.head(tasks);

    if (_.isNull(api_options)) {
      //處理options
      let urlObject = url.parse(api.url);
      endpoint.pathParams = urlObject.pathname;
      endpoint.endpointName = urlObject.pathname;
    } else {
      endpoint = _.assign(endpoint, _.pick(api_options, picks));
    }//end if

    endpoint.method = api.method;
    this._createApiJson(endpoint);

  }


  createFromAPI(api, options = null) {
    let result = tv4.validateMultiple(api, schema.apiSchema);
    if (result.valid) {
      let jsoner_tasks = [];
      this._parseAPI(api, options, jsoner_tasks);
      this._combineEndpoint(jsoner_tasks, options);

      // console.log("creatdFromAPI===========");
      // console.log(jsoner_tasks);
      // console.log("=============");

    } else {
      let err = _.first(result.errors);
      throw new Error(chalk.red.bold(`${err.message} : ${err.dataPath}`));
    }//end if
  }


  createFromResponse(res, body, options) {
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

    // let optional = Object.assign({
    //   endpointName: endpointName,
    //   pathParams: pathParams,
    // }, options);

    this.createFromAPI(api, options);
  }

  createEndpoint(endpoint) {
    // console.log("jsoner!!!");
    endpoint._createEndpointJson();
    // console.log(endpoint.api);
    this._parseTask(endpoint.api, endpoint.endpointOption);
  }

}


export default Jsoner;
