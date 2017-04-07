import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import filenamify from 'filenamify';
import chalk from 'chalk';

class Jsoner {
  constructor(outputPath) {
    this.ouputPath = outputPath;
  }

  _mkdirIfNecessary() {
    // if (!fs.existsSync(this.ouputPath)) {
    //   fs.mkdirSync(this.ouputPath);
    // }

    this.ouputPath.split('/').forEach((dir, index, splits) => {
      const parent = splits.slice(0, index).join('/');
      const dirPath = path.resolve(parent, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
      }
    });
  }

  _createApiJson(api) {
    let fileName = `${api.method}_${filenamify(api.url, {replacement: '+'})}`;
    let filePath = path.join(this.ouputPath, `${fileName}.json`);
    this._mkdirIfNecessary();
    fs.writeFileSync(filePath, JSON.stringify(api));
    console.log(chalk.green.bold("  Create: ") + chalk.blue(filePath));
  }

  createFromResponse(path, res, body) {
    let api = {
      method: res.request.method,
      url: path,
      example_url: res.request.uri.href,
      req: {
        headers: _.pick(res.request.headers, ['content-type', 'Authorization']),
        body: JSON.parse(res.request.body)
      },
      res: {
        status: {
          code: res.statusCode,
          message: res.statusMessage
        },
        body: body
      }
    };
    this._createApiJson(api);

  }
}


export default Jsoner;