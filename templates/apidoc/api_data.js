define({ "api": [
  {
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "varname1",
            "description": "<p>No type.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "varname2",
            "description": "<p>With type.</p>"
          }
        ]
      }
    },
    "type": "",
    "url": "",
    "version": "0.0.0",
    "filename": "./apidoc/main.js",
    "group": "C__Users_chrko_Documents_python_gittornado_apidoc_main_js",
    "groupTitle": "C__Users_chrko_Documents_python_gittornado_apidoc_main_js",
    "name": ""
  },
  {
    "type": "post",
    "url": "/Schema/:table",
    "title": "Create a new table",
    "name": "CreateTable",
    "group": "Schema",
    "parameter": {
      "fields": {
        "Query string": [
          {
            "group": "Query string",
            "type": "string",
            "optional": false,
            "field": "token",
            "description": "<p>Provide current session token</p> <pre><code>?token=sessionToken </code></pre>"
          }
        ],
        "Request message body": [
          {
            "group": "Request message body",
            "type": "object[]",
            "optional": false,
            "field": "columns",
            "description": "<p>Array of objects with column data</p>"
          },
          {
            "group": "Request message body",
            "type": "string",
            "optional": false,
            "field": "tablename",
            "description": "<p>Name of the table</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n\"columns\": [{\"name\": \"column1\", \"type\": \"varchar\", \"length\": \"10\"}, {\"name\": \"column2\", \"type\": \"varchar\", \"length\": \"5\"}],\n\"tablename\": \"table\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "table",
            "description": "<p>names (no params)</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n\"message\": \"Table created\",\n\"status\": 200\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "object",
            "optional": false,
            "field": "NoConnection",
            "description": "<p>No database connection established</p>"
          },
          {
            "group": "Error 4xx",
            "type": "object",
            "optional": false,
            "field": "BadRequest",
            "description": "<p>Unable to create table from information supplied</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 401 Not Found\n{\n\"message\": \"No active database connection\"\n\"status\": 401\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n\"sql\": \"CREATE TABLE table (column varchar (5),column2 int );\",\n\"message\": \"syntax error at or near 'table'\",\n\"status\": 400\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./handlers/manageHandler.py",
    "groupTitle": "Schema"
  },
  {
    "type": "get",
    "url": "/Schema/:table",
    "title": "Database information",
    "name": "GetSchema",
    "group": "Schema",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "table",
            "description": "<p>Table name (optional)</p>"
          }
        ],
        "Query string": [
          {
            "group": "Query string",
            "type": "string",
            "optional": false,
            "field": "token",
            "description": "<p>Provide current session token</p> <pre><code>?token=sessionToken </code></pre>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "object",
            "optional": false,
            "field": "schema",
            "description": "<p>Table names in form of a list with objects (no params)</p>"
          },
          {
            "group": "Success 200",
            "type": "object",
            "optional": false,
            "field": "table",
            "description": "<p>Table columns in form of a list with objects (table specified)</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n\"data\": [{table_name: \"table1\"}, {table_name: \"table2\"}],\n\"status\": 200\n}",
          "type": "json"
        },
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n\"data\": [{column_name: \"column1\"}, {column_name: \"column2\"}],\n\"status\": 200\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "object",
            "optional": false,
            "field": "NoConnection",
            "description": "<p>No database connection established</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 401 Not Found\n{\n\"message\": \"No active database connection\",\n\"status\": 401\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./handlers/manageHandler.py",
    "groupTitle": "Schema"
  },
  {
    "type": "delete",
    "url": "/Table/:table",
    "title": "Table deletion",
    "name": "Delete",
    "group": "Table",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "table",
            "description": "<p>Table name</p>"
          }
        ],
        "Query string": [
          {
            "group": "Query string",
            "type": "string",
            "optional": false,
            "field": "token",
            "description": "<p>Provide current session token</p> <pre><code>?token=sessionToken </code></pre>"
          }
        ],
        "Request message body": [
          {
            "group": "Request message body",
            "type": "object[]",
            "optional": false,
            "field": "data",
            "description": "<p>array of data with column name and information of row to delete</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n0: {\n\"id\": 4, \n\"bar\": \"baz\"\n}\n1: {\n\"id\": 5,\n\"bar\": \"foo\"\n}\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>success description</p>"
          },
          {
            "group": "Success 200",
            "type": "int",
            "optional": false,
            "field": "status",
            "description": "<p>status code</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n\"message\": \"All entries deleted successfully\",\n\"status\": 200\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "object",
            "optional": false,
            "field": "NoConnection",
            "description": "<p>No database connection established</p>"
          },
          {
            "group": "Error 4xx",
            "type": "object",
            "optional": false,
            "field": "BadRequest",
            "description": "<p>Unable to create table from information supplied</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 401 Not Found\n{\n\"message\": \"No active database connection\"\n\"status\": 401\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n\"message\": \"Error deleting entry\",\n\"status\": 400\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./handlers/manageHandler.py",
    "groupTitle": "Table"
  },
  {
    "type": "get",
    "url": "/Table/:table",
    "title": "Table data",
    "name": "GetTable",
    "group": "Table",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "table",
            "description": "<p>Table name</p>"
          }
        ],
        "Query string": [
          {
            "group": "Query string",
            "type": "string",
            "optional": false,
            "field": "token",
            "description": "<p>Provide current session token</p> <pre><code>?token=sessionToken </code></pre>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "object",
            "optional": false,
            "field": "table",
            "description": "<p>All data in table in form of a list with objects</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n\"data\": [{column1: \"data1\"}, {column2: \"data2\"}],\n\"status\": 200\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "object",
            "optional": false,
            "field": "NoConnection",
            "description": "<p>No database connection established</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 401 Not Found\n{\n\"message\": \"No active database connection\",\n\"status\": 401\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 404 Bad Request\n{\n\"message\": \"Table not found\",\n\"status\": 404\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./handlers/manageHandler.py",
    "groupTitle": "Table"
  },
  {
    "type": "put",
    "url": "/Table/:table",
    "title": "Table insertion",
    "name": "Insert",
    "group": "Table",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "table",
            "description": "<p>Table name</p>"
          }
        ],
        "Query string": [
          {
            "group": "Query string",
            "type": "string",
            "optional": false,
            "field": "token",
            "description": "<p>Provide current session token</p> <pre><code>?token=sessionToken </code></pre>"
          }
        ],
        "Request message body": [
          {
            "group": "Request message body",
            "type": "object[]",
            "optional": false,
            "field": "data",
            "description": "<p>array of data with column name and information to insert</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\ndata: {\n\"id\": \"DEFAULT\", \n\"bar\": \"rara\"\n}\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>success description</p>"
          },
          {
            "group": "Success 200",
            "type": "int",
            "optional": false,
            "field": "status",
            "description": "<p>status code</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n\"message\": \"Row successfully inserted\",\n\"status\": 200\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "object",
            "optional": false,
            "field": "NoConnection",
            "description": "<p>No database connection established</p>"
          },
          {
            "group": "Error 4xx",
            "type": "object",
            "optional": false,
            "field": "BadRequest",
            "description": "<p>Unable to create table from information supplied</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 401 Not Found\n{\n\"message\": \"No active database connection\"\n\"status\": 401\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n\"message\": \"invalid input syntax for integer: \\\"foo\\\"\",\n\"status\": 400\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./handlers/manageHandler.py",
    "groupTitle": "Table"
  },
  {
    "type": "post",
    "url": "/Table/:table",
    "title": "SQL call",
    "name": "SQLCall",
    "group": "Table",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "table",
            "description": "<p>Table name</p>"
          }
        ],
        "Query string": [
          {
            "group": "Query string",
            "type": "string",
            "optional": false,
            "field": "token",
            "description": "<p>Provide current session token</p> <pre><code>?token=sessionToken </code></pre>"
          }
        ],
        "Request message body": [
          {
            "group": "Request message body",
            "type": "string",
            "optional": false,
            "field": "SQLQuery",
            "description": "<p>SQL query to execute on the table</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n\"sql\": \"Select * from table1;\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "sql",
            "description": "<p>Results from sql query (no params)</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n\"message\": \"SQL query executed successfully\",\n\"status\": 200,\n\"data\": [{\"id\": 1, \"foo\": \"bar\"}, {\"id\": 2, \"foo\": \"baz\"}]\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "object",
            "optional": false,
            "field": "NoConnection",
            "description": "<p>No database connection established</p>"
          },
          {
            "group": "Error 4xx",
            "type": "object",
            "optional": false,
            "field": "BadRequest",
            "description": "<p>Unable to create table from information supplied</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 401 Not Found\n{\n\"message\": \"No active database connection\"\n\"status\": 401\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n\"status\": 400, \n\"message\": \"relation \\\"test41\\\" does not exist\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./handlers/manageHandler.py",
    "groupTitle": "Table"
  }
] });
