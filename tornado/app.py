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

import handlers
		
class Delete(BaseHandler):
	@gen.coroutine
	def post(self):
		data = tornado.escape.json_decode(self.request.body)
	#	yield self.db.execute("DELETE from account where accid = '%d';" % data['id'])
	#	yield self.db.execute("DELETE from account where accid = '%d';" % data['id'])
		yield self.db.execute("DELETE from settings where accid = '%d';" % data['id'])
		yield self.db.execute("DELETE from bases where accid = '%d';" % data['id'])
		yield self.db.execute("DELETE from account where accid = '%d';" % data['id'])
		#account = cursor.fetchone()
		#print(account["accid"])
		#id = data["id"]
		#self.write(account)
		
class Manage(BaseHandler):
	@gen.coroutine
	def get(self):
		cursor = yield self.db.execute("""SELECT table_name FROM information_schema.tables
			WHERE table_schema = 'public'""")
		all = cursor.fetchall();
		self.write(json.dumps(all)) 
		print(all)
		
class Export(BaseHandler):
	@gen.coroutine
	def post(self):
		cursor = yield self.db.execute("SELECT * from account;")
		account = cursor.fetchall()
		with open('database.txt', 'w') as file:
			file.write(json.dumps(account))
		print(account)
	
class Login(web.RequestHandler):
	@gen.coroutine
	def post(self):
		data = tornado.escape.json_decode(self.request.body)
		ioloop = IOLoop.current()
		self.connected = False
		self.application.db = momoko.Pool(
			dsn='dbname={0} user={1} password={2} '
				'host=127.0.0.1 port=5432'.format(data['database'],data['username'],data['password']),
			size=1,
			ioloop=ioloop,
			cursor_factory=psycopg2.extras.RealDictCursor,
		)
		#future = application.db.connect()
		future = self.application.db.connect()
		try:
			yield self.application.db.execute("SELECT 1;")
			self.connected = True
		except:
			self.connected = False
		print(self.connected)
		response = {"Connected": self.connected}
		self.write(response)


if __name__ == '__main__':
	parse_command_line()
	
	settings = {
	"debug": True,
	"template_path": "C:\\Users\\Computer\\Documents\\python\\tornado\\app",
	"static_path": "C:\\Users\\Computer\\Documents\\python\\tornado\\app"
	}
	
	root = os.path.dirname(__file__)
	
	h = [(r"/(.*)", web.StaticFileHandler, {"path": root, "default_filename": "index.html"})]
	h.extend(handlers.default_handlers)	

	"""application = web.Application(h, **settings)"""

	
	application = web.Application([
		(r'/accounts/getaccs', handlers.accountHandler.AccountsHandler),
		(r'/API/Schema', handlers.manageHandler.SchemaHandler),
		(r'/API/Schema/(.*)', handlers.manageHandler.SchemaHandler),
		(r'/API/Table/(.*)', handlers.manageHandler.TableHandler),
		(r'/Login',Login),
		(r"/(.*)", web.StaticFileHandler, {"path": root, "default_filename": "index.html"})]
	, **settings)

	"""application = web.Application([
		(r'/', TutorialHandler)
		#(r'/Delete', Delete),
		#(r'/Export', Export),
		#(r'/Manage', Manage)
	], **settings)"""
	
	ioloop = IOLoop.instance()
	
	#ioloop = IOLoop.current()
	##application.db = momoko.Pool(
	#	dsn='dbname=astro user=astro password=kolbykolby '
	#		'host=127.0.0.1 port=5432',
	#	size=1,
	#	ioloop=ioloop,
	#	cursor_factory=psycopg2.extras.RealDictCursor,
	#)

		# this is a one way to run ioloop in sync
	#future = application.db.connect()
			
	#ioloop.add_future(future, lambda f: ioloop.stop())
	#ioloop.start()
	#future.result()  # raises exception on connection error

	http_server = HTTPServer(application)
	http_server.listen(8888, 'localhost')
	ioloop.start()
	