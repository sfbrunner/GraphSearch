import React, { Component } from 'react';
import cytoscape from 'cytoscape'
import cydagre from 'cytoscape-dagre'
import cyqtip from 'cytoscape-qtip'

cydagre( cytoscape );
cyqtip( cytoscape ); // register extension

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
        name: 'dagre'
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