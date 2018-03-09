import React, { Component } from 'react';
import { slide as Menu } from 'react-burger-menu'
import { keys, map, isArray, sortBy } from 'lodash'
import FRC, { Checkbox, CheckboxGroup, Input, RadioGroup, Row as FormsyRow, Select, File, Textarea } from 'formsy-react-components'
import numeral from 'numeral'
import request from 'superagent'
import { render } from 'react-dom'
import { Image, Grid, Col, Clearfix, Row } from 'react-bootstrap'
import { CytoMain } from './cytoComponents'
import { MainCyto } from './reactcytocomp.js'
import { MainSigma } from './reactsigmacomp.js'
import ReactVisComp from './reactviscomp.js'
import { DataUIMain } from './searchcomponents.js'
//import { Graph } from 'react-d3-graph'
import ReactToolip from 'react-tooltip'
import { Tooltip } from 'react-lightweight-tooltip'
//var $ = require('jquery');
import { Network, WithTooltip, Nodes, Links } from '@data-ui/network'
import Graph from 'react-graph-vis';
import { Graph as D3Graph } from 'react-d3-graph';
import ReactCytoscapeWrapper from './reactwrapper.js';
import {findDOMNode} from 'react-dom';

// the graph configuration, you only need to pass down properties
// that you want to override, otherwise default ones will be used
const myConfig = {
    nodeHighlightBehavior: true,
    node: {
        color: 'lightgreen',
        size: 120,
        highlightStrokeColor: 'blue'
    },
    link: {
        highlightColor: 'lightblue'
    },
    staticGraph: false
};

class MyTooltip extends Component {

    render(){
        return (
            <div>
            <p data-tip="hello world">Tooltip</p>
            <ReactTooltip /> 
            </div>
        );
        }
}

// graph event callbacks
const onClickNode = function(nodeId) {
     //window.alert(`Clicked node ${nodeId}.fill`);
     //document.getElementById(nodeId)
     //return <MyTooltip/>
     console.log(nodeId)
     
};

const onMouseOverNode = function(nodeId) {

     //window.alert(`Mouse over node ${nodeId}`);
};

const onMouseOutNode = function(nodeId) {
     //window.alert(`Mouse out node ${nodeId}`);
};

const onClickLink = function(source, target) {
     //window.alert(`Clicked link between ${source} and ${target}`);
};

const onMouseOverLink = function(source, target) {
     //window.alert(`Mouse over in link between ${source} and ${target}`);
};

const onMouseOutLink = function(source, target) {
     //window.alert(`Mouse out link between ${source} and ${target}`);
};

var divContentLanding = {
    contenttest: {
        position: 'relative',
        left: '20%',
        right: '20%',
        top: '36px',
        height: '1000px',
        border: '3px',
        borderColor: 'black',
        borderStyle: '',
    },
    contenttest2: {
        position: 'relative',
        height: '1000px',
        border: '3px',
        borderColor: 'black',
        borderStyle: '',
    },
    marginfree: {
        marginLeft: '0px'
    },
    contentdiv: {
        position:'relative',
        top:'30%'
    },
    h2: {
        verticalAlign:'bottom',
        lineHeight:'30px',
        position:'relative',
        top:'100%',
        textAlign:'center'
    },
    p: {
        textAlign:'center',
        color:'gray'
    }
}

var divContentSearch = {
    contenttest: {
        left: '10%',
        right: '10%',
        height: '300px',
        border: '3px',
        borderColor: 'black',
        borderStyle: '',
    },
    marginfree: {
        marginLeft: '0px'
    },
    h2: {
        marginLeft:'-30px',
        verticalAlign:'top',
        lineHeight:'30px',
        position:'fixed',
        top:'5px'
    }
}

const Request = ({ onSubmit }) => (
   <FRC.Form onSubmit={onSubmit}>
       <fieldset>
		   <Input name="search_string" layout="vertical" id="search_string" value="epigenetics idh oncogenic" type="text" help="Let us create a network of your search results." addonAfter={<span type="submit" className="glyphicon glyphicon-search" defaultValue="Submit"/>} />
	   </fieldset>
   </FRC.Form>
)

const Pending = ({ id }) => <h2>Pending #{id}</h2>
const rootUrl = new URL(window.location.origin)
rootUrl.port = 8080
const apiUrl = new URL("/api/", rootUrl)

class MainVis extends Component {    
    constructor(props) {
        super(props);
        this.state = { results: {}, pending: {}, selectedNodes: ["zuppp"] };
        this.onSubmit = this.onSubmit.bind(this);
        this.getEvents = this.getEvents.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.getNodeInfo = this.getNodeInfo.bind(this);
        
    }

    poll(id) {
        return () => {
            request.get(new URL(id, apiUrl))
            .end( (err, res) => { // call api with id -> will return task_id and if ready result
                if (err) return
                const { result } = res.body
                if (!result) return
                const { results, pending } = this.state
                clearInterval(pending[id])
                delete pending[id]
                this.setState({ results: { ...results, [id]: result }, data: result})
            })
        }
    }

    onSubmit({ search_string }) {
        const payload = { 'search_string': search_string, 'graph_format': 'visjs' }
        request.put(apiUrl).send(payload)
        .end( (err, res) => {
            if (err) return
            console.log(this.state)
            const { results, pending } = this.state
            console.log(res.body)
            const { result: id } = res.body
            const timers = {[id]:  setInterval(this.poll(id),  500)}
            this.setState({ pending: {...pending, ...timers} })
        })
    }
    
    getGraph() {
        return {
            nodes: [
                { id: 1, label: 'Node 1', title: 'NodeT 1' },
                { id: 2, label: 'Node 2', title: 'NodeT 2' },
                { id: 3, label: 'Node 3', title: 'NodeT 3' },
                { id: 4, label: 'Node 4', title: 'NodeT 4' },
                { id: 5, label: 'Node 5', title: 'NodeT 5' }
            ],
            edges: [
                { from: 1, to: 2 },
                { from: 1, to: 3 },
                { from: 2, to: 4 },
                { from: 2, to: 5 }
            ]
        };
    }

    getOptions() {
        return {
            edges: {
                color: "#000000"
            },
            nodes: {
                color: "red"
            },
			layout: {
				improvedLayout: false,
				scale: 0.1
			},
            physics:{
                enabled: true,
				solver: 'barnesHut',
				scale: 0.1,
                barnesHut: {
                  gravitationalConstant: -2000,
                  springLength: 10,
                  springConstant: 0.01
                },
				forceAtlas2Based: {
					gravitationalConstant: -50,
					centralGravity: 0.01,
					springConstant: 0.08,
					springLength: 100,
					damping: 0.4,
					avoidOverlap: 0.5
				},
				repulsion: {
					centralGravity: 0.2,
					springLength: 200,
					springConstant: 0.05,
					nodeDistance: 100,
					damping: 0.09
				},
				hierarchicalRepulsion: {
					centralGravity: 0.0,
					springLength: 100,
					springConstant: 0.01,
					nodeDistance: 120,
					damping: 0.09
				},
				stabilization: {
					enabled: false,
					iterations: 1000,
					updateInterval: 25
				}
            },
            interaction: {
                hover: true,
                tooltipDelay: 1
            }
        };
    }

    handleClick(event){
        console.log(event);
        if(true){
            //this.setState({ selectedNodes: [event.currentTarget.innerText] });
            //this.state.selectedNodes[0] = event.target.data('title');
            console.log("in if branch");
        }
    }

    getNodeInfo = () => {
        console.log("inside getNodeInfo");
        //console.log(this.state);
        return this.state.selectedNodes[0];
    }

    getEvents() {
        console.log("brazz");
        console.log(this.state);
        var boundEventHandler = function(binding) {
            return function(event) {
                var { nodes, edges, center } = event;
                var node = binding.state.data.nodes.filter(function(obj) {return obj.id == nodes[0]})[0];
                binding.state.selectedNodes[0] = '<b><a href="https://www.ncbi.nlm.nih.gov/pubmed/' + node.id + 
                '" target="_blank">' + node.title + '</b></a>' +
                '<br><i>' + node.journal +
                '</i><br><i>' + node.pubDate + '</i>' +
                '<br>' + node.authors
            }
        }
        return {
            select: boundEventHandler(this),
            hold: function (event) {
                    var { nodes, edges, center } = event;
                     console.log(nodes);
            // select: function (event) {
            //     var { nodes, edges, center } = event;
            //     console.log(nodes);
                //document.getElementById("mainVis").setState({ selectedNodes: { nodes } });
                //this.setState({ selectedNodes: { nodes } });
            }
        };
    }

    renderTooltip () {
        return this.selectedNodes[0]
      };

    render() {
        const { results, pending } = this.state

          const tooltipData = {
              event: "click",
              index: 1,
              id: 2,
              data: 3 
          };
        return (
            <div className="row">
                <Request onSubmit={this.onSubmit} />
                    { map(sortBy(keys(pending), [x => -x]), id => <Pending key={id} id={id} />) }  
                <div style={{width:"1000px", height:"1000px"}} data-tip data-for='nodeTooltip' data-html={true} >
                <ReactToolip ref="nodeTooltip" id="nodeTooltip" event="click" getContent={this.getNodeInfo} isCapture={true} />
                    { map(sortBy(keys(results), [x => -x]), id => <Graph graph={results[id]} options={this.getOptions()} events={this.getEvents()} />) }
                </div>
            </div>
        )
    }
}

class MainReactD3Graph extends Component {
    constructor(props) {
        super(props);
        this.state = { results: {}, pending: {} };
        this.onSubmit = this.onSubmit.bind(this)   
    }

    poll(id) {
        return () => {
            request.get(new URL(id, apiUrl))
            .end( (err, res) => { // call api with id -> will return task_id and if ready result
                if (err) return
                const { result } = res.body
                if (!result) return
                const { results, pending } = this.state
                clearInterval(pending[id])
                delete pending[id]
                this.setState({ results: { ...results, [id]: result } })
            })
        }
    }

    onSubmit({ search_string }) {
        const payload = { 'search_string': search_string, 'graph_format': 'reactd3graph' }
        request.put(apiUrl).send(payload)
        .end( (err, res) => {
            if (err) return
            console.log(this.state)
            const { results, pending } = this.state
            console.log(res.body)
            const { result: id } = res.body
            const timers = {[id]:  setInterval(this.poll(id),  500)}
            this.setState({ pending: {...pending, ...timers} })
        })
    }

    getEvents() {
        return {
            select: function (event) {
                var { nodes, edges } = event;
                console.log(event);
                <TestTooltip />
            }
        };
    }

    render() {
        const { results, pending } = this.state
        
        const myConfig = {
            nodeHighlightBehavior: true,
            node: {
                color: 'lightgreen',
                size: 120,
                highlightStrokeColor: 'blue'
            },
            link: {
                highlightColor: 'lightblue'
            }
        };

        return (
            <div className="row">
                <div style={{width:"1000px", height:"1000px"}}>
                    <Request onSubmit={this.onSubmit} />
                    { map(sortBy(keys(pending), [x => -x]), idg => <Pending key={idg} id={idg} />) }         
                    { map(sortBy(keys(results), [x => -x]), idg => 
                        <D3Graph 
                        id='reactd3graph'
                        data={results[idg]}
                        config={myConfig} /> 
                    ) }
                </div>
            </div>
        )
    }
}


var searchedNodeStyle = {
    selector: "node[group = 'Searched']",
    style: {
        'label': 'data(group)',
        'width': '20px',
        'height': '20px',
        'color': 'white',
        'background-fit': 'contain',
        'background-clip': 'none',
        'background-color': 'blue',
        'border-color': 'gray',
        'border-width': 0.5,
        'opacity': 0.8,
        'font-size': '3pt',
        'text-transform': 'uppercase',
        //'text-background-color': 'white',
        //'text-background-opacity': 0.8,
        //'text-background-shape': 'roundrectangle',
        //'text-outline-color': 'white',
        "text-valign" : "center"
    },
}

var citedNodeStyle = {
    selector: "node[group = 'Cited']",
    style: {
        'label': 'data(group)',
        'width': '15px',
        'height': '15px',
        'color': 'white',
        'background-fit': 'contain',
        'background-clip': 'none',
        'background-color': 'red',
        'border-color': 'gray',
        'border-width': 0.5,
        'opacity': 0.8,
        'font-size': '3pt',
        'text-transform': 'uppercase',
        //'text-background-color': 'white',
        //'text-background-opacity': 0.8,
        //'text-background-shape': 'roundrectangle',
        //'text-outline-color': 'white',
        "text-valign" : "center"
    }
}

var edgeStyle = {
    selector: 'edge',
    style: {
        'text-background-color': 'yellow',
        'text-background-opacity': 0.4,
        'width': '2px',
        'target-arrow-shape': 'triangle',
        'control-point-step-size': '140px',
        'opacity': 0.5
    }
}

var cytoStyleWrapper = [ citedNodeStyle, searchedNodeStyle, edgeStyle ]

export class MainReactCytoWrapper extends Component {
    constructor(props) {
        super(props);
        this.state = { results: {}, pending: {} };
        this.onSubmit = this.onSubmit.bind(this)   
    }

    poll(id) {
        return () => {
            request.get(new URL(id, apiUrl))
            .end( (err, res) => { // call api with id -> will return task_id and if ready result
                if (err) return
                const { result } = res.body
                if (!result) return
                const { results, pending } = this.state
                clearInterval(pending[id])
                delete pending[id]
                this.setState({ results: { ...results, [id]: result } })
            })
        }
    }

    onSubmit({ search_string }) {
        const payload = { 'search_string': search_string, 'graph_format': 'cytoscape' }
        request.put(apiUrl).send(payload)
        .end( (err, res) => {
            if (err) return
            console.log(this.state)
            const { results, pending } = this.state
            console.log(res.body)
            const { result: id } = res.body
            const timers = {[id]:  setInterval(this.poll(id),  500)}
            this.setState({ pending: {...pending, ...timers} })
        })
    }

    render() {
        const { results, pending } = this.state

          const renderTooltip = function( obj ){
            var { event, index, id, data } = obj;
            console.log(data);
            var url = "https://www.ncbi.nlm.nih.gov/pubmed/" + data.id + "target=_blank"
            return <div width="150px"><b><a href={url}> {data.title}</a></b><br/><i> {data.journal}</i><br/><i> {data.pubDate} </i> <br/>{data.authors}</div>
          };

          const tooltipData = {
              event: "click",
              index: 1,
              id: 2,
              data: 3 
          };
        return (
            <div className="row">
                <div style={{width:"1000px", height:"1000px"}}>
                    <Request onSubmit={this.onSubmit} />
                    { map(sortBy(keys(pending), [x => -x]), id => <Pending key={id} id={id} />) }         
                    { map(sortBy(keys(results), [x => -x]), id => <ReactCytoscapeWrapper containerID="cy" 
                      elements={ results[id] } 
                      cyRef={(cy) => { this.cy = cy; console.log(this.cy) }} 
                      cytoscapeOptions={{wheelSensitivity: 0.1, minZoom: 0.1, maxZoom: 2.0, zoomingEnabled: true, userZoomingEnabled: true}} 
                      style= { cytoStyleWrapper }
                      layout={{name: 'cytoscape-ngraph.forcelayout', async: {
                          // tell layout that we want to compute all at once:
                          maxIterations: 1000,
                          stepsPerCycle: 30,
                  
                          // Run it till the end:
                          waitForStep: false
                      },
                      physics: {
                          /**
                           * Ideal length for links (springs in physical model).
                           */
                          springLength: 100,
                  
                          /**
                           * Hook's law coefficient. 1 - solid spring.
                           */
                          springCoeff: 0.0008,
                  
                          /**
                           * Coulomb's law coefficient. It's used to repel nodes thus should be negative
                           * if you make it positive nodes start attract each other :).
                           */
                          gravity: -1.2,
                  
                          /**
                           * Theta coefficient from Barnes Hut simulation. Ranged between (0, 1).
                           * The closer it's to 1 the more nodes algorithm will have to go through.
                           * Setting it to one makes Barnes Hut simulation no different from
                           * brute-force forces calculation (each node is considered).
                           */
                          theta: 0.8,
                  
                          /**
                           * Drag force coefficient. Used to slow down system, thus should be less than 1.
                           * The closer it is to 0 the less tight system will be.
                           */
                          dragCoeff: 0.02,
                  
                          /**
                           * Default time step (dt) for forces integration
                           */
                          timeStep: 20,
                          iterations: 10000,
                          fit: true,
                  
                          /**
                           * Maximum movement of the system which can be considered as stabilized
                           */
                          stableThreshold: 0.000009
                      },
                      iterations: 10000,
                      refreshInterval: 16000, // in ms
                      refreshIterations: 100000, // iterations until thread sends an update
                      stableThreshold: 2,
                      animate: true,
                      fit: true}} />
                        ) }
                </div>
            </div>
        )
    }
}

class MainReactCytoWrapper_old extends Component {
    constructor(props) {
        super(props);
        this.state = { results: {}, pending: {} };
        this.onSubmit = this.onSubmit.bind(this)   
    }

    getElements() {
        return {
            nodes: [
                { data: { id: 'a', parent: 'b' }, position: { x: 215, y: 85 } },
                { data: { id: 'b' } },
                { data: { id: 'c', parent: 'b' }, position: { x: 300, y: 85 } },
                { data: { id: 'd' }, position: { x: 215, y: 175 } },
                { data: { id: 'e' } },
                { data: { id: 'f', parent: 'e' }, position: { x: 300, y: 175 } }
            ],
            edges: [
                { data: { id: 'ad', source: 'a', target: 'd' } },
                { data: { id: 'eb', source: 'e', target: 'b' } }
            ]
        };
    }

    cyRef(cy) {
		this.cy = cy;
		cy.on('tap', 'node', function (evt) {
			var node = evt.target;
			console.log('tapped ' + node.id());
		});
	}
    
    poll(id) {
        return () => {
            request.get(new URL(id, apiUrl))
            .end( (err, res) => { // call api with id -> will return task_id and if ready result
                if (err) return
                const { result } = res.body
                if (!result) return
                const { results, pending } = this.state
                clearInterval(pending[id])
                delete pending[id]
                this.setState({ results: { ...results, [id]: result } })
            })
        }
    }

    onSubmit({ search_string }) {
        const payload = { 'search_string': search_string, 'graph_format': 'visjs' }
        request.put(apiUrl).send(payload)
        .end( (err, res) => {
            if (err) return
            console.log(this.state)
            const { results, pending } = this.state
            console.log(res.body)
            const { result: id } = res.body
            const timers = {[id]:  setInterval(this.poll(id),  500)}
            this.setState({ pending: {...pending, ...timers} })
        })
    }
    
    getGraph() {
        return {
            nodes: [
                { id: 1, label: 'Node 1', title: 'NodeT 1' },
                { id: 2, label: 'Node 2', title: 'NodeT 2' },
                { id: 3, label: 'Node 3', title: 'NodeT 3' },
                { id: 4, label: 'Node 4', title: 'NodeT 4' },
                { id: 5, label: 'Node 5', title: 'NodeT 5' }
            ],
            edges: [
                { from: 1, to: 2 },
                { from: 1, to: 3 },
                { from: 2, to: 4 },
                { from: 2, to: 5 }
            ]
        };
    }

    getOptions() {
        return {
            edges: {
                color: "#000000"
            },
            nodes: {
                color: "red"
            },
			layout: {
				improvedLayout: false,
				scale: 0.1
			},
            physics:{
                enabled: true,
				solver: 'barnesHut',
				scale: 0.1,
                barnesHut: {
                  gravitationalConstant: -2000,
                  springLength: 10,
                  springConstant: 0.01
                },
				forceAtlas2Based: {
					gravitationalConstant: -50,
					centralGravity: 0.01,
					springConstant: 0.08,
					springLength: 100,
					damping: 0.4,
					avoidOverlap: 0.5
				},
				repulsion: {
					centralGravity: 0.2,
					springLength: 200,
					springConstant: 0.05,
					nodeDistance: 100,
					damping: 0.09
				},
				hierarchicalRepulsion: {
					centralGravity: 0.0,
					springLength: 100,
					springConstant: 0.01,
					nodeDistance: 120,
					damping: 0.09
				},
				stabilization: {
					enabled: false,
					iterations: 1000,
					updateInterval: 25
				}
            },
            interaction: {
                hover: true,
                tooltipDelay: 1
            }
        };
    }

    getEvents() {
        return {
            select: function (event) {
                var { nodes, edges } = event;
                console.log(event);
                <TestTooltip />
            }
        };
    }

    render() {
        return(
            <ReactCytoscapeWrapper containerID="cy" 
                elements={ this.getElements() } 
                cyRef={(cy) => { this.cyRef(cy) }} 
                cytoscapeOptions={{wheelSensitivity: 0.1}} 
                layout={{name: 'cytoscape-ngraph.forcelayout', async: {
                    // tell layout that we want to compute all at once:
                    maxIterations: 1000,
                    stepsPerCycle: 30,
            
                    // Run it till the end:
                    waitForStep: false
                },
                physics: {
                    /**
                     * Ideal length for links (springs in physical model).
                     */
                    springLength: 100,
            
                    /**
                     * Hook's law coefficient. 1 - solid spring.
                     */
                    springCoeff: 0.0008,
            
                    /**
                     * Coulomb's law coefficient. It's used to repel nodes thus should be negative
                     * if you make it positive nodes start attract each other :).
                     */
                    gravity: -1.2,
            
                    /**
                     * Theta coefficient from Barnes Hut simulation. Ranged between (0, 1).
                     * The closer it's to 1 the more nodes algorithm will have to go through.
                     * Setting it to one makes Barnes Hut simulation no different from
                     * brute-force forces calculation (each node is considered).
                     */
                    theta: 0.8,
            
                    /**
                     * Drag force coefficient. Used to slow down system, thus should be less than 1.
                     * The closer it is to 0 the less tight system will be.
                     */
                    dragCoeff: 0.02,
            
                    /**
                     * Default time step (dt) for forces integration
                     */
                    timeStep: 20,
                    iterations: 10000,
                    fit: true,
            
                    /**
                     * Maximum movement of the system which can be considered as stabilized
                     */
                    stableThreshold: 0.000009
                },
                iterations: 10000,
                refreshInterval: 16000, // in ms
                refreshIterations: 100000, // iterations until thread sends an update
                stableThreshold: 2,
                animate: false,
                fit: true}} />
        );
    }
}

export class SearchLanding extends Component {
	render() {
		return (
		  		<Grid>
				  <Row className="show-grid">
				    <Col md={8} xs={6}>
				        <div class="col-xs-12" style={{height:"2vh"}}></div>
				    </Col>
				  </Row>
				  <Row className="show-grid">
				  <Col md={8} xs={12}>
            		<h2 style={divContentLanding.h2}>GraphSearch</h2>
					<p></p>
					<p style={divContentLanding.p}>Welcome to the GraphSearch platform. Our mission is to make your biomedical literature search experience the best it can be. We take your search query and return a network of publications to you. The network contains the direct results of your search (in blue) as well as the publications they cite (in red). The structure of the network helps you to find highly cited publications and quickly identify publications that belong together.</p>
				    </Col>
				    </Row>
				<Row className="show-grid">
                    <Col md={8} xs={12}>
                        <CytoMain/>
                    </Col>
				</Row>
				</Grid>
		)
	}
}

export class SearchActive extends Component {
	render() {
		return (
            <Grid>
                <Row className="show-grid">
                    <Col md={8} xs={12}>
                        <h2>SearchActive</h2>
                    </Col>
                </Row>
                <Row className="show-grid">
                    <Col md={8} xs={12} style={{marginLeft:"20px"}}>
                        <Main />
                    </Col>
                </Row>
            </Grid>
	) }
}

export class About extends Component {
	render() {
		return (
            <Grid>
                <Row className="show-grid">
                    <Col md={8} xs={12}>
                        <h2>About</h2>
                    </Col>
                </Row>
                <Row className="show-grid"><Col md={8} xs={12}>
                <p>{"We are a team of two: Ravi Mishra and Simon Brunner. Our mission is to improve how we explore the biomedical literature. As a researcher, you are used to receiving search results in the form of lists. In some cases, that is all you need. In many cases, a list hides a lot of information. What if you knew how each research publication connects with others through citations and authors? Can we help you find what you are looking for by displaying search results in the form of a network? Currently, it is our hypothesis that we can. Please let us know if we are succeeding or if you have other thoughts about our mission and project: contact@contact.com"}</p>
                </Col></Row>
                <div class="col-xs-12" style={{height:"20px"}}></div>
                <Row className="show-grid"><Col md={8} xs={12}>
				<Image src="/static/images/image_about.JPG" responsive />
                </Col></Row>
				<div class="col-xs-12" style={{height:"30px"}}></div>
                <Row className="show-grid"><Col md={8} xs={12}>
				<p><strong><a href="https://www.linkedin.com/in/ravi-mishra-1a2160153/" target="_blank">Ravi Mishra.</a> </strong>{"Ravi holds a Bachelor's degree in Economics from the University of Zurich. Realising that all the smart jobs go to mathematicians, he went on to obtain a Bachelor's in Math from the University of Zurich and a Master's in Math from ETH Zurich. He currently pursues a technical graduate training program at a leading finance institution in Zurich, Switzerland."}</p>
				</Col></Row>
                <Row className="show-grid"><Col md={8} xs={12}>
                <p><strong><a href="https://www.linkedin.com/in/simon-brunner-3631521a/" target="_blank">Simon Brunner.</a> </strong>{"Simon holds a Bachelor's degree in Biochemistry and a Master's degree in Systems Biology from ETH Zurich. He then pursued doctoral studies at the Lab of Molecular Biology (MRC-LMB) in Cambridge, United Kingdom and graduated with a PhD from the University of Cambridge. He currently pursues post-doctoral research at The Sanger Wellcome Trust Institute in Cambridge, UK."}</p>
                </Col></Row>
            </Grid>
	) }
}

export class ReactCytoDisp extends Component {
	render() {
		return (
            <Grid>
                <Row className="show-grid">
                    <Col md={8} xs={12}>
                        <div style={{width:"1000px", height:"1000px"}}>
                            <MainCyto/>
                        </div>
                    </Col>
                </Row>
            </Grid>
	) }
}

export class ReactCytoWrapperDisp extends Component {
	render() {
		return (
            <Grid>
                <Row className="show-grid">
                    <Col md={8} xs={12}>
                        <div style={{width:"1000px", height:"1000px"}}>
                            <MainReactCytoWrapper/>
                        </div>
                    </Col>
                </Row>
            </Grid>
	) }
}

export class ReactD3GraphDisp extends Component {
	render() {
		return (
            <Grid>
                <Row className="show-grid">
                    <Col md={8} xs={12}>
                        <div style={{width:"1000px", height:"1000px"}}>
                            <MainReactD3Graph/>
                        </div>
                    </Col>
                </Row>
            </Grid>
	) }
}

export class ReactVisDisp extends Component {
	render() {
		return (
            <Grid>
                <Row className="show-grid">
                    <Col md={8} xs={12}>
                        <div style={{width:"1000px", height:"1000px"}}>
                            <MainVis/>
                        </div>
                    </Col>
                </Row>
            </Grid>
	) }
}

export class ReactSigmaDisp extends Component {
	render() {
		return (
            <Grid>
                <Row className="show-grid">
                    <Col md={8} xs={12}>
                        <div style={{width:"1000px", height:"1000px"}}>
                            <MainSigma/>
                        </div>
                    </Col>
                </Row>
            </Grid>
	) }
}

export class CytoscapeDisp extends Component {
	render() {
		return (
            <Grid>
                <Row className="show-grid">
                    <Col md={8} xs={12}>
                        <div style={{width:"1000px", height:"1000px"}}>
                            <CytoMain/>
                        </div>
                    </Col>
                </Row>
            </Grid>
	) }
}

export class DataUIDisp extends Component {
	render() {
		return (
            <Grid>
                <Row className="show-grid">
                    <Col md={8} xs={12}>
                        <div style={{width:"1000px", height:"1000px"}}>
                            <DataUIMain/>
                        </div>
                    </Col>
                </Row>
            </Grid>
	) }
}

class BurgerTest extends React.Component {
    constructor(props) {
        super(props);
    }
	
	showSettings (event) {
		event.preventDefault();
	}

	render() {
		return (
			<Menu>
				<a id="home" className="menu-item" href="/">Home</a>
			</Menu>
		);
	}
}
