/**
 * Created by Rubyxiao on 2017/4/11.
 */
"use strict";

var apiSchema = {
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
          "type": ["object", "null"]
        },
        "body": {
          "type": ["object", "string", "null"]
        }
      },
      "additionalProperties": false
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
          "additionalProperties": false
        },
        "body": {
          "type": ["object", "string", "null"]
        }
      },
      "additionalProperties": false
    }
  },
  "additionalProperties": false,
  "required": ["method", "url"]
};

module.exports = {
  apiSchema: apiSchema
};