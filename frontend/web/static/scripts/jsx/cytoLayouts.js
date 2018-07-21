// Provides layouts for different cytoscape algorithms

var cycola = require('cytoscape-cola');
var cyforcelayout = require('cytoscape-ngraph.forcelayout');
//cyforcelayout['iterations'] = 10000
//require(['cytoscape', 'cytoscape-ngraph.forcelayout'], function( cytoscape, cyforcelayout ){
//   cyforcelayout( cytoscape ); // register extension 
//  });


// register extensions
//cyforcelayout( cytoscape );
cycola(cytoscape);
cyforcelayout(cytoscape);
//var cycola = require('cytoscape-cola');
import coseBilkent from 'cytoscape-cose-bilkent';
//var cyarbor = require('cytoscape-arbor');
//var arbor = require('arbor');


// register extensions
//cyforcelayout( cytoscape );
//cycola(cytoscape);
//cyarbor( cytoscape, arbor ); // register extension

var cytoDefaultLayout = { name: 'random' }

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