/**
 * Created by Rubyxiao on 2017/4/11.
 */
"use strict";

let apiSchema = {
  "type": "object",
  "properties": {
    "method": {
      "type": "string"
    },
    "url": {
      "type": "string"
    },
    "req": {
      "type": "object",
      "properties": {
        "headers": {
          "type": ["object", "null", "undefined"]
        },
        "body": {
          "type": ["object", "string", "null", "undefined"]
        }
      },
      "additionalProperties": false,
    },
    "res": {
      "type": "object",
      "properties": {
        "status": {
          "type": "object",
          "properties": {
            "code": {
              "type": "integer"
            },
            "message": {
              "type": "string"
            }
          },
          "additionalProperties": false,
        },
        "body": {
          "type": ["object", "string", "null", "undefined"]
        },
        "headers": {
          "type": "object"
        }
      },
      "additionalProperties": false,
    }
  },
  "additionalProperties": false,
  "required": ["method", "url"]
};

module.exports = {
  apiSchema
};