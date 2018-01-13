import React, { Component } from 'react';
//var Graph = require('react-graph-vis');
import Graph from 'react-graph-vis';

class TestTooltip extends Component {
    render() {
        return(
            <div style={{left:"100px", top:"100px", position:'absolute', width:'100px', height:'100px'}}><p>'Hello'</p></div>
        );
    }
}

class MyComponent extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        showComponent: false,
      };
      this._onButtonClick = this._onButtonClick.bind(this);
    }
  
    _onButtonClick() {
      this.setState({
        showComponent: true,
      });
    }
  
    render() {
      return (
        <div>
          <Button onClick={this._onButtonClick}>Button</Button>
          {this.state.showComponent ?
             <TestTooltip /> :
             null
          }
        </div>
      );
    }
  }

class ReactVisComp extends Component {
    getGraph() {
        return {
            nodes: [
                { id: 1, label: 'Node 1', title: 'NodeT 1' },
                { id: 2, label: 'Node 2', title: 'NodeT 2' },
                { id: 3, label: 'Node 3', title: 'NodeT 3' },
                { id: 4, label: 'Node 4', title: 'NodeT 4' },
                { id: 5, label: 'Node 5', title: 'NodeT 5' }
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
            edges: {
                color: "#000000"
            },
            nodes: {
                color: "red"
            },
            physics:{
                enabled: true,
                barnesHut: {
                  gravitationalConstant: -2000,
                  centralGravity: 0.3,
                  springLength: 95,
                  springConstant: 0.04,
                  damping: 0.09,
                  avoidOverlap: 0
                }
            },
            interaction: {
                hover: true,
                tooltipDelay: 1
            }
        };
    }

    getEvents() {
        return {
            select: function (event) {
                var { nodes, edges } = event;
                console.log(event);
                <TestTooltip />
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