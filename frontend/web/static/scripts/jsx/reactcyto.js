import React, { Component } from 'react';
import cytoscape from 'cytoscape';
import cydagre from 'cytoscape-dagre';

cydagre(cytoscape);

let cyStyle = {
    height: '400px',
    display: 'block'
};

let conf = {
    boxSelectionEnabled: false,
    autounselectify: true,
    zoomingEnabled: true,
    style: [
        {
            selector: 'node',
            style: {
                'content': 'data(data.task)',
                'text-opacity': 0.5,
                'text-valign': 'center',
                'text-halign': 'right',
                'background-color': function (ele) {
                    const nodeData = ele.data();

                    switch (nodeData.data.status) {
                        case 'SUCCESS':
                            return "#00b200";
                        case 'PENDING':
                            return "#737373";
                        case 'FAILURE':
                            return "#b20000";
                        case 'RECEIVED':
                            return "#e59400";
                        default:
                            return "#9366b4";

                    }
                }
            }
        },
        {
            selector: 'edge',
            style: {
                'width': 2,
                "curve-style": "bezier",
                'target-arrow-shape': 'triangle',
                'line-color': gray[700],
                'target-arrow-color': gray[700]
            }
        }
    ],
    layout: {
        name: 'dagre'
    }
};

class ReactCyto extends Component {
    constructor(props) {
        super(props);
        this.state = { cy: {} }
    }

    componentDidMount() {
        conf.container = this.cyRef;
        conf.elements = this.props.data;
        const cy = cytoscape(conf);

        this.state = { cy };
        // cy.json();
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

export default ReactCyto;