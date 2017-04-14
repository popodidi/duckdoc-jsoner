import path from 'path';
import jsoner from '../src/index';
import _ from 'lodash';

// let jsoner = new Jsoner("output/path");
let api = {
  method: "POST",
  url   : "url/:id",
  req   : {
    headers: {
      Authorization: "Bearer token"
    },
    body   : {
      para: "hello"
    }
  },
  res   : {
    status: {
      code   : 200,
      message: "OK"
    },
    body  : {
      "data"      : [{
        "id"      : 1,
        "name"    : "ibooking_type_life",
        "subTypes": [
          {"id": 27, "name": "洗車"},
          {"id": 28, "name": "修車"},
          {"id": 29, "name": "清潔公司"},
          {
            "id"  : 30,
            "name": "搬家公司"
          }, {"id": 31, "name": "水肥公司"},
          {"id": 32, "name": "裝修公司"},
          {"id": 33, "name": "水電行"}, {
            "id"  : 34,
            "name": "生命禮儀"
          }
        ]
      }, {
        "id"      : 2,
        "name"    : "ibooking_type_recreation",
        "subTypes": [{"id": 15, "name": "美容"}, {"id": 16, "name": "美髮"}, {"id": 17, "name": "美甲"}, {
          "id"  : 18,
          "name": "芳療"
        }, {"id": 19, "name": "寵物美容"}, {"id": 20, "name": "健身房"}, {"id": 21, "name": "極限運動"}, {"id": 22, "name": "刺青店"}]
      }, {
        "id"      : 3,
        "name"    : "ibooking_type_travel",
        "subTypes": [{"id": 9, "name": "民宿"}, {"id": 10, "name": "導遊"}, {"id": 11, "name": "限額展覽"}, {
          "id"  : 12,
          "name": "衝浪板出租"
        }, {"id": 13, "name": "重機車出租"}, {"id": 14, "name": "遊覽車"}]
      }, {
        "id"      : 4,
        "name"    : "ibooking_type_education",
        "subTypes": [{"id": 23, "name": "家庭教師"}, {"id": 24, "name": "舞蹈教師"}, {"id": 25, "name": "游泳教練"}, {
          "id"  : 26,
          "name": "音樂老師"
        }]
      }, {
        "id"      : 5,
        "name"    : "ibooking_type_infant",
        "subTypes": [{"id": 35, "name": "保母"}, {"id": 36, "name": "月子中心"}, {"id": 37, "name": "月姨"}]
      }, {
        "id"      : 6,
        "name"    : "ibooking_type_medical",
        "subTypes": [{"id": 1, "name": "各類診所"}, {"id": 2, "name": "醫美"}, {"id": 3, "name": "牙醫"}, {
          "id"  : 4,
          "name": "眼科"
        }, {"id": 5, "name": "小兒科"}, {"id": 6, "name": "耳鼻喉科"}, {"id": 7, "name": "健檢"}, {"id": 8, "name": "心理醫生"}]
      }, {
        "id"      : 7,
        "name"    : "ibooking_type_clothing",
        "subTypes": [{"id": 38, "name": "婚紗禮服"}, {"id": 39, "name": "攝影師"}, {"id": 40, "name": "新娘秘書"}]
      }], "length": 7, "limit": 10, "offset": 0
    }
  }
}

jsoner.outputPath = path.join(__dirname, '../duckdoc/json');
var options = {
  endpointName: "NAMEEEE",
  pathParams: "/endpoint/param/:pppp",
  req: {
    body: {
      description: {
        para: "what's up?"
      },
      optionalParams: [
        "para"
      ]
    }
  },
  res: {
    body: {
      description: {
        "data.__first_item.id": "YOOOOOOO"
      },
      optionalParams: [
        "data.__first_item.id", "data.__first_item.name"
      ]
    }
  }
}
jsoner.createFromAPI(api, options);