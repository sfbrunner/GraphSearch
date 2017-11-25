import React, { Component } from 'react';
import cytoscape from 'cytoscape'
import cydagre from 'cytoscape-dagre'
import cyqtip from 'cytoscape-qtip'
import cyforcelayout from 'cytoscape-ngraph.forcelayout'

cydagre( cytoscape );
cyqtip( cytoscape ); // register extension
cyforcelayout( cytoscape ); 


let cyStyle = {
    height: '600px',
    width: '1200px',
    display: 'block'
  };
  
let conf = {
    boxSelectionEnabled: false,
    autounselectify: true,
    zoomingEnabled: true,
    style: [
        {
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
                'font-size': '4pt',
                'text-transform': 'uppercase',
                //'text-background-color': 'white',
                //'text-background-opacity': 0.8,
                //'text-background-shape': 'roundrectangle',
                //'text-outline-color': 'white',
                "text-valign" : "center"
            },
        }, {
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
                'font-size': '4pt',
                'text-transform': 'uppercase',
                //'text-background-color': 'white',
                //'text-background-opacity': 0.8,
                //'text-background-shape': 'roundrectangle',
                //'text-outline-color': 'white',
                "text-valign" : "center"
            }
        }, {
            selector: 'edge',
            style: {
                'text-background-color': 'yellow',
                'text-background-opacity': 0.4,
                'width': '2px',
                'target-arrow-shape': 'triangle',
                'control-point-step-size': '140px',
                'opacity': 0.3
            }
        }
    ],

    layout: {
        name: 'cytoscape-ngraph.forcelayout',
        animate: true,
        refreshInterval: 1000, // in ms
        refreshIterations: 1000,
        fit: true,
        async: {
             // tell layout that we want to compute all at once:
             maxIterations: 1000,
             stepsPerCycle: 1000,

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
             gravity: -2,

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
             iterations: 1000,
             fit: true,
             /**
              * Maximum movement of the system which can be considered as stabilized
              */
             stableThreshold: 0.000009
         },
        //maxExpandIterations: 0,
        /*minDist: 20,
        gravity: 800,
        nodeSpacing: 5,
        edgeLengthVal: 50,
        animate: true,
        randomize: false,
        maxSimulationTime: 10000,
        avoidOverlaps: true,
        //unconstrIter: 100,
        userConstIter: 100,
        fit: true,
        repulsion: 4000,
        //infinite: true,
        padding: 10*/
    }
};
  
class Cytoscape extends Component {
    constructor(props) {
        super(props);
        this.state = { cy: {} }
    }

    componentDidMount() {
        conf.container = this.cyRef;
        conf.elements = this.props.data;
        const cy = cytoscape(conf);
        cy.elements().qtip({
            content: function() {
                return '<b><a href="https://www.ncbi.nlm.nih.gov/pmc/' + this.id() + 
                    '" target="_blank">' + this.data('title') + '</b></a>' +
                    '<br><i>' + this.data('journal') +
                    '</i><br><i>' + this.data('pubDate') + '</i>' +
                    '<br>' + this.data('authors')
                },
            position: {
                target: 'mouse',
                adjust: {
                    mouse: false
                }
            },
            style: {
                classes: 'qtip-bootstrap',
                tip: {
                    width: 16,
                    height: 8
                    }
            }
        });
        this.state = { cy };
        //cy.json();
    }

    shouldComponentUpdate() {
        return false;
    }

    componentWillReceiveProps(nextProps) {
        if (this.state.cy) {
            this.state.cy.destroy();
        }
        conf.container = this.cyRef;
        conf.elements = nextProps.data;
        const cy = cytoscape(conf);

        this.state = { cy };
    }

    componentWillUnmount() {
        if (this.state.cy) {
            this.state.cy.destroy();
        }
    }

    render() {
        return <div style={cyStyle} ref={(cyRef) => {
            this.cyRef = cyRef;
        }}/>
    }
}

export default Cytoscape;   
