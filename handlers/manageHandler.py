from tornado import gen
from tornado.ioloop import IOLoop
from tornado.httpserver import HTTPServer
from tornado.options import parse_command_line
from tornado import web
import os

import psycopg2
import momoko
import tornado
import json
from urllib.parse import unquote

import app
	

class SchemaHandler(app.BaseHandler):

	"""
	@api {get} /Schema/:table Database information
	@apiName GetSchema
	@apiGroup Schema
	
	@apiParam {string} table Table name (optional)
	@apiParam (Query string) {string} token Provide current session token
	```
	?token=sessionToken
	```
	
	@apiSuccess {object} schema Table names in form of a list with objects (no params)
	@apiSuccess {object} table Table columns in form of a list with objects (table specified)
	@apiSuccessExample {json} Success-Response:
		HTTP/1.1 200 OK
		{
			"data": [{table_name: "table1"}, {table_name: "table2"}],
			"status": 200
		}
	
	@apiSuccessExample {json} Success-Response:
		HTTP/1.1 200 OK
		{
			"data": [{column_name: "column1"}, {column_name: "column2"}],
			"status": 200
		}
	@apiError {object} NoConnection No database connection established
	@apiErrorExample {json} Error-Response:
		HTTP/1.1 401 Not Found
		{
			"message": "No active database connection",
			"status": 401
		}
	
	"""

	@gen.coroutine
	def get(self, table_name=None):
	
		token = self.get_argument('token', "");
		
		if(self.checkConnection(token) == "error"):
			returnval = {'status': 401, 'message': 'No active database connection'}
			self.write(returnval)
			return
		
		if(table_name):
			cursor = yield self.db(token).execute("""select column_name, data_type, character_maximum_length, is_nullable
			from INFORMATION_SCHEMA.COLUMNS where table_name = '{0}'""".format(table_name))

		else:
			cursor = yield self.db(token).execute("""SELECT table_name FROM information_schema.tables
			WHERE table_schema = 'public'""")
			
		all = cursor.fetchall()
		returnval = {'status':200, 'data': all}

		self.write(returnval) 
		
	"""
	@api {post} /Schema/:table Create a new table
	@apiName CreateTable
	@apiGroup Schema
	
	@apiParam (Query string) {string} token Provide current session token
	```
	?token=sessionToken
	```
	@apiParam (Request message body) {object[]} columns Array of objects with column data
	@apiParam (Request message body) {string} tablename Name of the table
	@apiParamExample {json} Request-Example:
		{
			"columns": [{"name": "column1", "type": "varchar", "length": "10"}, {"name": "column2", "type": "varchar", "length": "5"}],
			"tablename": "table"
		}
	
	@apiSuccess {json} table names (no params)
	@apiSuccessExample {json} Success-Response:
		HTTP/1.1 200 OK
		{
			"message": "Table created",
			"status": 200
		}
	
	@apiError {object} NoConnection No database connection established
	@apiError {object} BadRequest Unable to create table from information supplied
	@apiErrorExample {json} Error-Response:
		HTTP/1.1 401 Not Found
		{
			"message": "No active database connection"
			"status": 401
		}
	@apiErrorExample {json} Error-Response:
		HTTP/1.1 400 Bad Request
		{
			"sql": "CREATE TABLE table (column varchar (5),column2 int );",
			"message": "syntax error at or near 'table'",
			"status": 400
		}
	
	"""
		
	@gen.coroutine
	def post(self):
	
		token = self.get_argument('token', "");
	
		if(self.checkConnection(token) == "error"):
			returnval = {'status': 401, 'message': 'No active database connection'}
			self.write(returnval)
			return
			
		postData = tornado.escape.json_decode(self.request.body)
		
		sql = "CREATE TABLE {0} (".format(postData['tablename'])
		
		print(postData)
		
		if(postData['columns']):
		
			for key, value in postData['columns']:
				print(key, value);
				if(value['length'] != ""):
					sql += value['name'] + " " + value['type'] + " (" + value['length'] + "),"
				else:
					sql += value['name'] + " " + value['type'] + " " + value['length'] + ","
				
			sql = sql[:-1]
			sql += ");"

			try:
				cursor = yield self.db(token).execute(sql)
				returnval = {
					'status': 200,
					'message': 'Table created'
				}
				self.write(returnval)
				return

			except psycopg2.Error as e:
				self.set_status(400);
				returnval = {
					'status': 400,
					'message':e.diag.message_primary,
					'sql': sql
				}
				self.write(returnval)
				return
				
		else:
		
			self.set_status(400);
			returnval = {
				'status': 400,
				'message': "No column data supplied"
			}
			self.write(returnval)
			return

class TableHandler(app.BaseHandler):

	"""
	@api {get} /Table/:table Table data
	@apiName GetTable
	@apiGroup Table
	
	@apiParam {string} table Table name
	@apiParam (Query string) {string} token Provide current session token
	```
	?token=sessionToken
	```
	
	@apiSuccess {object} table All data in table in form of a list with objects
	@apiSuccessExample {json} Success-Response:
		HTTP/1.1 200 OK
		{
			"data": [{column1: "data1"}, {column2: "data2"}],
			"status": 200
		}
		
	@apiError {object} NoConnection No database connection established
	@apiErrorExample {json} Error-Response:
		HTTP/1.1 401 Not Found
		{
			"message": "No active database connection",
			"status": 401
		}
	@apiErrorExample {json} Error-Response:
		HTTP/1.1 404 Bad Request
		{
			"message": "Table not found",
			"status": 404
		}
	"""

	@gen.coroutine
	def get(self, table):
		search = self.get_argument('search', "");
		
		token = self.get_argument('token', "");
		
		if(self.checkConnection(token) == "error"):
			returnval = {'status': 401, 'message': 'No active database connection'}
			self.write(returnval)
			return
		
		if(search == 'undefined'):
			search = ''

		try:
			cursor = yield self.db(token).execute("""select column_name, data_type from INFORMATION_SCHEMA.COLUMNS where table_name = '{0}'""".format(table))
			
			
			all = cursor.fetchall();
				
			sql = "select * from %s where " % table;
			i = 1
			for table in all:
				if(table['data_type'] == 'character varying'):
					sql = sql  + table['column_name'] + " LIKE '%{0}%' OR ".format(search);

			sql = sql[:-3]
			cursor = yield self.db(token).execute(sql)
			
			all = cursor.fetchall()
			data = {
				'status' : 200,
				'data' : all
			}
		except:
			self.set_status(404);
			data = {
				'status' : 404,
				'message' : 'Table not found'
			}

		self.write(json.dumps(data)) 
		
	"""
	@api {post} /Table/:table SQL call
	@apiName SQLCall
	@apiGroup Table
	
	@apiParam {string} table Table name
	@apiParam (Query string) {string} token Provide current session token
	```
	?token=sessionToken
	```
	@apiParam (Request message body) {string} SQLQuery SQL query to execute on the table
	@apiParamExample {json} Request-Example:
		{
			"sql": "Select * from table1;"
		}
	
	@apiSuccess {json} sql Results from sql query (no params)
	@apiSuccessExample {json} Success-Response:
		HTTP/1.1 200 OK
		{
			"message": "SQL query executed successfully",
			"status": 200,
			"data": [{"id": 1, "foo": "bar"}, {"id": 2, "foo": "baz"}]
		}
	
	@apiError {object} NoConnection No database connection established
	@apiError {object} BadRequest Unable to create table from information supplied
	@apiErrorExample {json} Error-Response:
		HTTP/1.1 401 Not Found
		{
			"message": "No active database connection"
			"status": 401
		}
	@apiErrorExample {json} Error-Response:
		HTTP/1.1 400 Bad Request
		{
			"status": 400, 
			"message": "relation \"test41\" does not exist"
		}
	
	"""
		
	@gen.coroutine
	def post(self, table):
		postData = tornado.escape.json_decode(self.request.body)
		
		token = self.get_argument('token', "");

		if(self.checkConnection(token) == "error"):
			returnval = {'status': 401, 'message': 'No active database connection'}
			self.write(returnval)
			return	
		
		try:
			cursor = yield self.db(token).execute(postData['sql'])
			
			try:
				all = cursor.fetchall();
				
			except:
				all = "No data";
			
			returnval = {'status': 200, 'message': 'SQL query executed successfully', 'data':all}
			self.write(returnval)
			return
			
		except psycopg2.Error as e:
			self.set_status(400);
			returnval = {'status': 400, 'message': e.diag.message_primary}
			self.write(returnval)
			return
		
	"""
	@api {put} /Table/:table Table insertion
	@apiName Insert
	@apiGroup Table
	
	@apiParam {string} table Table name
	@apiParam (Query string) {string} token Provide current session token
	```
	?token=sessionToken
	```
	@apiParam (Request message body) {object[]} data array of data with column name and information to insert
	@apiParamExample {json} Request-Example:
		{
			data: {
				"id": "DEFAULT", 
				"bar": "rara"
			}
		}
	
	@apiSuccess {String} message success description
	@apiSuccess {int} status status code
	@apiSuccessExample {json} Success-Response:
		HTTP/1.1 200 OK
		{
			"message": "Row successfully inserted",
			"status": 200
		}
	
	@apiError {object} NoConnection No database connection established
	@apiError {object} BadRequest Unable to create table from information supplied
	@apiErrorExample {json} Error-Response:
		HTTP/1.1 401 Not Found
		{
			"message": "No active database connection"
			"status": 401
		}
	@apiErrorExample {json} Error-Response:
		HTTP/1.1 400 Bad Request
		{
			"message": "invalid input syntax for integer: \"foo\"",
			"status": 400
		}
	
	"""
		
	@gen.coroutine
	def put(self, table):
		
		token = self.get_argument('token', "");
		
		postData = tornado.escape.json_decode(self.request.body)
		
		if(self.checkConnection(token) == "error"):
			returnval = {'status': 401, 'message': 'No active database connection'}
			self.write(returnval)
			return	
		
		columns = "";
		values = "";
		 
		i = 0
		
		for key, value in postData['data'].items():
		
			if(i != len(postData['data'])-1):
				columns += key + ',';
				if(value == 'DEFAULT'):
					values += value + ","
				else:
					values += "'" + value + "',";
			else:
				columns += key
				if(value == 'DEFAULT'):
					values += value + ","
				else:
					values += "'" + value + "'";
			i += 1
			
		insertString = "INSERT INTO {0} ({1}) VALUES ({2});".format(table, columns, values);
		
		print(insertString);
		
		try:
			cursor = yield self.db(token).execute(insertString)
			
			returnval = {'status': 200, 'message': 'Row successfully inserted'}
			self.write(returnval)
			return
			
		except psycopg2.Error as e:
			self.set_status(400);
			returnval = {'status': 400, 'message': e.diag.message_primary}
			self.write(returnval)
			return
		
	"""
	@api {delete} /Table/:table Table deletion
	@apiName Delete
	@apiGroup Table
	
	@apiParam {string} table Table name
	@apiParam (Query string) {string} token Provide current session token
	```
	?token=sessionToken
	```
	@apiParam (Request message body) {object[]} data array of data with column name and information of row to delete
	@apiParamExample {json} Request-Example:
		{
			0: {
				"id": 4, 
				"bar": "baz"
			}
			1: {
				"id": 5,
				"bar": "foo"
			}
		}
	
	@apiSuccess {String} message success description
	@apiSuccess {int} status status code
	@apiSuccessExample {json} Success-Response:
		HTTP/1.1 200 OK
		{
			"message": "All entries deleted successfully",
			"status": 200
		}
	
	@apiError {object} NoConnection No database connection established
	@apiError {object} BadRequest Unable to create table from information supplied
	@apiErrorExample {json} Error-Response:
		HTTP/1.1 401 Not Found
		{
			"message": "No active database connection"
			"status": 401
		}
	@apiErrorExample {json} Error-Response:
		HTTP/1.1 400 Bad Request
		{
			"message": "Error deleting entry",
			"status": 400
		}
	
	"""
		
	@gen.coroutine
	def delete(self, table):
	
		token = self.get_argument('token', "");
	
		if(self.checkConnection(token) == "error"):
			returnval = {'status': 401, 'message': 'No active database connection'}
			self.write(returnval)
			return
	
		data = tornado.escape.json_decode(self.request.body)
		error = []
		
		
		for item in data:
			try:
				self.deleteFkeys(table, item, token)
				
			except:
				error.append(item)
				
				
		if(len(error) > 0):
			self.set_status(400);
			data = {
				'status' : 400,
				'message' : 'Error deleting entry',
				'data' : error
			}
			
		else:
			data = {
				'status' : 200,
				'message' : 'All entries deleted successfully'
			}
			
		self.write(json.dumps(data)) 
		
			
	@gen.coroutine
	def deleteFkeys(self, table, data, token):
		fkeys = yield self.getFkeys(table, token)
		
		for ftable in fkeys:
			ftableName = ftable['table']
			for column in ftable['col']:
				index = data[column]
				
				newData = yield self.getItem(ftableName, column, index, token)
				
				for item in newData:
					self.deleteFkeys(ftableName, item, token)
				
				cursor = yield self.db(token).execute("""delete from {0} where {1} = '{2}'""".format(ftableName, column, index));
				
		sql = "DELETE from %s where " % table
				
		for i, dataIndex in enumerate(data):
			
			if(data[dataIndex] == None):
				sql = sql + "%s IS NULL" % dataIndex
			else:
				sql = sql + "%s = '%s'" % (dataIndex, data[dataIndex])
			
			if i != len(data)-1:
				sql = sql + " AND "
				
		cursor = yield self.db(token).execute(sql);
				
	@gen.coroutine
	def getItem(self, table, col, index, token):
		cursor = yield self.db(token).execute("""select * from {0} where {1} = '{2}'""".format(table, col, index));
		all = cursor.fetchall();
		return all;
	
	@gen.coroutine
	def getFkeys(self, table, token):
	
		cursor = yield self.db(token).execute("""select 
						  (select r.relname from pg_class r where r.oid = c.conrelid) as table, 
						  (select array_agg(attname) from pg_attribute 
						   where attrelid = c.conrelid and ARRAY[attnum] <@ c.conkey) as col, 
						  (select r.relname from pg_class r where r.oid = c.confrelid) as ftable 
						from pg_constraint c 
						where c.confrelid = (select oid from pg_class where relname = '{0}');""".format(table));
		all = cursor.fetchall();
		
		return all;