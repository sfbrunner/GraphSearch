import React, { Component } from 'react';
import { keys, map, isArray, sortBy } from 'lodash';
import FRC, { Checkbox, CheckboxGroup, Input, RadioGroup, Row as FormsyRow, Select, File, Textarea } from 'formsy-react-components'
import numeral from 'numeral'
import request from 'superagent'
import { render } from 'react-dom'
import { Image, Grid, Col, Clearfix, Row } from 'react-bootstrap'
import ReactToolip from 'react-tooltip';
import { DotLoader } from 'react-spinners';
import ReactGA from 'react-ga';

window.$ = window.jQuery = require('jquery');
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
//var cycola = require('cytoscape-cola');
import coseBilkent from 'cytoscape-cose-bilkent';
import euler from 'cytoscape-euler';

cytoscape.use( euler );

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
        'background-color': '#004cc6',
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
        'background-color': 'data(node_col)',
        'border-color': 'gray',
        'border-width': 0.5,
        'opacity': 1.0,
        'font-size': '5pt',
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
    refresh: 1,
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
    nestingFactor: 1.1,
    // Gravity force (constant)
    gravity: 10.0,
    // Maximum number of iterations to perform
    numIter: 500,
    // Whether to tile disconnected nodes
    tile: true,
    // Type of layout animation. The option set is {'during', 'end', false}
    animate: 'end',
    // Amount of vertical space to put between degree zero nodes during tiling (can also be a function)
    tilingPaddingVertical: 10,
    // Amount of horizontal space to put between degree zero nodes during tiling (can also be a function)
    tilingPaddingHorizontal: 10,
    // Gravity range (constant) for compounds
    gravityRangeCompound: 1.5,
    // Gravity force (constant) for compounds
    gravityCompound: 10.0,
    // Gravity range (constant)
    gravityRange: 5.0,
    // Initial cooling factor for incremental layout
    initialEnergyOnIncremental: 0.1
  };

  var cytoCoseLayout = {
    name: 'cose',
  
    // Called on `layoutready`
    ready: function(){},
  
    // Called on `layoutstop`
    stop: function(){},
    
    // Whether to animate while running the layout
    // true : Animate continuously as the layout is running
    // false : Just show the end result
    // 'end' : Animate with the end result, from the initial positions to the end positions
    animate: true,
  
    // Easing of the animation for animate:'end'
    animationEasing: undefined,
  
    // The duration of the animation for animate:'end'
    animationDuration: undefined,
  
    // A function that determines whether the node should be animated
    // All nodes animated by default on animate enabled
    // Non-animated nodes are positioned immediately when the layout starts
    animateFilter: function ( node, i ){ return true; },
  
  
    // The layout animates only after this many milliseconds for animate:true
    // (prevents flashing on fast runs)
    animationThreshold: 250,
  
    // Number of iterations between consecutive screen positions update
    // (0 -> only updated on the end)
    refresh: 20,
  
    // Whether to fit the network view after when done
    fit: true,
  
    // Padding on fit
    padding: 30,
  
    // Constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
    boundingBox: undefined,
  
    // Excludes the label when calculating node bounding boxes for the layout algorithm
    nodeDimensionsIncludeLabels: false,
  
    // Randomize the initial positions of the nodes (true) or use existing positions (false)
    randomize: true,
  
    // Extra spacing between components in non-compound graphs
    componentSpacing: 40,
  
    // Node repulsion (non overlapping) multiplier
    nodeRepulsion: function( node ){ return 10048; },
  
    // Node repulsion (overlapping) multiplier
    nodeOverlap: 100,
  
    // Ideal edge (non nested) length
    idealEdgeLength: function( edge ){ return 16; },
  
    // Divisor to compute edge forces
    edgeElasticity: function( edge ){ return 100; },
  
    // Nesting factor (multiplier) to compute ideal edge length for nested edges
    nestingFactor: 1.2,
  
    // Gravity force (constant)
    gravity: -3,
  
    // Maximum number of iterations to perform
    numIter: 1000,
  
    // Initial temperature (maximum node displacement)
    initialTemp: 1000,
  
    // Cooling factor (how the temperature is reduced between consecutive iterations
    coolingFactor: 0.7,
  
    // Lower temperature threshold (below this point the layout will end)
    minTemp: 1.0,
  
    // Pass a reference to weaver to use threads for calculations
    weaver: false
  };

  var cytoEuler = {
    name: 'euler',
  
    // The ideal length of a spring
    // - This acts as a hint for the edge length
    // - The edge length can be longer or shorter if the forces are set to extreme values
    springLength: edge => 100,
  
    // Hooke's law coefficient
    // - The value ranges on [0, 1]
    // - Lower values give looser springs
    // - Higher values give tighter springs
    springCoeff: edge => 0.0008,
  
    // The mass of the node in the physics simulation
    // - The mass affects the gravity node repulsion/attraction
    mass: node => 5,
  
    // Coulomb's law coefficient
    // - Makes the nodes repel each other for negative values
    // - Makes the nodes attract each other for positive values
    gravity: -7,
  
    // A force that pulls nodes towards the origin (0, 0)
    // Higher values keep the components less spread out
    pull: 0.01,
  
    // Theta coefficient from Barnes-Hut simulation
    // - Value ranges on [0, 1]
    // - Performance is better with smaller values
    // - Very small values may not create enough force to give a good result
    theta: 0.8,
  
    // Friction / drag coefficient to make the system stabilise over time
    dragCoeff: 0.02,
  
    // When the total of the squared position deltas is less than this value, the simulation ends
    movementThreshold: 0.01,
  
    // The amount of time passed per tick
    // - Larger values result in faster runtimes but might spread things out too far
    // - Smaller values produce more accurate results
    timeStep: 10,
  
    // The number of ticks per frame for animate:true
    // - A larger value reduces rendering cost but can be jerky
    // - A smaller value increases rendering cost but is smoother
    refresh: 20,
  
    // Whether to animate the layout
    // - true : Animate while the layout is running
    // - false : Just show the end result
    // - 'end' : Animate directly to the end result
    animate: false,
  
    // Animation duration used for animate:'end'
    animationDuration: undefined,
  
    // Easing for animate:'end'
    animationEasing: undefined,
  
    // Maximum iterations and time (in ms) before the layout will bail out
    // - A large value may allow for a better result
    // - A small value may make the layout end prematurely
    // - The layout may stop before this if it has settled
    maxIterations: 100000,
    maxSimulationTime: 1000,
  
    // Prevent the user grabbing nodes during the layout (usually with animate:true)
    ungrabifyWhileSimulating: false,
  
    // Whether to fit the viewport to the repositioned graph
    // true : Fits at end of layout for animate:false or animate:'end'; fits on each frame for animate:true
    fit: true,
  
    // Padding in rendered co-ordinates around the layout
    padding: 30,
  
    // Constrain layout bounds with one of
    // - { x1, y1, x2, y2 }
    // - { x1, y1, w, h }
    // - undefined / null : Unconstrained
    boundingBox: undefined,
  
    // Layout event callbacks; equivalent to `layout.one('layoutready', callback)` for example
    ready: function(){}, // on layoutready
    stop: function(){}, // on layoutstop
  
    // Whether to randomize the initial positions of the nodes
    // true : Use random positions within the bounding box
    // false : Use the current node positions as the initial positions
    randomize: true
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
           <Input 
                name = "search_string" 
                layout = "vertical" 
                id = "search_string" 
                value = "epigenetics idh oncogenic" 
                type = "text" 
                help = "Let us create a network of your search results." 
                addonAfter={<span type="submit" className="glyphicon glyphicon-search" defaultValue="Submit"/>} 
            />
	   </fieldset>
   </FRC.Form>
)

const rootUrl = new URL(window.location.origin)
rootUrl.port = 8080
const apiUrl = new URL("/api/", rootUrl)

export class CytoMain extends React.Component {
    constructor(props) {
        super(props);
        this.state = { graphJson: {}, pending: {}, loading: false };
        this.onSubmit = this.onSubmit.bind(this);
    }

    poll(id) {
        return () => {
            request.get(new URL(id, apiUrl))
            .end( (err, res) => { // call api with id -> will return task_id and if ready result
                if (err) return;
                const { result } = res.body;
                if (!result) return;
                const { graphJson, pending, loading } = this.state;
                clearInterval(pending[id]);
                delete pending[id];
                this.setState({ graphJson: {[id]: result}, loading: false });
            })
        }
    }

    onSubmit({ search_string }) {
        this.setState({loading: true});
        ReactGA.event({category: 'Search', action: 'Submitted search', label: search_string });
        const payload = { 'search_string': search_string, 'graph_format': 'cytoscape' };
        request.put(apiUrl).send(payload)
        .end( (err, res) => {
            if (err) return;
            const { graphJson, pending, loading } = this.state;
            const { result: id } = res.body;
            const timers = {[id]:  setInterval(this.poll(id),  500)};
            this.setState({ pending: {...pending, ...timers} });
        })
    }

    render() {
        const { graphJson, pending, loading } = this.state;
        return (
            <Grid>
                <Row className="show-grid">
                    <Col xs={6} md={8}>
                        <Request onSubmit={this.onSubmit} />
                    </Col>
                </Row>
                <Row className="show-grid">
                    <Col xs={1} md={3}></Col>
                    <Col xs={1} md={2}>
                        <DotLoader color={'#000000'} loading={loading} />   
                    </Col>
                    <Col xs={1} md={3}> </Col>
                </Row>
                <Row className="show-grid">
                    <Col md={8} xs={8}>
                        { map(keys(graphJson), id => <CytoGraph data={graphJson[id]}/>) }
                    </Col>
                    <Col md={3} xs={3}>
                        { map(sortBy(keys(graphJson), [x => -x]), id => <GraphInfo data={graphJson[id]}/>) }
                    </Col>
                </Row>
            </Grid>
        )
    }
}

class GraphInfo extends React.Component {
    
    constructor(props){
        super(props);
        this.state = { stats: props.data.stats };
    }

    render() {
        var cytoDivStyle = {
            position: 'relative', // Relative position necessary for cytoscape lib features!
            width: '100%',
            backgroundColor: 'lightgrey',
            paddingRight: '20px',
            paddingLeft: '20px',
            verticalAlign: 'middle'
        };

        var gradient_svg = <svg width="100" height="20">
            <defs>
            <linearGradient id="MyGradient">
                <stop offset="5%"  stopColor="white"/>
                <stop offset="95%" stopColor="red"/>
            </linearGradient>
            </defs>
            <rect fill="url(#MyGradient)" x="0" y="10" width="100" height="20"/>
        </svg>

        return( 
            <div id="netstats" name="netstats">
                <Row style={{height:"2vh"}}>
                    <div style={{height:'100px'}}></div>
                </Row>
                <Row style={cytoDivStyle}>
                <h4>Search stats:</h4>
                <p><strong>Direct hits: (</strong><strong style={{color:'#004cc6'}}>blue</strong><strong>): </strong>{ this.state.stats.num_results }</p>
                <p><strong>Cited publications: (</strong><strong style={{color:'red'}}>red</strong><strong>): </strong>{ this.state.stats.num_citations }</p>
                <p><strong>Citations: </strong>{ this.state.stats.num_links }</p>
                <p><br/></p>
                <p><strong>Citations per publication:</strong></p>
                <div style={{whiteSpace: 'nowrap', overflow:'hidden', display:'inline-block', textAlign:'left'}}>
                    <strong>0 </strong>{ gradient_svg }<strong> {this.state.stats.max_degree_cited}</strong>
                </div>
                </Row>
            </div>
        )
    }
}

class CytoGraph extends React.Component {
    // See https://github.com/cytoscape/cytoscape.js/issues/1468 for implementation recommendations

	constructor(props){
        super(props);
        this.cy = null;
        this.state = { graph: props.data.graph, tooltipString: null, cytoTarget: null };
        this._nodeSelector = this._nodeSelector.bind(this);
    }

    _nodeSelector(nodeId) {
        return this.state.graph.nodes.filter(function(obj) {return obj.data.id == nodeId})[0].data;
    }

    componentWillReceiveProps(nextProps){
        if (nextProps.data.graph !== this.state.graph)
        {
            this.cy.elements().remove();
            this.cy.add(nextProps.data.graph);
            this.cy.json(nextProps.data.graph);
            this.cy.layout(cytoEuler).run();
            this.cy.fit();
        }
    }

    shouldComponentUpdate(){
        return false;
    }

    componentWillUnmount(){
        this.cy.destroy();
    }

    getCy(){
        return this.cy;
    }

    componentDidMount(){
        var cy = cytoscape({
            container: document.getElementById('cy'),
            elements: this.state.graph,
            style: cytoStyle,
            layout: cytoEuler,
            minZoom: 0.1,
            maxZoom: 1.5,
            zoomingEnabled: true,
            userZoomingEnabled: true,
        });

        function _renderTooltip(event) {
            var ncbiUrl = 'https://www.ncbi.nlm.nih.gov/pubmed/';
            this.state.cytoTarget = event.target;
            if (event.target === cy ){
                this.state.tooltipString = null;
            } else if (event.target.group() == 'nodes') {
                var node = this._nodeSelector(event.target.data().id);
                this.state.tooltipString = `<b><a href="${ncbiUrl}${node.id}" target="_blank">${node.title}</b></a>
                <br><i>${node.journal}</i><br><i>${node.pubDate}</i><br>${node.authors}`;
            } else if (event.target.group() == 'edges') {
                var citedNode = this._nodeSelector(event.target.data().target);
                var citingNode = this._nodeSelector(event.target.data().source);
                this.state.tooltipString = `<b>Citation</b>:<br><a href="${ncbiUrl}${citingNode.id}" target="_blank">
                ${citingNode.title}</a> (${citingNode.pubDate})<br><i>cites</i><br>
                <a href="${ncbiUrl}${citedNode.id}" target="_blank">${citedNode.title}</a> (${citedNode.pubDate})`;
            } else {
                this.state.tooltipString = null;
            }
        }
        cy.on('tap', _renderTooltip.bind(this)); 
        this.cy = cy; // TODO: pass event to state and use this binding
    }

    render() {
        var cytoDivStyle = {
            position: 'relative', // Relative position necessary for cytoscape lib features!
            height:'600px', 
            width: '100%',
        };

        return( 
            <div>
                <div id="cy" name="cy" data-tip='' data-for='nodeTooltip' data-html={true} style={cytoDivStyle}/> 
                <ReactToolip ref="nodeTooltip" id="nodeTooltip" event="click" getContent={() => this.state.tooltipString} isCapture={false} />
            </div>
        )
    }
}

  
