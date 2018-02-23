import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import cytoscape from 'cytoscape';
import cycola from 'cytoscape-cola';
import dagre from 'cytoscape-dagre';
//import * from 'cytoscape-ngraph.forcelayout';
//var cyforcelayout = require('cytoscape-ngraph.forcelayout');

//require(['cytoscape', 'cytoscape-ngraph.forcelayout'], function( cytoscape, cyforcelayout ){
//    cyforcelayout( cytoscape ); // register extension 
//  });

//console.log(cyforcelayout)
//console.log(cyforcelayout['layout'])

//import * as cyforcelayout from 'cytoscape-ngraph.forcelayout';
//console.log(cyforcelayout)
cytoscape.use(cycola);
cytoscape.use(dagre);
//cytoscape.use(cyforcelayout);


/** React cytoscape component
 * props : style, elements, layout, cyRef,styleContainer, cytoscapeOptions
 */
class ReactCytoscapeWrapper extends Component {


	getCyID() {
		return this.props.containerID || 'cy';
	}

	getContainer() {
		let c = this.container;
		// console.log("container", c);
		return c;
	}

	defaultStyle() {
		return [
			{
				selector: 'node',
				css: {
					'content': function (ele) { return ele.data('label') || ele.data('id') },
					'text-valign': 'center',
					'text-halign': 'center'
				}
			},
			{
				selector: '$node > node',
				css: {
					'padding-top': '10px',
					'padding-left': '10px',
					'padding-bottom': '10px',
					'padding-right': '10px',
					'text-valign': 'top',
					'text-halign': 'center',
					'background-color': '#bbb'
				}
			},
			{
				selector: 'edge',
				css: {
					'target-arrow-shape': 'triangle'
				}
			},
			{
				selector: ':selected',
				css: {
					'background-color': 'black',
					'line-color': 'black',
					'target-arrow-color': 'black',
					'source-arrow-color': 'black'
				}
			}
		]
	}

	style() {
		return this.props.style || this.defaultStyle();
	}

	elements() {
		return this.props.elements || {};
	}

	layout() {
		return this.props.layout || { name: 'cola' };
	}

	cytoscapeOptions() {
		return this.props.cytoscapeOptions || {};
	}

	build() {
		let opts = Object.assign({
			container: this.getContainer(),

			boxSelectionEnabled: false,
			autounselectify: true,

			style: this.style(),
			elements: this.elements(),
			layout: this.layout(),
		}, this.cytoscapeOptions());

		this.cy = cytoscape(opts);

		if (this.props.cyRef) {
			this.props.cyRef(this.cy);
		}
		return this.cy;
	}

	componentWillUnmount() {
		this.clean();
	}

	componentDidMount() {
		this.build();
	}

	componentDidUpdate() {
		this.clean();
		this.build();
	}

	render() {
		let style = this.props.styleContainer || {};
		let styleContainer = Object.assign({ height: "100%", width: "100%", display: "block" }, style);
		return <div className="graph" id={this.getCyID()} ref={(elt) => { this.container = elt }} style={styleContainer}></div>;
	}

	clean() {
		if (this.cy) {
			this.cy.destroy();
		}
	}
}

export default ReactCytoscapeWrapper;