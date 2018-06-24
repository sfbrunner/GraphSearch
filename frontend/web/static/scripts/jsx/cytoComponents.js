import React, { Component } from 'react';
import { keys, map, isArray, sortBy } from 'lodash';
import numeral from 'numeral'
import request from 'superagent'
import { render } from 'react-dom'
import { Image, Grid, Col, Clearfix, Row, Button, ButtonToolbar, ButtonGroup, Popover, Overlay, OverlayTrigger, Tooltip, Modal, Alert, Badge, Checkbox, ToggleButton } from 'react-bootstrap'
import { DotLoader } from 'react-spinners';
import ReactGA from 'react-ga';
import { Histogram, DensitySeries, BarSeries, withParentSize, XAxis, YAxis, WithTooltip } from '@data-ui/histogram';
import * as d3 from "d3";
import renderTooltip from './renderHistogramTooltip'; 
import { BrowserRouter, Route, Link, Switch, hashHistory } from 'react-router-dom';
import { TagCloud } from "react-tagcloud";

window.$ = window.jQuery = require('jquery');
var cytoscape = require('cytoscape');
//var cyforcelayout = require('cytoscape-ngraph.forcelayout');
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
cycola(cytoscape);
cyforcelayout(cytoscape);
//var cycola = require('cytoscape-cola');
import coseBilkent from 'cytoscape-cose-bilkent';
import euler from 'cytoscape-euler';

cytoscape.use(euler);

//var cyarbor = require('cytoscape-arbor');
//var arbor = require('arbor');


// register extensions
//cyforcelayout( cytoscape );
//cycola(cytoscape);
//cyarbor( cytoscape, arbor ); // register extension


var searchedNodeStyle = {
    selector: "node[group = 'Searched']",
    style: {
        'label': 'data(journal_iso)',
        'width': '20px',
        'height': '20px',
        'color': 'black',
        'background-fit': 'contain',
        'background-clip': 'none',
        'background-color': '#004cc6',
        'border-color': 'gray',
        'border-width': 0.5,
        'opacity': 1.0,
        'font-size': '5pt',
        'text-transform': 'uppercase',
        //'text-background-color': 'white',
        //'text-background-opacity': 0.8,
        //'text-background-shape': 'roundrectangle',
        //'text-outline-color': 'white',
        "text-max-width": 70,
        "text-wrap": 'ellipsis'
    },
}

var citedNodeStyle = {
    selector: "node[group = 'Cited']",
    style: {
        'label': 'data(journal_iso)',
        'width': '15px',
        'height': '15px',
        'color': 'black',
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
        "text-valign": "bottom center",
        "text-max-width": 70,
        "text-wrap": 'ellipsis'
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

var cytoStyle = [searchedNodeStyle, citedNodeStyle, edgeStyle]

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
    ready: function () { },

    // Called on `layoutstop`
    stop: function () { },

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
    animateFilter: function (node, i) { return true; },


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
    nodeRepulsion: function (node) { return 10048; },

    // Node repulsion (overlapping) multiplier
    nodeOverlap: 100,

    // Ideal edge (non nested) length
    idealEdgeLength: function (edge) { return 16; },

    // Divisor to compute edge forces
    edgeElasticity: function (edge) { return 100; },

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
    ready: function () { }, // on layoutready
    stop: function () { }, // on layoutstop

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
    stableEnergy: function (energy) {
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
    ready: function () { }, // on layoutready
    stop: function () { }, // on layoutstop

    // positioning options
    randomize: true, // use random node positions at beginning of layout
    avoidOverlap: true, // if true, prevents overlap of node bounding boxes
    handleDisconnected: false, // if true, avoids disconnected components from overlapping
    nodeSpacing: function (node) { return 0; }, // extra spacing around nodes
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
        marginLeft: '-30px',
        verticalAlign: 'top',
        lineHeight: '30px',
        position: 'fixed',
        top: '5px'
    }
}

const ResponsiveHistogram = withParentSize(({ parentWidth, parentHeight, ...rest}) => (
    <Histogram
    width={parentWidth}
    height={parentHeight}
    renderTooltip={renderTooltip}
    {...rest}
    />
));

class GraphTagCloud extends React.Component{

    constructor(props){
        super(props);
        this.state = { tags: props.tags, clickedTag: null }
        this.nodeHighlighter = this.nodeHighlighter.bind(this);
    }

    nodeHighlighter(filter){
        this.props.nodeHighlighter(filter);
    }

    render(){
        const options = {
            luminosity: 'dark',
            hue: 'monochrome'
          };

        const customRenderer = (tag, size, color) => (
        <span key={tag.value}
                style={{
                fontSize: `${size}px`,
                border: `0.0px solid ${color}`,
                margin: '1px',
                backgroundColor: tag.value==this.state.clickedTag? 'black' : 'grey',
                padding: '3px',
                color: 'white',
                borderRadius: '5px',
                cursor: 'pointer',
                whiteSpace: 'pre-wrap',
                display: 'inline-block',
                }}>{tag.value}</span>
        );

        return(
        <div>
            <TagCloud 
                minSize={12}
                maxSize={24}
                colorOptions={options}
                tags={this.state.tags}
                shuffle={false}
                renderer={customRenderer}
                onClick={tag => {
                    if(tag.value==this.state.clickedTag){
                        this.nodeHighlighter('');
                        this.setState({clickedTag: null})
                    }else{
                        this.nodeHighlighter(tag.value); 
                        this.setState({clickedTag: tag.value})
                    }
                }}
                className="simple-cloud" />
        </div>
        )
    }
}

export class GraphInfo extends React.Component {

    constructor(props) {
        super(props);
        this.state = { 
            stats: props.data, 
            primaryNodesActive: true,
            secondaryNodesActive: true,
            citationsActive: true
        };
        this.primaryNodeHandler = this.primaryNodeHandler.bind(this);
        this.secondaryNodeHandler = this.secondaryNodeHandler.bind(this);
        this.citationHandler = this.citationHandler.bind(this);
    }

    paperHandler(tag){

    }

    citationHandler(e){

    }

    secondaryNodeHandler(e){

    }

    primaryNodeHandler(e){
        const { primaryNodesActive } = this.state;
        this.setState({primaryNodesActive: !primaryNodesActive})
        this.props.nodeHandler();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.data !== this.state) {
            this.setState({ stats: nextProps.data });
        }
    }

    render() {
        var statsMenuStyle = {
            display: 'block',
            pointerEvents: 'all',
            zIndex: '10001',
            marginTop: '10px',
            padding: '5px',
            paddingBottom: '5px',
            borderWidth: '0.5px',
            borderRadius: '5px',
            background:'white'
        };

        function tagCreator(entry){
            var tagEntry = {};
            tagEntry['value'] = `${entry[0]}`;
            tagEntry['count'] = entry[1];
            return tagEntry;
        }

        var gradient_svg = <svg width="100" height="20">
            <defs>
                <linearGradient id="MyGradient">
                    <stop offset="5%" stopColor="white" />
                    <stop offset="95%" stopColor="red" />
                </linearGradient>
            </defs>
            <rect fill="url(#MyGradient)" x="0" y="10" width="100" height="20" />
        </svg>
        const { primaryNodesActive, secondaryNodesActive, citationsActive } = this.state;

        return (
            <div id="netstats" name="netstats">
                <Row style={statsMenuStyle}>
                    <div style={{height:'150px'}}>
                        <p><strong>Publications per year</strong></p>
                        <ResponsiveHistogram
                            ariaLabel=''
                            orientation="vertical"
                            margin={{ top: 10, right: 12, bottom: 60, left: 12}}
                            binCount={ this.state.stats.pub_years.num_bin }
                        >
                            <BarSeries
                                animated
                                rawData={ this.state.stats.pub_years.values }
                                fill='grey'
                                strokeWidth={ 0 }
                            /> )}
                            <XAxis 
                                numTicks={ 3 } 
                                tickFormat={ d3.format('.4') }
                            />
                        </ResponsiveHistogram>
                    </div>
                </Row>
                <Row style={statsMenuStyle}>
                    <strong>Direct hits </strong>
                    <Badge style={{backgroundColor:'#004cc6'}}>{ this.state.stats.num_results }</Badge><br/>
                    <strong>Cited publications </strong>
                    <Badge style={{backgroundColor:'red'}}>{ this.state.stats.num_citations }</Badge><br/>
                    <strong>Citation links </strong>
                    <Badge style={{backgroundColor:'lightgrey'}}>{ this.state.stats.num_links }</Badge>
                </Row>
                <Row style={statsMenuStyle}>
                    <div style={{whiteSpace: 'nowrap', overflow:'hidden', display:'inline-block'}}>
                        <p><strong>Citations per publication</strong></p>
                        <Badge style={{backgroundColor:'lightgrey'}}>0</Badge>{'\u00A0'}{ gradient_svg }{'\u00A0'}
                        <Badge style={{backgroundColor:'red'}}>{this.state.stats.max_degree_cited}</Badge>
                    </div>
                </Row>
                <Row style={statsMenuStyle}>
                <p><strong>Top Journals</strong></p>
                <GraphTagCloud 
                    tags={Object.entries(this.state.stats.top_journal_dict).map(tagCreator)} 
                    nodeHighlighter={this.props.nodeHighlighter} />
                </Row>
                <Row style={statsMenuStyle}>
                <p><strong>Top Authors</strong></p>
                <GraphTagCloud 
                    tags={Object.entries(this.state.stats.top_author_dict).map(tagCreator)} 
                    nodeHighlighter={this.props.authorHighlighter} />
                </Row>
            </div>
        )
    }
}

export class ContextMenu extends React.Component {

    constructor(props){
        super(props);
        this.state = {contextMenuLocation: "", tooltipString: ""};
    }

    getInitialState(){
        return {contextMenuLocation: ''};
    }

    shouldComponentUpdate(){
        return true;
    }

    render() {
        var tooltipWidth = 250;
        var tooltipHeight = 180;
        var location = this.state.contextMenuLocation;
        var contentMenuStyle = {
            display: this.state.tooltipString != null && location ? 'block' : 'none',
            position: 'absolute', 
            left: location ? (location.x-tooltipWidth/2 + 15) : 0, // 15px offset from  container-fluid padding
            top: location ? (location.y + 36) : 0, // 36px offset from div height
            pointerEvents: 'all',
            width: tooltipWidth,
            height: tooltipHeight,
            borderRadius: '7px',
            padding: '0px',
            zIndex: '10001',
        };
        var popoverStyle = 
        {
            positionTop: location ? (location.x-tooltipWidth/2) : 0,
            positionLeft: location ? (location.y) : 0,
        }

        return (
            <div id="results" 
                style={contentMenuStyle} 
                onClick={(e) => {e.stopPropagation(); e.nativeEvent.stopImmediatePropagation()}}>
                <Popover id="tooltipPopover" placement="bottom" style={popoverStyle}>
                    <div dangerouslySetInnerHTML={{ __html: this.state.tooltipString}} />
                </Popover>
            </div>
        );
    }

}

var NodeBorderColor = Object.freeze({ 'default': 'grey', 'highlight': 'black' });
var NodeBorderWidth = Object.freeze({ 'default': '0.5', 'highlight': '2px solid #dadada' });

export class CytoGraph extends React.Component {
    // Wraps the cytoscape js library into react component
    // See https://github.com/cytoscape/cytoscape.js/issues/1468 for implementation recommendations

    constructor(props) {
        super(props);
        this.cy = null;
        this.state = { 
            graph: props.data.graph, 
            visualGraphState: props.visualGraphState,
            tooltipString: null, 
            cytoTarget: null, 
            tooltipShow: false, 
            nodeHighlighter: null,
        };
        this._nodeSelector = this._nodeSelector.bind(this);
        this.refocusGraph = this.refocusGraph.bind(this);
        this.zoomGraph = this.zoomGraph.bind(this);
        this.hideSecondaryNodes = this.hideSecondaryNodes.bind(this);
        this.hidePrimaryNodes = this.hidePrimaryNodes.bind(this);
        this.nodeHandler = this.nodeHandler.bind(this);
        this.eles = null;
        this.primaryEles = null;
        this.contextMenu = props.contextMenu;
        this.highlightNodes = this.highlightNodes.bind(this);
        this.highlightNodes2 = this.highlightNodes2.bind(this);
        this._formatNodeMouseout = this._formatNodeMouseout.bind(this);
        this._formatNodeMouseover = this._formatNodeMouseover.bind(this);
        this._hideTooltip = this._hideTooltip.bind(this);
        this._renderTooltip = this._renderTooltip.bind(this);
        this.tooltipTimeout = null;
        this.visualGraphUpdate = this.visualGraphUpdate.bind(this);
    }

    _nodeSelector(nodeId) {
        return this.state.graph.nodes.filter(function (obj) { return obj.data.id == nodeId })[0].data;
    }

    nodeHandler()
    {
        this.hidePrimaryNodes();
    }

    refocusGraph() {
        this.cy.fit();
    }

    zoomGraph(level){
        this.cy.zoom(level);
    }

    hideSecondaryNodes() {
        if (this.eles != null) {
            this.eles.restore();
            this.eles = null;
        }
        else {
            var eles = this.cy.remove('node[group = "Cited"]');
            this.eles = eles;
        }
    }

    hidePrimaryNodes() {
        if (this.primaryEles != null) {
            this.primaryEles.restore();
            this.primaryEles = null;
        }
        else {
            var primaryEles = this.cy.remove('node[group = "Searched"]');
            this.primaryEles = primaryEles;
        }
    }

    highlightNodes(selector)
    {
        /**
        * @param {string} selector the selector according to http://js.cytoscape.org/#selectors
        * duration should not be set to 0 otherwise cytoscape will crash.
        */
        this.cy.nodes().animate(
            { style: { borderColor: NodeBorderColor.default, borderWidth: NodeBorderWidth.default} },
            { duration: 1 }
        );
        this.cy.$(`node[${selector}]`).select().animate(
            { style: { borderColor: NodeBorderColor.highlight, borderWidth: NodeBorderWidth.highlight } },
            { duration: 1 }
        );
    }

    highlightNodes2(selector)
    {
        /**
        * @param {string} selector the selector according to http://js.cytoscape.org/#selectors
        * duration should not be set to 0 otherwise cytoscape will crash.
        */
        this.cy.nodes().animate(
            { style: { 'color': 'black'} },
            { duration: 1 }
        );
        this.cy.$(`node[${selector}]`).select().animate(
            { style: { 'color': 'red'} },
            { duration: 1 }
        );
    }

    highlightPapers(paperName){
        this.highlightNodes2(`journal_iso="${paperName}"`);
    }

    highlightAuthors(authorName){
        if(authorName == ''){
            this.highlightNodes(`authors="${'brazzasdfasdfff'}"`); //TODO: handle this properly
        }else{
            this.highlightNodes(`authors*="${authorName}"`);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.data.graph !== this.state.graph) {
            this.setState({ graph: nextProps.data.graph });
            this.cy.elements().remove();
            this.cy.add(nextProps.data.graph);
            this.cy.json(nextProps.data.graph);
            this.cy.layout(cytoEuler).run();
            this.cy.fit();
        } 
        else 
        {
            for (var propertyName in nextProps.visualGraphState){
                var nextPropertyValue = nextProps.visualGraphState[propertyName];
                var oldPropertyValue = this.state.visualGraphState[propertyName];
                //if (nextPropertyValue !== oldPropertyValue){
                    this.visualGraphUpdate(propertyName, nextPropertyValue);
                //}
            }
        }
        this.setState({visualGraphState: nextProps.visualGraphState});
    }

    visualGraphUpdate(propertyName, propertyValue){
        switch(propertyName){
            case "zoomLevel":
                this.zoomGraph(propertyValue);
                break;
            case "nodeHighlighter":
                this.highlightPapers(this.state.visualGraphState.nodeHighlighter);
                this.highlightPapers(propertyValue);
                break;
            case "authorHighlighter":
                this.highlightAuthors(this.state.visualGraphState.nodeHighlighter);
                this.highlightAuthors(propertyValue);
            case "journalHighlighter":
                break;
            case "nodeFilter":
                break;
        }
    }

    shouldComponentUpdate() {
        return false;
    }

    componentWillUnmount() {
        this.cy.destroy();
    }

    getCy() {
        return this.cy;
    }

    _hideTooltip(event){
        this.contextMenu.setState({ 
            tooltipString: null, 
            tooltipShow: false, 
            contextMenuLocation: {'x' : 0, 'y': 0},
            tooltipTarget: null,
        });
    }

    _formatNodeMouseover(event){
        event.target.animate(
            { style: { borderColor: NodeBorderColor.highlight, borderWidth: NodeBorderWidth.highlight } },
            { duration: 10 }
        );
        this.tooltipTimeout = setTimeout(this._renderTooltip, 400, event);
    }

    _formatNodeMouseout(event){
        event.target.animate(
            { style: {borderColor: NodeBorderColor.default, borderWidth: NodeBorderWidth.default} },
            { duration: 10 }
        );
        clearTimeout(this.tooltipTimeout);
        this._hideTooltip(event);
        //setTimeout(this._hideTooltip, 300, event);
    }

    _renderTooltip(event) {
        var ncbiUrl = 'https://www.ncbi.nlm.nih.gov/pubmed/';
        this.state.cytoTarget = event.target;
        if (event.target == this.contextMenu)
        { 
            return;
        }
        else if (event.target === cy) {
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
        this.setState({ tooltipTarget: event.target, tooltipShow: !this.state.tooltipShow})
        this.contextMenu.setState({
            tooltipString: this.state.tooltipString,
            contextMenuLocation: {
                'x' : event.target.renderedPosition().x, 
                'y' : event.target.renderedPosition().y + event.target.renderedHeight()/2
            }
          });
    }

    componentDidMount() {
        var cy = cytoscape({
            container: document.getElementById('cy'),
            elements: this.state.graph,
            style: cytoStyle,
            layout: cytoEuler,
            minZoom: 0.5,
            maxZoom: 3.0,
            zoomingEnabled: true,
            userZoomingEnabled: true,
            boxSelectionEnabled: true
        });
        cy.on('zoom', this._hideTooltip );
        cy.on('mouseover', 'node', this._formatNodeMouseover );
        cy.on('mouseout', 'node', this._formatNodeMouseout );
        //var pr = cy.elements().pageRank();
        this.cy = cy; // TODO: pass event to state and use this binding
    }

    render() { return ( <div/> ) }
}


