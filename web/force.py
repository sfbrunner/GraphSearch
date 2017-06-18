import sys
import os
import networkx
from flask import Flask
from flask import flash
from flask import render_template
from flask import jsonify
from flask import request
from flask import session
from flask import url_for, redirect
import json
import networkx
from networkx.readwrite import json_graph
sys.path.append('lib')
from lib.ConnectEutils import ConnectEutils
from lib.ResultGraph import ResultGraph
from lib.GraphSession import GraphSession
#import ConnectEutils

#eutils = ConnectEutils.ConnectEutils()
eutils = ConnectEutils()
app = Flask(__name__)
app.secret_key = 'big_secret'

@app.route('/')
def homepage():
    return render_template("main.html")
  #print sys.version
  #return 'Hello from Flask!'
  #return os.getcwd()
  #return render_template('force/force.html')
  #return app.send_static_file('force.html')
  #return render_template("index.html")

@app.route('/d3')
def homepage_d3():
    return render_template("main_d3.html")
  #print sys.version
  #return 'Hello from Flask!'
  #return os.getcwd()
  #return render_template('force/force.html')
  #return app.send_static_file('force.html')
  #return render_template("index.html")

@app.route('/dashboard/', methods=["GET", "POST"])
def dashboard():
    return render_template("dashboard.html")

@app.route('/dashboard_d3/', methods=["GET", "POST"])
def dashboard_d3():
    return render_template("dashboard_d3.html")

@app.route("/_graphdata")
def graphdata():
    userInput = request.args.get('searchInput', '', type=str)
    print "User input: "
    print userInput
    graphSession = GraphSession()
    citations = graphSession.get_citations_from_fulltext(userInput)
    resultGraph = ResultGraph()
    resultGraph.populate_from_cite_dict(citations)
    resultGraph.extract_by_connectivity(connectivity=1)
    resultGraph.extract_by_connectivity(connectivity=0)
    metadataList = graphSession.get_metadataList_from_idList(resultGraph.nodeIds)
    resultGraph.add_metadata_to_graph(metadataList)
    return resultGraph.get_cy_json()

@app.route("/_graphdata_d3")
def graphdata_d3():
    print "User input: D3 pre"
    searchInput = request.args.get('searchInput', '', type=str)
    print "User input: D3"
    print searchInput
    graphSession = GraphSession()
    citations = graphSession.get_citations_from_fulltext(searchInput)
    resultGraph = ResultGraph()
    resultGraph.populate_from_cite_dict(citations)
    return jsonify(result = resultGraph.get_graph())

@app.route("/test")
def render_form():
    return render_template("input_form.html")

@app.route('/test', methods=['GET','POST'])
def my_form_post():
    text = request.form['text']
    processed_text = text.upper()
    session['form_test'] = processed_text
    print 'Form received.'
    return processed_text
    #out_lst = eutils.get_cited_PMID(str(text))
    #return str(out_lst)#render_template("form_output.html")

@app.route("/graphtest")
def graphtest_form():
    return render_template("graphtest_form.html")

@app.route('/graphtest', methods=['GET','POST'])
def graphtest_process_form():
    session['search_request'] = request.form['text']
    #return str(graphsession.cite_dict)
    #return str(session.get('graphsession',False))
    return render_template('graphtest_output.html')
    #return redirect(url_for('graphtest_output'))

@app.route('/graphtest_data')
def graphtest_data():
    # Get list of citations for pmid
    searchRequest = session.get('search_request', False)
    citationDict = GraphSession.getCitationsFromPMIDString(searchRequest)
    # Create mockup of second publication
    #mock = graphsession.cite_dict.copy()
    #for pmid in mock:
    #    graphsession.cite_dict['123'] = mock[pmid]
    #cite_lst = eutils.get_cited_PMID(str(pmid))
    # Initialise ResultGraph object
    resultgraph = ResultGraph()
    resultgraph.populate_from_cite_dict(citationDict)
    #resultgraph.add_publication(pmid, cite_lst)
    #G = networkx.complete_graph(10)
    #d = json_graph.node_link_data(G)
    #return jsonify(d)
    return resultgraph.get_json()

@app.route("/exampleData")
def getExampleData():
    userInput = "27729734,27785449,25995680"
    print userInput
    graphSession = GraphSession()
    citations = graphSession.getCitationsFromPMIDString(userInput)
    resultGraph = ResultGraph()
    resultGraph.populate_from_cite_dict(citations)
    return resultGraph.get_cy_json()

@app.route("/exampleData_d3")
def getExampleData_d3():
    userInput = "27729734,27785449,25995680"
    graphSession = GraphSession()
    citations = graphSession.getCitationsFromPMIDString(userInput)
    resultGraph = ResultGraph()
    resultGraph.populate_from_cite_dict(citations)
    return resultGraph.get_json()

@app.route("/cytotest")
def cytotest():
    return render_template("cytotest.html")

@app.route("/dashboard_cy")
def dashboard_cy():
    return render_template("dashboard_cy.html")

@app.route("/cyto_json")
def cyto_json():
    return render_template("cyto_json.html")

@app.route("/cy_json_data")
def cy_json_data():
    userInput = "27729734,27785449,25995680"
    graphSession = GraphSession()
    citations = graphSession.getCitationsFromPMIDString(userInput)
    resultGraph = ResultGraph()
    resultGraph.populate_from_cite_dict(citations)
    return resultGraph.get_cy_json()



if __name__ == '__main__':
  app.run()
