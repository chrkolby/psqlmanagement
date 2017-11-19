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

class TableListHandler(BaseHandler):

	@gen.coroutine
	def get(self):
		cursor = yield self.db.execute("""SELECT table_name FROM information_schema.tables
			WHERE table_schema = 'public'""")
		all = cursor.fetchall();
		tables = []
		for table in all:
			tables.append(table['table_name'])
		self.write(json.dumps(tables)) 

class TableContentHandler(BaseHandler):

	@gen.coroutine
	def post(self):
		data = tornado.escape.json_decode(self.request.body)
		cursor = yield self.db.execute("SELECT * from %s" % data['table_name']);
		all = cursor.fetchall();
		self.write(json.dumps(all)) 
