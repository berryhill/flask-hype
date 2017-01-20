# from __future__ import unicode_literals
import os
from builtins import str
import sqlite3 as sql
from flask import Flask, render_template, request, jsonify
from flask.ext import assets
import beatport
import json

app = Flask(__name__)

env = assets.Environment(app)

env.load_path = [
    os.path.join(os.path.dirname(__file__), 'sass'),
    os.path.join(os.path.dirname(__file__), 'bower_components'),
    os.path.join(os.path.dirname(__file__ ), 'js'),
    os.path.join(os.path.dirname(__file__ ), 'js/lib')
]

bootstrap = assets.Bundle('bootstrap-sass/assets/stylesheets/_bootstrap.scss', filters='scss', output='bootstrap.scss')
sass = assets.Bundle('*.sass', filters='sass', output='sass.css')
scss = assets.Bundle('*.scss', filters='scss', output='scss.css')

env.register(
    'css_all',
    assets.Bundle(   bootstrap,
                     scss,
                     sass,
                     filters='cssmin',
                     output="all.css")
    )

env.register(
    'js_all',
    assets.Bundle(
        'jquery/dist/jquery.min.js',
        'underscore-min.js',
        'backbone-min.js',
        'app.js',
        output='all.js'
    )
)

@app.route('/api/<args>')
def getReleases(args):
    try:
        bp = beatport.API()
        bp.start()
        ids = ','.join(['43949','8190'])
        data = {'ids':ids}
        #'catalog/3/releases'
        response = bp.request('catalog/3/' + args, data)
        return render_template("list2.html", response=response)

    except Exception as e:
        print e
        raise

@app.route('/')
def home():
   con = sql.connect("demo.db")
   con.row_factory = sql.Row
   cur = con.cursor()
   cur.execute("select * from students")
   rows = cur.fetchall();

   return render_template("list.html",rows = rows, stuff="stuff & things")

@app.route('/enternew')
def new_student():
   return render_template('new.html')

@app.route('/addrec',methods = ['POST', 'GET'])
def addrec():
   if request.method == 'POST':
      try:
         nm = request.form['nm']
         addr = request.form['add']
         city = request.form['city']
         pin = request.form['pin']

         with sql.connect("demo.db") as con:
            c = con.cursor()
            c.execute("INSERT INTO students VALUES (?,?,?,?)", (nm,addr,city,pin) )
            con.commit()
            msg = "Record successfully added"
      except:
         con.rollback()
         msg = "error in insert operation"

      finally:
         return render_template("result.html",msg = msg)
         con.close()

         # CREATE SQLITE TABLE
         # >>> import sqlite3
         # >>> conn = sqlite3.connect('demo.db')
         # >>> conn.execute('CREATE TABLE students (name TEXT, addr TEXT, city TEXT, pin TEXT)')
         # <sqlite3.Cursor object at 0x7fddfc07a1f0>
         #export FLASK_APP=app.py

# @app.route('')
