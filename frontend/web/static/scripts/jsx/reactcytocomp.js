import React, { Component } from 'react';
import { ReactCytoscape } from 'react-cytoscape';
import { keys, map, isArray, sortBy } from 'lodash';
import FRC, { Checkbox, CheckboxGroup, Input, RadioGroup, Row as FormsyRow, Select, File, Textarea } from 'formsy-react-components'
import numeral from 'numeral'
import request from 'superagent'
import { render } from 'react-dom'
import { Image, Grid, Col, Clearfix, Row } from 'react-bootstrap'

//import './reactcytostyle.css'

class ReactCytoComp extends Component {

        getElements() {
            return {
                nodes: [
                    { data: { id: 'a', parent: 'b' }, position: { x: 215, y: 85 } },
                    { data: { id: 'b' } },
                    { data: { id: 'c', parent: 'b' }, position: { x: 300, y: 85 } },
                    { data: { id: 'd' }, position: { x: 215, y: 175 } },
                    { data: { id: 'e' } },
                    { data: { id: 'f', parent: 'e' }, position: { x: 300, y: 175 } }
                ],
                edges: [
                    { data: { id: 'ad', source: 'a', target: 'd' } },
                    { data: { id: 'eb', source: 'e', target: 'b' } }
                ]
            };
        }
    
    render() {
        return(
            <ReactCytoscape containerID="cy" 
                elements={ this.getElements() } 
                cyRef={(cy) => { this.cyRef(cy) }} 
                cytoscapeOptions={{wheelSensitivity: 0.1}} 
                layout={{name: 'dagre'}} />
        );
    }

	cyRef(cy) {
		this.cy = cy;
		cy.on('tap', 'node', function (evt) {
			var node = evt.target;
			console.log('tapped ' + node.id());
		});
	}

	handleEval() {
		const cy = this.cy;
		const str = this.text.value;
		eval(str);
	}
}

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
        marginLeft:'-30px',
        verticalAlign:'top',
        lineHeight:'30px',
        position:'fixed',
        top:'5px'
    }
}

const Request = ({ onSubmit }) => (
   <FRC.Form onSubmit={onSubmit}>
       <fieldset>
		   <Input name="search_string" layout="vertical" id="search_string" value="epigenetics idh oncogenic" type="text" help="Let us create a network of your search results." addonAfter={<span type="submit" className="glyphicon glyphicon-search" defaultValue="Submit"/>} />
	   </fieldset>
   </FRC.Form>
)

const Pending = ({ id }) => <h2>Pending #{id}</h2>
const rootUrl = new URL(window.location.origin)
rootUrl.port = 8080
const apiUrl = new URL("/api/", rootUrl)

export class MainCyto extends Component {
    constructor(props) {
        super(props);
        this.state = { results: {}, pending: {} };
        this.onSubmit = this.onSubmit.bind(this)   
    }

    poll(id) {
        return () => {
            request.get(new URL(id, apiUrl))
            .end( (err, res) => { // call api with id -> will return task_id and if ready result
                if (err) return
                const { result } = res.body
                if (!result) return
                const { results, pending } = this.state
                clearInterval(pending[id])
                delete pending[id]
                this.setState({ results: { ...results, [id]: result } })
            })
        }
    }

    onSubmit({ search_string }) {
        const payload = { 'search_string': search_string, 'graph_format': 'cytoscape' }
        request.put(apiUrl).send(payload)
        .end( (err, res) => {
            if (err) return
            console.log(this.state)
            const { results, pending } = this.state
            console.log(res.body)
            const { result: id } = res.body
            const timers = {[id]:  setInterval(this.poll(id),  500)}
            this.setState({ pending: {...pending, ...timers} })
        })
    }
    
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
			layout: {
				improvedLayout: false,
				scale: 0.1
			},
            physics:{
                enabled: true,
				solver: 'barnesHut',
				scale: 0.1,
                barnesHut: {
                  gravitationalConstant: -2000,
                  springLength: 10,
                  springConstant: 0.01
                },
				forceAtlas2Based: {
					gravitationalConstant: -50,
					centralGravity: 0.01,
					springConstant: 0.08,
					springLength: 100,
					damping: 0.4,
					avoidOverlap: 0.5
				},
				repulsion: {
					centralGravity: 0.2,
					springLength: 200,
					springConstant: 0.05,
					nodeDistance: 100,
					damping: 0.09
				},
				hierarchicalRepulsion: {
					centralGravity: 0.0,
					springLength: 100,
					springConstant: 0.01,
					nodeDistance: 120,
					damping: 0.09
				},
				stabilization: {
					enabled: false,
					iterations: 1000,
					updateInterval: 25
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

    cyRef(cy) {
		this.cy = cy;
		cy.on('tap', 'node', function (evt) {
			var node = evt.target;
			console.log('tapped ' + node.id());
		});
	}

	handleEval() {
		const cy = this.cy;
		const str = this.text.value;
		eval(str);
	}

    render() {
        const { results, pending } = this.state

          const renderTooltip = function( obj ){
            var { event, index, id, data } = obj;
            console.log(data);
            var url = "https://www.ncbi.nlm.nih.gov/pubmed/" + data.id + "target=_blank"
            return <div width="150px"><b><a href={url}> {data.title}</a></b><br/><i> {data.journal}</i><br/><i> {data.pubDate} </i> <br/>{data.authors}</div>
          };

          const tooltipData = {
              event: "click",
              index: 1,
              id: 2,
              data: 3 
          };
        return (
            <div className="row">
                <div style={{width:"1000px", height:"1000px"}}>
                    <Request onSubmit={this.onSubmit} />
                    { map(sortBy(keys(pending), [x => -x]), id => <Pending key={id} id={id} />) }         
                    { map(sortBy(keys(results), [x => -x]), id => 
                        <ReactCytoscape containerID="cy" 
                        elements={ results[id] } 
                        cyRef={(cy) => { this.cyRef(cy) }} 
                        cytoscapeOptions={{wheelSensitivity: 0.1}} 
                        layout={{name: 'cola'}} />
                        ) }
                </div>
            </div>
        )
    }
}