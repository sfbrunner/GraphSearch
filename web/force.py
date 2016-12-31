import sys
import os
import networkx
from flask import Flask
from flask import render_template
from flask import jsonify
from flask import request
from flask import session
import json
import networkx
from networkx.readwrite import json_graph
import ConnectEutils

eutils = ConnectEutils.ConnectEutils()
app = Flask(__name__)
app.secret_key = 'big_secret'

@app.route('/')
def hello_world():
  print sys.version
  #return 'Hello from Flask!'
  #return os.getcwd()
  #return render_template('force/force.html')
  #return app.send_static_file('force.html')
  return render_template("index.html")

@app.route("/test")
def render_form():
  return render_template("input_form.html")

@app.route('/test', methods=['GET','POST'])
def my_form_post():
    text = request.form['text']
    processed_text = text.upper()
    session['form_test'] = processed_text
    print 'Form received.'
    out_lst = eutils.get_cited_PMID(str(text))
    return str(out_lst)#render_template("form_output.html")

@app.route("/data")
def get_data():
  print 'Fetching data..'
  #G = networkx.barbell_graph(100,10)
  num_nodes = session.get('form_test', 2)
  G = networkx.complete_graph(int(num_nodes))
  #G.add_edge([(1,2),(1,3),(1,5)])
  # this d3 example uses the name attribute for the mouse-hover value,
  # so add a name to each node
  for n in G:
    G.node[n]['name'] = n
  # write json formatted data
  d = json_graph.node_link_data(G)
  return jsonify(d)

if __name__ == '__main__':
  app.run()
