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
          "type": "object"
        },
        "body": {
          "type": ["object", "string"]
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
          "type": ["object", "string"]
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