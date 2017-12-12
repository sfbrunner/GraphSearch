import React, { Component } from 'react';
//import {Sigma, RandomizeNodePositions, RelativeSize, NodeShapes, EdgeShapes, ForceAtlas2} from 'react-sigma';
//import ForceLink from 'react-sigma/lib/ForceLink'
import sigma from 'sigma'
import Tooltips from 'sigma/plugins/sigma.plugins.tooltips/sigma.plugins.tooltips'


class MyCustomSigma extends React.Component {
	constructor(props) {
        super(props)
        var myGraph = new sigma.classes.graph()
        myGraph.read(props.graph)
        myGraph.nodes().forEach(function(node, i, a) {
            node.x = Math.cos(Math.PI * 2 * i / a.length);
            node.y = Math.sin(Math.PI * 2 * i / a.length);
            node.size=8;
            node.color='#f00';
            });
        this.graph = myGraph
        this.settings = {
            clone: false,
            drawEdges: true,
            drawNodes: true,
            edgeColor: 'default',
            defaultEdgeColor: '#999'
          }
        }

    componentDidMount(){
        var mySigma = new sigma("MyGraph");
        mySigma.graph.addNode({
            // Main attributes:
            id: 'n0',
            label: 'Hello',
            // Display attributes:
            x: 0,
            y: 0,
            size: 1,
            color: '#f00'
          }).addNode({
            // Main attributes:
            id: 'n1',
            label: 'World !',
            // Display attributes:
            x: 1,
            y: 1,
            size: 1,
            color: '#00f'
          }).addEdge({
            id: 'e0',
            // Reference extremities:
            source: 'n0',
            target: 'n1'
          });




        mySigma.refresh();
    }
    
    render() {
        return(
            <div className="col-xs-6 offset-xs-3" id="MyGraph" style={{height:'400px', width:'600px'}}></div>
        )
    }
}

export default MyCustomSigma;   
