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

class AccountsHandler(BaseHandler):

	@gen.coroutine
	def get(self):
		cursor = yield self.db.execute("SELECT * from account;")
		self.write(json.dumps(cursor.fetchall()))
	
default_handlers = [
    (r'/accounts/getaccs', AccountsHandler)
]