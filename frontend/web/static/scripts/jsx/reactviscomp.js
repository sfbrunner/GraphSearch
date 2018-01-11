import React, { Component } from 'react';
//var Graph = require('react-graph-vis');
import Graph from 'react-graph-vis';

class ReactVisComp extends Component {
    getGraph() {
        return {
            nodes: [
                { id: 1, label: 'Node 1' },
                { id: 2, label: 'Node 2' },
                { id: 3, label: 'Node 3' },
                { id: 4, label: 'Node 4' },
                { id: 5, label: 'Node 5' }
            ],
            edges: [
                { from: 1, to: 2 },
                { from: 1, to: 3 },
                { from: 2, to: 4 },
                { from: 2, to: 5 }
            ]
        };
    }

    getOptions() {
        return {
            layout: {
                hierarchical: true
            },
            edges: {
                color: "#000000"
            },
            nodes: {
                color: "red"
            }
        };
    }

    getEvents() {
        return {
            select: function (event) {
                var { nodes, edges } = event;
                console.log(event);
            }
        };
    }

    render() {
        return (
            <Graph graph={this.getGraph()} options={this.getOptions()} events={this.getEvents()} />
        );
    }
}

export default ReactVisComp;