/**
 * Created by Rubyxiao on 2017/4/20.
 */
import _ from 'lodash';
import url from 'url';

class Endpoint {
  constructor(endpointName, pathParams) {
    if (_.isUndefined(endpointName) || _.isUndefined(pathParams)) {
      throw new Error("endpointName and pathParams are required.");
    }

    if (!_.isString(endpointName) || !_.isString(pathParams)) {
      throw new Error("endpointName and pathParams must be a String.");
    }

    this.endpointName = endpointName;
    this.pathParams = pathParams;
    this.tasks = [];
  }

  _checkMethod(tasks) {
    let method = [];
    _.forEach(tasks, (v, k) => {
      method.push(v.method);
    });
    if (_.uniq(method).length > 1) {
      console.log(`Task methods: `, method);
      throw new Error("Tasks method is not same!!");
    } else {
      return true
    }//end if
  }

  _createEndpointJson() {
    if (this._checkMethod(this.tasks)) {
      let first = _.head(this.tasks);
      this.api = {
        method: first.method,
        url: first.url,
        tasks: this.tasks
      };
      this.endpointOption = {
        endpointName: this.endpointName,
        pathParams: this.pathParams,
      };
    }//end if

  }


}

export default Endpoint;