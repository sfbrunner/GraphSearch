import React, { Component } from 'react';


window.$ = window.jQuery = require('jquery');
//require('qtip2');

//import $ from 'jquery';
var qtip = require('qtip2');
//var reactqtip = require('react-qtip');
var cytoscape = require('cytoscape');
var cyforcelayout = require('cytoscape-ngraph.forcelayout');
//var cyqtip = require('cytoscape-qtip');
//var cycola = require('cytoscape-cola');

// register extensions
cyforcelayout( cytoscape );
//cyqtip( cytoscape );

//cycola(cytoscape);

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
    refresh: 1, // number of ticks per frame; higher is faster but more jerky
    maxSimulationTime: 4000, // max length in ms to run the layout
    ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
    fit: true, // on every layout reposition of nodes, fit the viewport
    padding: 30, // padding around the simulation
    boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
    nodeDimensionsIncludeLabels: true, // whether labels should be included in determining the space used by a node (default true)
  
    // layout event callbacks
    ready: function(){}, // on layoutready
    stop: function(){}, // on layoutstop
  
    // positioning options
    randomize: false, // use random node positions at beginning of layout
    avoidOverlap: true, // if true, prevents overlap of node bounding boxes
    handleDisconnected: true, // if true, avoids disconnected components from overlapping
    nodeSpacing: function( node ){ return 10; }, // extra spacing around nodes
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

class CytoGraph extends React.Component {

	constructor(props){
        super(props);
        this.state = {graph: props.data};
        this.myGraph = props.data
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
            layout: cytoDefaultLayout,
            minZoom: 0.5,
            maxZoom: 1.5,
            zoomingEnabled: true,
            userZoomingEnabled: true,
        });

        cy.on('click', 'node', function(e){
            console.log(e);
              $(document.getElementById('cy')).qtip({
                overwrite: false,
                content:  '<b><a href="https://www.ncbi.nlm.nih.gov/pubmed/' + e.cyTarget.id() + 
                        '" target="_blank">' + e.cyTarget.data('title') + '</b></a>' +
                        '<br><i>' + e.cyTarget.data('journal') +
                        '</i><br><i>' + e.cyTarget.data('pubDate') + '</i>' +
                        '<br>' + e.cyTarget.data('authors'),
                position: {
                    target: $(document.getElementById('cy')),
                    adjust: {x: e.cyPosition.x, y:  e.cyPosition.y}    
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
        this.state = { cy };


    }

    
    render() {
        return( <div id="cy" name="cy" style={{position: 'absolute', height:'600px', width: '800px'}} /> )
    }
}

export default CytoGraph;   