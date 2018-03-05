import React, { Component } from 'react';
import { keys, map, isArray, sortBy } from 'lodash';
import FRC, { Checkbox, CheckboxGroup, Input, RadioGroup, Row as FormsyRow, Select, File, Textarea } from 'formsy-react-components'
import numeral from 'numeral'
import request from 'superagent'
import { render } from 'react-dom'
import { Image, Grid, Col, Clearfix, Row } from 'react-bootstrap'
import ReactToolip from 'react-tooltip';


window.$ = window.jQuery = require('jquery');
//require('qtip2');

//var qtip = require('qtip2');
//var reactqtip = require('react-qtip');
var cytoscape = require('cytoscape');
//var cyforcelayout = require('cytoscape-ngraph.forcelayout');
var cyqtip = require('cytoscape-qtip');
var cycola = require('cytoscape-cola');
var cyforcelayout = require('cytoscape-ngraph.forcelayout');



//cyforcelayout['iterations'] = 10000
//require(['cytoscape', 'cytoscape-ngraph.forcelayout'], function( cytoscape, cyforcelayout ){
//   cyforcelayout( cytoscape ); // register extension 
//  });

//console.log(cyforcelayout)
//console.log(cyforcelayout['Layout'])
//console.log(cytoscape('cytoscape-ngraph.forcelayout'))

// register extensions
//cyforcelayout( cytoscape );
//cytoscape.use( qtip );
cyqtip( cytoscape );
cycola(cytoscape);
cyforcelayout( cytoscape );

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

var cytoStyle = [ searchedNodeStyle, citedNodeStyle, edgeStyle ]

var async = {
    // tell layout that we want to compute all at once:
    maxIterations: 1000,
    stepsPerCycle: 30,

    // Run it till the end:
    waitForStep: false
}

var physics = {
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
}

//cyforcelayout['async'] = async
//cyforcelayout['physics'] = physics
//cyforcelayout['iterations'] = 10000
//cyforcelayout['refreshInterval'] = 16000
//cyforcelayout['refreshIterations'] = 2
//cyforcelayout['stableThreshold'] = false
//cyforcelayout['animate'] = false
//cyforcelayout['fit'] = true
console.log(cyforcelayout.ngraph)

var cytoForceLayout = {
    name: 'cytoscape-ngraph.forcelayout',
    async: {
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
    fit: true
}

var cytoColaLayout = { 
    name: 'cola',
    animate: true, // whether to show the layout as it's running
    refresh: 0.1, // number of ticks per frame; higher is faster but more jerky
    maxSimulationTime: 40000, // max length in ms to run the layout
    ungrabifyWhileSimulating: true, // so you can't drag nodes during layout
    fit: true, // on every layout reposition of nodes, fit the viewport
    padding: 0, // padding around the simulation
    boundingBox: { x1: 0, y1: 0, w: 800, h: 600 }, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
    nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node (default true)
  
    // layout event callbacks
    ready: function(){}, // on layoutready
    stop: function(){}, // on layoutstop
  
    // positioning options
    randomize: true, // use random node positions at beginning of layout
    avoidOverlap: true, // if true, prevents overlap of node bounding boxes
    handleDisconnected: false, // if true, avoids disconnected components from overlapping
    nodeSpacing: function( node ){ return 0; }, // extra spacing around nodes
    flow: undefined, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
    alignment: undefined, // relative alignment constraints on nodes, e.g. function( node ){ return { x: 0, y: 1 } }
  
    // different methods of specifying edge length
    // each can be a constant numerical value or a function like `function( edge ){ return 2; }`
    edgeLength: undefined, // sets edge length directly in simulation
    edgeSymDiffLength: undefined, // symmetric diff edge length in simulation
    edgeJaccardLength: undefined, // jaccard edge length in simulation
  
    // iterations of cola algorithm; uses default values on undefined
    unconstrIter: undefined, // unconstrained initial layout iterations
    userConstIter: undefined, // initial layout iterations with user-specified constraints
    allConstIter: undefined, // initial layout iterations with all constraints including non-overlap
  
    // infinite layout options
    infinite: false // overrides all other options for a forces-all-the-time mode
}

var cytoDefaultLayout = { name: 'random' }

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

export class CytoMain extends React.Component {
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
        return (
            <div className="row">
                <div className="col-xs-6 offset-xs-3" >
                    <Request onSubmit={this.onSubmit} />
                    { map(sortBy(keys(pending), [x => -x]), id => <Pending key={id} id={id} />) }
                    { map(sortBy(keys(results), [x => -x]), id => <CytoGraph data={results[id]}/>) }
                </div>     
            </div>
        )
    }

}
class CytoGraph extends React.Component {

	constructor(props){
        super(props);
        this.state = {graph: props.data, selectedNodes: ["zappzarapp"]};
        this.myGraph = props.data;
        this.cy = null;
        this.handleClick = this.handleClick.bind(this);
        this.getNodeInfo = this.getNodeInfo.bind(this);
    }

    shouldComponentUpdate(){
        return true;
    }

    componentWillReceiveProps(nextProps){
        this.cy.json(nextProps);
    }

    componentWillUnmount(){
        this.cy.destroy();
    }

    getCy(){
        return this.cy;
    }

    componentDidMount(){
        var cy = window.cy = cytoscape({
            container: document.getElementById('cy'),
            elements: this.myGraph,
            style: cytoStyle,
            layout: cyforcelayout,
            minZoom: 0.2,
            maxZoom: 1.5,
            zoomingEnabled: true,
            userZoomingEnabled: true,
        });

        cy.on('tap', 'node', function(event) {

            const node_data = event.target.data().id
   
               $('#cy').qtip({
                    content: {
                     text: event.target.data().id
                    },
                    show: {
                    event: 'click'
                    },
                    position: {
                        my: 'top center',
                        at: 'bottom center'
                     },
                    style: {
                     classes: 'qtip-bootstrap',
                      tip: {
                        width: 16,
                        height: 8
                      }
                    },
                });
       
   
         });

        cy.on('click', 'node', function(e){
            console.log(e);
              $('#cy').qtip({
                overwrite: true,
                content:  '<b><a href="https://www.ncbi.nlm.nih.gov/pubmed/' + e.target.id() + 
                        '" target="_blank">' + e.target.data('title') + '</b></a>' +
                        '<br><i>' + e.target.data('journal') +
                        '</i><br><i>' + e.target.data('pubDate') + '</i>' +
                        '<br>' + e.target.data('authors'),
                position: {
                    target: $('#cy'),
                    adjust: {x: e.position.x, y:  e.position.y}    
                },
                hide: {
                  event: 'unfocus',
                },
                style: {
                  classes: 'qtip-bootstrap',
                  width: 200,
                  tip: {
                    corner: false,
                    width: 24,
                    height: 24
                  }
                }
            })});

        this.cy = cy;


    }

    handleClick(event){
        console.log(event);
        if(true){
            this.setState({ selectedNodes: [event.target.data('title')] });
            //this.state.selectedNodes[0] = event.target.data('title');
            console.log("in if branch");
        }
    }

    getNodeInfo = () => {
        console.log("inside getNodeInfo");
        //console.log(this.state);
        return this.state.selectedNodes[0];
    }

    
    render() {
        return(<div>
                <div 
                    id="cy" 
                    name="cy" 
                    style={{position: 'absolute', height:'600px', width: '800px'}}
                    data-tip
                    data-for='nodeTooltip'
                    onClick={(e) => this.handleClick(e)} /> 
                    <ReactToolip ref="nodeTooltip" id="nodeTooltip" event="click" getContent={this.getNodeInfo} isCapture={true} />
                </div>
        )
    }
}

  