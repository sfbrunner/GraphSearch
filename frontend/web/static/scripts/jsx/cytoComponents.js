import React from 'react';
import euler from 'cytoscape-euler';

window.$ = window.jQuery = require('jquery');
var cytoscape = require('cytoscape');
cytoscape.use(euler);

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
        'opacity': 0.5,
        'curve-style': 'haystack'
    }
}

var cytoStyle = [searchedNodeStyle, citedNodeStyle, edgeStyle]

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

var NodeBorderColor = Object.freeze({ 'default': 'grey', 'highlight': 'black' });
var NodeBorderWidth = Object.freeze({ 'default': '0.5', 'highlight': '3px solid #dadada' });

export class CytoGraph extends React.Component {
    // Wraps the cytoscape js library into react component
    // See https://github.com/cytoscape/cytoscape.js/issues/1468 for implementation recommendations

    constructor(props) {
        /**
         * We do not set a state on this component as all data is passed via props.
         */
        super(props);
        this.cy = undefined;
        this.tooltipTimeout = undefined;
        this.initialZoomLevel = undefined;
        this.initialPanLevel = undefined;
        // TODO: This needs to be done smarter. As we pass state as a reference in props, we cannot compare to this.props as they are alway the same as nextProps
        this.visualGraphState = JSON.parse(JSON.stringify(props.visualGraphState)); 
        this._nodeSelector = this._nodeSelector.bind(this);
        this.zoomGraph = this.zoomGraph.bind(this);
        this.highlightNodes = this.highlightNodes.bind(this);
        this._formatNodeMouseout = this._formatNodeMouseout.bind(this);
        this._formatNodeMouseover = this._formatNodeMouseover.bind(this);
        this._hideTooltip = this._hideTooltip.bind(this);
        this._renderTooltip = this._renderTooltip.bind(this);
        this._mountCytoGraph = this._mountCytoGraph.bind(this);
        this.visualGraphUpdate = this.visualGraphUpdate.bind(this);
        this.readingListHandler = this.readingListHandler.bind(this);
        this.calculateSets = this.calculateSets.bind(this);
        this.highlightOrDeselectNodes = this.highlightOrDeselectNodes.bind(this)
        this.selectedAuthorNodes = undefined;
        this.selectedPaperNodes = undefined;
    }

    componentWillUnmount(){
        this.cy.destroy();
    }

    _nodeSelector(nodeId) {
        /**
         * @param {int} nodeId: The id of the node in the graph.
         * Returns the nodes data stored on this node. 
         */
        return this.props.graph.nodes.filter(function (obj) { return obj.data.id == nodeId })[0].data;
    }

    zoomGraph(zoomIndicator){
        /**
         * @param {float} zoomIndicator: If zero refocus, if positive zoomIn, negative zoomOut
         */
        const zoomRate = 0.1;
        if (zoomIndicator == 0.0) {
            // This is a refocus event
            this.cy.pan(this.initialPanLevel);
            this.cy.zoom(this.initialZoomLevel);
        }
        else {
            var relativeLevel = zoomIndicator > 0 ? (1 + zoomRate) : (1 - zoomRate)
            this.cy.zoom(this.cy.zoom() * relativeLevel);
        }
    }

    highlightNodes(selector)
    {
        /**
        * @param {string} selector the selector according to http://js.cytoscape.org/#selectors
        * duration should not be set to 0 otherwise cytoscape will crash.
        */
        const DO_NOT_SET_TO_ZERO = 1;
        this.cy.nodes().animate(
            { style: { borderColor: NodeBorderColor.default, borderWidth: NodeBorderWidth.default } },
            { duration: DO_NOT_SET_TO_ZERO }
        );
        this.cy.$(`node[${selector}]`).select().animate(
            { style: { borderColor: NodeBorderColor.highlight, borderWidth: NodeBorderWidth.highlight } },
            { duration: DO_NOT_SET_TO_ZERO }
        );
    }

    calculateSets(setA, setB, setC){
        /**
        * @param {eles} setA the currently highlighted nodes
        * @param {eles} setB the nodes which remain highlighted
        * @param {eles} setC the new nodes which need to be hightlighted
        */
        var diffAB = setA.diff(setB);
        var diffBC = setB.diff(setC);

         // nodes which will have no color anymore
        var unselectA = diffAB.left.difference(setC);

        // nodes which have a single color according to setB
        var fullB = diffAB.both.difference(setC);

        // nodes which have both colors
        var mixed = diffBC.both.difference(setA);

        // nodes which have a single color according to setC
        var fullC = setC.difference(setA.union(setB));
        return { 'unselectA': unselectA, 'mixed': mixed, 'fullC': fullC, 'fullB': fullB };
    }

    highlightOrDeselectNodes(newNodes, oldNodes, stayingNodes, colorNew, colorStaying){
        var sets = this.calculateSets(oldNodes, stayingNodes, newNodes);
        sets.unselectA.filter(function(ele){return ele.data('group') == 'Cited'}).forEach(function(ele){ele.animate(
            { 
                style: {
                    'background-color': '#004cc6', 
                    }
            },
            { 
                duration: 1
            },
        )});
        sets.unselectA.filter(function(ele){return ele.data('group') == 'Searched'}).forEach(function(ele){ele.animate(
            { 
                style: {
                    'background-color': ele.data('node_col'), 
                     }
            },
            { 
                duration: 1
            },
        )});
        sets.fullC.animate(
            { 
                style: { 
                'background-color': colorNew,
                } 
            },
            { 
                duration: 1,
            }
        );
        sets.fullB.animate(
            { style: { 
                'background-color': colorStaying,
            } },
            { 
                duration: 1,
            }
        );
        sets.mixed.animate(
            { style: { 
                'background-color': '#ccff66',
            } },
            { 
                duration: 1,
            },
        );
    }

    highlightPapers(paperName){
        var selector = `journal_iso="${paperName}"`
        var newPaperNodes = this.cy.$(`node[${selector}]`).select()
        this.highlightOrDeselectNodes(newPaperNodes, this.selectedPaperNodes, this.selectedAuthorNodes, '#ffd000', '#39FF14')
        this.selectedPaperNodes = newPaperNodes
    }

    highlightAuthors(authorName){
        if (authorName == "")
        {
            // As the selector has a *= operator, we need to not match anything in case we deselect an author tag
            authorName = "asdfafkejrlaksjrlaes"
        }
        var selector = `authors*="${authorName}"`
        var newAuthorNodes = this.cy.$(`node[${selector}]`).select()
        this.highlightOrDeselectNodes(newAuthorNodes, this.selectedAuthorNodes, this.selectedPaperNodes, '#39FF14', '#ffd000')
        this.selectedAuthorNodes = newAuthorNodes
    }

    componentWillReceiveProps(nextProps) {
        /**
         * When this method is called, it does not mean that props changed.
         * This method is very perfomance critical.
         */

        if (nextProps.graph !== this.props.graph) {
            this.cy.elements().remove();
            if (nextProps.graph.nodes.length > 0){
                this.cy.add(nextProps.graph);
                this.cy.json(nextProps.graph);
                this.cy.layout(cytoEuler).run();
                this.cy.fit();
            }
        } 
        else
        {
            for (var propertyName in nextProps.visualGraphState){
                if (nextProps.visualGraphState[propertyName] !== this.visualGraphState[propertyName]){
                    this.visualGraphUpdate(propertyName, nextProps.visualGraphState[propertyName]);
                }
            };
        }
        // TODO: This needs to be done smarter. As we pass state as a reference in props, we cannot compare to this.props as they are alway the same as nextProps
        this.visualGraphState = JSON.parse(JSON.stringify(nextProps.visualGraphState));
    }

    shouldComponentUpdate() {
        return true;
    }

    visualGraphUpdate(propertyName, propertyValue){
        /**
        * @param {string} propertyName 
        * @param {any} propertyValue
        */
        switch(propertyName){
            case "zoomLevel":
                this.zoomGraph(propertyValue);
                break;
            case "nodeHighlighter":
                this.highlightPapers(this.props.visualGraphState.nodeHighlighter);
                this.highlightPapers(propertyValue);
                break;
            case "authorHighlighter":
                this.highlightAuthors(this.props.visualGraphState.nodeHighlighter);
                this.highlightAuthors(propertyValue);
            case "journalHighlighter":
                break;
            case "displayNodes":
                // TODO: Encapsulate and not call graph method directly
                propertyValue ? {} : this.cy.elements().remove();
                break;
            case "nodeFilter":
                break;
        }
    }

    _hideTooltip(event){
        this.props.contextMenuHandler({ 
            tooltipString: null, 
            contextMenuLocation: {'x' : 0, 'y': 0},
        });
    }

    _formatNodeMouseover(event){
        event.target.animate(
            { style: { borderColor: NodeBorderColor.highlight, borderWidth: NodeBorderWidth.highlight, 'shape': 'star' } },
            { duration: 10 }
        );
        this.tooltipTimeout = setTimeout(this._renderTooltip, 200, event);
    }

    _formatNodeMouseout(event){
        event.target.animate(
            { style: {borderColor: NodeBorderColor.default, borderWidth: NodeBorderWidth.default} },
            { duration: 10 }
        );
        clearTimeout(this.tooltipTimeout);
        this._hideTooltip(event);
        // setTimeout(this._hideTooltip, 300, event); //TODO: This will also remove tooltip when mouse is hovering
    }

    _renderTooltip(event) {
        var ncbiUrl = 'https://www.ncbi.nlm.nih.gov/pubmed/';
        var tooltipString = null;
        if (event.target === cy) {
            // nothing to do
        } else if (event.target.group() == 'nodes') {
            var node = this._nodeSelector(event.target.data().id);
            tooltipString = `<b><a href="${ncbiUrl}${node.id}" target="_blank">${node.title}</b></a>
            <br><i>${node.journal}</i><br><i>${node.pubDate}</i><br>${node.authors}`;
        } else if (event.target.group() == 'edges') {
            var citedNode = this._nodeSelector(event.target.data().target);
            var citingNode = this._nodeSelector(event.target.data().source);
            tooltipString = `<b>Citation</b>:<br><a href="${ncbiUrl}${citingNode.id}" target="_blank">
            ${citingNode.title}</a> (${citingNode.pubDate})<br><i>cites</i><br>
            <a href="${ncbiUrl}${citedNode.id}" target="_blank">${citedNode.title}</a> (${citedNode.pubDate})`;
        };
        this.props.contextMenuHandler({
            tooltipString: tooltipString,
            contextMenuLocation: {
                'x' : event.target.renderedPosition().x, 
                'y' : event.target.renderedPosition().y + event.target.height() / 2 }
            });
    }

    readingListHandler(event) {
        var ncbiUrl = 'https://www.ncbi.nlm.nih.gov/pubmed/';
        var id = event.target.data().id;
        var node = this._nodeSelector(id);
        this.props.readingListHandler({ [id]: `<b><a href="${ncbiUrl}${node.id}" target="_blank">${node.title}</b></a>
        <br><i>${node.journal}</i><br><i>${node.pubDate}</i><br>${node.authors}`})
    }

    _mountCytoGraph(){
        /** 
         * Attaches a cytoscape instance to the DOM using data from props
        */
       var cy = cytoscape({
            container: document.getElementById('cy'),
            elements: this.props.graph,
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
        cy.on('click', 'node', this.readingListHandler );
        //var pr = cy.elements().pageRank();
        this.cy = cy; // TODO: pass event to state and use this binding
        this.selectedAuthorNodes = this.cy.collection()
        this.selectedPaperNodes = this.cy.collection()
        this.initialZoomLevel = this.cy.zoom();
        this.initialPanLevel = this.cy.pan();
    }

    componentDidMount() {
        this._mountCytoGraph();
    }

    render() { return ( null ) }
}
