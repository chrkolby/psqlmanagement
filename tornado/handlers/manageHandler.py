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

	@gen.coroutine
	def get(self, table_name=None):
		
		if(self.checkConnection() == "error"):
			returnval = {'status': 500, 'message': 'No active database connection'}
			self.write(returnval)
			return
		
		if(table_name):
			cursor = yield self.db().execute("""select column_name, data_type, character_maximum_length, is_nullable
			from INFORMATION_SCHEMA.COLUMNS where table_name = '{0}'""".format(table_name))

		else:
			cursor = yield self.db().execute("""SELECT table_name FROM information_schema.tables
			WHERE table_schema = 'public'""")
			
		all = cursor.fetchall()
		returnval = {'status':200, 'data': all}

		self.write(returnval) 
		
	@gen.coroutine
	def post(self):
		if(self.checkConnection() == "error"):
			returnval = {'status': 500, 'message': 'No active database connection'}
			self.write(returnval)
			return
			
		postData = tornado.escape.json_decode(self.request.body)
		
		sql = "CREATE TABLE {0} (".format(postData['tablename'])
		
		print(postData)
		
		for key, value in postData.items():
			if(key != "tablename"):
				if(value['length'] != ""):
					sql += value['name'] + " " + value['type'] + " (" + value['length'] + "),"
				else:
					sql += value['name'] + " " + value['type'] + " " + value['length'] + ","
				
		sql = sql[:-1]
		sql += ");"

		try:
			cursor = yield self.db().execute(sql)
			returnval = {
				'status': 200,
				'message': 'Table created'
			}
			self.write(returnval)
			return

		except psycopg2.Error as e:
			returnval = {
				'status': 400,
				'message':e.diag.message_primary,
				'sql': sql
			}
			self.write(returnval)
			return

class TableHandler(app.BaseHandler):

	@gen.coroutine
	def get(self, table):
		search = self.get_argument('search', "");
		
		if(self.checkConnection() == "error"):
			returnval = {'status': 500, 'message': 'No active database connection'}
			self.write(returnval)
			return
		
		if(search == 'undefined'):
			search = ''

		try:
			cursor = yield self.db().execute("""select column_name, data_type from INFORMATION_SCHEMA.COLUMNS where table_name = '{0}'""".format(table))
			
			
			all = cursor.fetchall();
				
			sql = "select * from %s where " % table;
			i = 1
			for table in all:
				if(table['data_type'] == 'character varying'):
					sql = sql  + table['column_name'] + " LIKE '%{0}%' OR ".format(search);

			sql = sql[:-3]
			cursor = yield self.db().execute(sql)
			
			all = cursor.fetchall()
			data = {
				'status' : 200,
				'data' : all
			}
		except:
			data = {
				'status' : 404,
				'message' : 'Table not found'
			}

		self.write(json.dumps(data)) 
		
	@gen.coroutine
	def post(self, table):
		postData = tornado.escape.json_decode(self.request.body)

		if(self.checkConnection() == "error"):
			returnval = {'status': 500, 'message': 'No active database connection'}
			self.write(returnval)
			return
			
			
		if(postData['type'] == 'insert'):
		
			columns = "";
			values = "";
		
			i = 0
			
			print(postData['data']);
		
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
			
			postData['data'] = insertString
		
		
		try:
			cursor = yield self.db().execute(postData['data'])
			
			try:
				all = cursor.fetchall();
				
			except:
				all = "No data";
			
			returnval = {'status': 200, 'message': 'SQL query executed successfully', 'data':all}
			self.write(returnval)
			return
			
		except psycopg2.Error as e:
			returnval = {'status': 400, 'message': e.diag.message_primary}
			self.write(returnval)
			return
		
		
	@gen.coroutine
	def delete(self, table):
	
		if(self.checkConnection() == "error"):
			returnval = {'status': 500, 'message': 'No active database connection'}
			self.write(returnval)
			return
	
		data = tornado.escape.json_decode(self.request.body)
		error = []
		
		
		for item in data:
			try:
				self.deleteFkeys(table, item)
				
			except:
				error.append(item)
				
				
		if(len(error) > 0):
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
	def deleteFkeys(self, table, data):
		fkeys = yield self.getFkeys(table)
		
		for ftable in fkeys:
			ftableName = ftable['table']
			for column in ftable['col']:
				index = data[column]
				
				newData = yield self.getItem(ftableName, column, index)
				
				for item in newData:
					self.deleteFkeys(ftableName, item)
				
				cursor = yield self.db().execute("""delete from {0} where {1} = '{2}'""".format(ftableName, column, index));
				
		sql = "DELETE from %s where " % table
				
		for i, dataIndex in enumerate(data):
			
			if(data[dataIndex] == None):
				sql = sql + "%s IS NULL" % dataIndex
			else:
				sql = sql + "%s = '%s'" % (dataIndex, data[dataIndex])
			
			if i != len(data)-1:
				sql = sql + " AND "
				
		cursor = yield self.db().execute(sql);
				
	@gen.coroutine
	def getItem(self, table, col, index):
		cursor = yield self.db().execute("""select * from {0} where {1} = '{2}'""".format(table, col, index));
		all = cursor.fetchall();
		return all;
	
	@gen.coroutine
	def getFkeys(self, table):
	
		cursor = yield self.db().execute("""select 
						  (select r.relname from pg_class r where r.oid = c.conrelid) as table, 
						  (select array_agg(attname) from pg_attribute 
						   where attrelid = c.conrelid and ARRAY[attnum] <@ c.conkey) as col, 
						  (select r.relname from pg_class r where r.oid = c.confrelid) as ftable 
						from pg_constraint c 
						where c.confrelid = (select oid from pg_class where relname = '{0}');""".format(table));
		all = cursor.fetchall();
		
		return all;