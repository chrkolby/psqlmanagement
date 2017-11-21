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

class BaseHandler(web.RequestHandler):
    @property
    def db(self):
        return self.application.db

class SchemaHandler(BaseHandler):

	@gen.coroutine
	def get(self, table_name=None):
		if(table_name):
			cursor = yield self.db.execute("""select column_name, data_type, character_maximum_length, is_nullable
			from INFORMATION_SCHEMA.COLUMNS where table_name = '{0}'""".format(table_name))
		else:
			cursor = yield self.db.execute("""SELECT table_name FROM information_schema.tables
			WHERE table_schema = 'public'""")
		all = cursor.fetchall()
		returnval = {'data': all}
		self.write(returnval) 
		
	def post(self):
		postData = tornado.escape.json_decode(self.request.body)
		print(postData)

class TableHandler(BaseHandler):

	@gen.coroutine
	def get(self, table):
		search = self.get_argument('search', "");
		
		if(search == 'undefined'):
			search = ''

		try:
			cursor = yield self.db.execute("""select column_name, data_type from INFORMATION_SCHEMA.COLUMNS where table_name = '{0}'""".format(table))
				
			all = cursor.fetchall();
				
			sql = "select * from %s where " % table;
			i = 1
			for table in all:
				print("i : {0} len(all) : {1}".format(i, len(all)))
				print(table['data_type'])
				if(table['data_type'] == 'character varying'):
					sql = sql  + table['column_name'] + " LIKE '%{0}%' OR ".format(search);

			sql = sql[:-3]
			
			cursor = yield self.db.execute(sql)
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
	