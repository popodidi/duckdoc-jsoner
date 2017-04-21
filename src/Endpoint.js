/**
 * Created by Rubyxiao on 2017/4/20.
 */
import _ from 'lodash';

class Endpoint {
  constructor(endpointName, pathParams) {
    this.endpointName = endpointName;
    this.pathParams = pathParams;
    this.tasks = [];
    this.method = null;
  }

  _createEndpointJson() {
    let first = _.head(this.tasks);
    this.api = {
      endpointName: this.endpointName,
      pathsParams: this.pathParams,
      method: first.method,
      url: first.url,
      tasks: this.tasks
    };
    // console.log(api);
    // return api;
  }


}

export default Endpoint;