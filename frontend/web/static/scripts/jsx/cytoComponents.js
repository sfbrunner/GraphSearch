import React, { Component } from 'react';
import { keys, map, isArray, sortBy } from 'lodash';
import FRC, { Checkbox, CheckboxGroup, Input, RadioGroup, Row as FormsyRow, Select, File, Textarea } from 'formsy-react-components'
import numeral from 'numeral'
import request from 'superagent'
import { render } from 'react-dom'
import { Image, Grid, Col, Clearfix, Row } from 'react-bootstrap'
import ReactToolip from 'react-tooltip';

window.$ = window.jQuery = require('jquery');
var cytoscape = require('cytoscape');
//var cyforcelayout = require('cytoscape-ngraph.forcelayout');
//var cycola = require('cytoscape-cola');
import coseBilkent from 'cytoscape-cose-bilkent';

cytoscape.use( coseBilkent );

//var cyarbor = require('cytoscape-arbor');
//var arbor = require('arbor');


// register extensions
//cyforcelayout( cytoscape );
//cycola(cytoscape);
//cyarbor( cytoscape, arbor ); // register extension


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

var cytoCoseBilkentLayout = {
    name: 'cose-bilkent',
    // Called on `layoutready`
    ready: function () {
    },
    // Called on `layoutstop`
    stop: function () {
    },
    // Whether to include labels in node dimensions. Useful for avoiding label overlap
    nodeDimensionsIncludeLabels: false,
    // number of ticks per frame; higher is faster but more jerky
    refresh: 30,
    // Whether to fit the network view after when done
    fit: true,
    // Padding on fit
    padding: 10,
    // Whether to enable incremental mode
    randomize: true,
    // Node repulsion (non overlapping) multiplier
    nodeRepulsion: 4500,
    // Ideal (intra-graph) edge length
    idealEdgeLength: 100,
    // Divisor to compute edge forces
    edgeElasticity: 1.5,
    // Nesting factor (multiplier) to compute ideal edge length for inter-graph edges
    nestingFactor: 0.1,
    // Gravity force (constant)
    gravity: 1.0,
    // Maximum number of iterations to perform
    numIter: 500,
    // Whether to tile disconnected nodes
    tile: true,
    // Type of layout animation. The option set is {'during', 'end', false}
    animate: 'during',
    // Amount of vertical space to put between degree zero nodes during tiling (can also be a function)
    tilingPaddingVertical: 10,
    // Amount of horizontal space to put between degree zero nodes during tiling (can also be a function)
    tilingPaddingHorizontal: 10,
    // Gravity range (constant) for compounds
    gravityRangeCompound: 1.5,
    // Gravity force (constant) for compounds
    gravityCompound: 1.0,
    // Gravity range (constant)
    gravityRange: 3.8,
    // Initial cooling factor for incremental layout
    initialEnergyOnIncremental: 0.5
  };

var cytoArborLayout = {
    animate: true, // whether to show the layout as it's running
    maxSimulationTime: 1000, // max length in ms to run the layout
    fit: true, // on every layout reposition of nodes, fit the viewport
    padding: 30, // padding around the simulation
    boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
    ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
    randomize: false, // uses random initial node positions on true
  
    // callbacks on layout events
    ready: undefined, // callback on layoutready
    stop: undefined, // callback on layoutstop
  
    // forces used by arbor (use arbor default on undefined)
    repulsion: undefined,
    stiffness: undefined,
    friction: undefined,
    gravity: true,
    fps: undefined,
    precision: undefined,
  
    // static numbers or functions that dynamically return what these
    // values should be for each element
    // e.g. nodeMass: function(n){ return n.data('weight') }
    nodeMass: undefined,
    edgeLength: undefined,
  
    stepSize: 0.1, // smoothing of arbor bounding box
  
    // function that returns true if the system is stable to indicate
    // that the layout can be stopped
    stableEnergy: function( energy ){
      var e = energy;
      return (e.max <= 0.5) || (e.mean <= 0.3);
    },
  
    // infinite layout options
    infinite: false // overrides all other options for a forces-all-the-time mode
  };

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
    refreshInterval: 16, // in ms
    refreshIterations: 10, // iterations until thread sends an update
    stableThreshold: 2,
    animate: true,
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
                this.setState({ results: { ...results, [id]: result, data: result } })
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
        this.state = { graph: props.data, selectedNode: null, cy: null };
    }

    componentDidMount(){
        var cy = cytoscape({
            container: document.getElementById('cy'),
            elements: this.state.graph,
            style: cytoStyle,
            layout: cytoCoseBilkentLayout,
            minZoom: 0.5,
            maxZoom: 1.5,
            zoomingEnabled: true,
            userZoomingEnabled: true,
        });
        function _renderTooltip(event) {
            if (event.target.group() == 'nodes') {
                var node = this.state.graph.nodes.filter(function(obj) {return obj.data.id == event.target.data().id})[0].data;
                this.state.selectedNode = '<b><a href="https://www.ncbi.nlm.nih.gov/pubmed/' + node.id + 
                '" target="_blank">' + node.title + '</b></a>' +
                '<br><i>' + node.journal +
                '</i><br><i>' + node.pubDate + '</i>' +
                '<br>' + node.authors
            }
            else {
                this.state.selectedNode = null;
            }

        }
        cy.on('click','mouseover', 'node', _renderTooltip.bind(this));

        this.state.cy = cy;
    }

    render() {
        var cytoDivStyle = {
            position: 'relative', // Relative position necessary for cytoscape lib features!
            height:'600px', 
            width: '800px'
        };

        return( <div>
                    <div id="cy" name="cy" data-tip=''data-for='nodeTooltip'data-html={true} style={cytoDivStyle}/> 
                    <ReactToolip ref="nodeTooltip" id="nodeTooltip" event="mouseover" getContent={() => this.state.selectedNode} isCapture={false} />

                </div>
        )
    }
}

  
