from tornado import gen
from tornado.ioloop import IOLoop
from tornado.httpserver import HTTPServer
from tornado.options import parse_command_line
from tornado import web
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import tornado.wsgi
import os

import psycopg2
import momoko
import tornado
import json
import codecs
import sys
import math
import random
import string


class BaseHandler(web.RequestHandler):

	def db(self, token):
		try:
			return self.application.db[token]['db']
		except:
			pass
			
	def checkConnection(self, token):
		print(self.application.db)
		try:
			return self.application.db[token]['db']
		except:
			return "error"
			
		
	
		

import handlers
		
		
class Export(BaseHandler):
	@gen.coroutine
	def get(self, table):

		cursor = yield self.db().execute("SELECT * from {0};".format(table))
		all = cursor.fetchall()

		with open('database.csv', 'w') as file:
			file.write(json.dumps(all))

		file_name = 'database.csv'
		buf_size = 4096
		self.set_header('Content-Type', 'application/octet-stream')
		self.set_header('Content-Disposition', 'attachment; filename=' + file_name)
		with open(file_name, 'r') as f:
			while True:
				data = f.read(buf_size)
				if not data:
					break
				self.write(data)
		self.finish()
		
class Home(BaseHandler):
	def get(self):
		self.render("newpage.html")
		
class PSQL(BaseHandler):
	
	def get(self):
	
		baseurl = os.getenv('API')
		
		data = {'api': baseurl};
	
		self.render("index.html", title="My title", items=data)
		 
class API(BaseHandler):

	def get(self):
		self.render("apidoc/index.html")
		
class testing(BaseHandler):
	def get(self):

		# instantiate a chrome options object so you can set the size and headless preference
		chrome_options = Options()
		#chrome_options.add_argument("--headless")

		# download the chrome driver from https://sites.google.com/a/chromium.org/chromedriver/downloads and put it in the
		# current directory
		chrome_driver = os.getcwd() +"/chromedriver.exe"

		# go to Google and click the I'm Feeling Lucky button
		driver = webdriver.Chrome(chrome_options=chrome_options, executable_path=chrome_driver)
		driver.get("https://www.google.com")
		lucky_button = driver.find_element_by_css_selector("[name=btnI]")
		lucky_button.click()

		# capture the screen
		driver.get_screenshot_as_file("capture.png")

	
class Login(web.RequestHandler):
	@gen.coroutine
	def post(self):
	
		token = ''.join(random.SystemRandom().choice(string.ascii_uppercase + string.digits) for _ in range(20))
	
		data = tornado.escape.json_decode(self.request.body)

		for value in self.application.db:

			if self.application.db[value]['user'] == data['username']:
				del self.application.db[value]
				break
		
		ioloop = IOLoop.current()
		self.connected = False
		
		connection = momoko.Pool(
			dsn='dbname={0} user={1} password={2} '
				'host={3} port=5432'.format(data['database'],data['username'],data['password'],os.getenv('POSTGRESQL_SERVICE_HOST')),
			size=1,
			ioloop=ioloop,
			cursor_factory=psycopg2.extras.RealDictCursor,
		)
		
		future = connection.connect()
		
		try:
			yield connection.execute("SELECT 1;")
			self.application.db[token] = {}
			self.application.db[token]['user'] = data['username']
			self.application.db[token]['token'] = token
			self.application.db[token]['db'] = connection
			response = {"status":200, "data":{"connected": True, 'token':token}, "message": None}
		except:
			self.connected = False
			response = {"status":500, "data":{"connected": False}, "message": "Unable to connect to database"}
		
		self.write(response)
		
class Register(web.RequestHandler):
	@gen.coroutine
	def post(self):
	
		data = tornado.escape.json_decode(self.request.body)
		
		ioloop = IOLoop.current()
		self.connected = False
		admin = momoko.Pool(
			dsn='dbname=postgres user=postgres password=kolbykolby '
				'host={0} port=5432'.format(os.getenv('POSTGRESQL_SERVICE_HOST')),
			size=1,
			ioloop=ioloop,
			cursor_factory=psycopg2.extras.RealDictCursor,
		)
		future = admin.connect()
		
		cursor = yield admin.execute("""SELECT u.usename AS "username",
			  u.usesysid AS "User ID",
			  CASE WHEN u.usesuper AND u.usecreatedb THEN CAST('superuser, create
			database' AS pg_catalog.text)
				   WHEN u.usesuper THEN CAST('superuser' AS pg_catalog.text)
				   WHEN u.usecreatedb THEN CAST('create database' AS
			pg_catalog.text)
				   ELSE CAST('' AS pg_catalog.text)
			  END AS "Attributes"
			FROM pg_catalog.pg_user u
			ORDER BY 1;""")
			
		all = cursor.fetchall();
		
		for user in all:
			if user['username'] == data['username']:
				self.write("Invalid Username")
				return
		
		cursor = yield admin.execute("""SELECT datname FROM pg_database
			WHERE datistemplate = false;""")
			
		all = cursor.fetchall();
		
		for db in all:
			if db['datname'] == data['database']:
				self.write("Invalid Database name")
				return
		
		try:
			cursor = yield admin.execute("""CREATE USER {0} WITH PASSWORD '{1}';""".format(data['username'],data['password']))
		except psycopg2.Error as e:
			self.write(e.diag.message_primary)
			return
			
		try:
			cursor = yield admin.execute("""CREATE DATABASE {0} OWNER {1};""".format(data['database'],data['username']))
		except psycopg2.Error as e:
			self.write(e.diag.message_primary)
			return
			
		self.write("User and database created")
		

		
if __name__ == '__main__':
	parse_command_line()
	
	settings = {
	"debug": True,
	"template_path": "templates",
	"static_path": ""
	}
	
	root = os.path.dirname(__file__)
	print(root)
	
	#h = [(r"/(.*)", web.StaticFileHandler, {"path": root, "default_filename": "index.html"})]
	#h.extend(handlers.default_handlers)	

	application = tornado.wsgi.WSGIApplication([
		(r'/accounts/getaccs', handlers.accountHandler.AccountsHandler),
		(r'/API/Schema', handlers.manageHandler.SchemaHandler),
		(r'/API/Schema/(.*)', handlers.manageHandler.SchemaHandler),
		(r'/API/Table/(.*)', handlers.manageHandler.TableHandler),
		(r'/API/Export/(.*)',Export),
		(r'/Login',Login),
		(r'/Register',Register),
		(r'/db',PSQL),
		(r'/API',API),
		(r'/testing',testing),
		(r'/',Home),
		(r"/(.*)", web.StaticFileHandler, {"path": root, "default_filename": "index.html"})]
	, **settings)

	application.db = {}
	
	# web.StaticFileHandler, {"path": root, "default_filename": "index.html"})]
	ioloop = IOLoop.instance()
	
	http_server = HTTPServer(application)
	http_server.listen(8080, '0.0.0.0')
	ioloop.start()
	