import React, { Component } from 'react';
import cytoscape from 'cytoscape'
import cydagre from 'cytoscape-dagre'
import cyqtip from 'cytoscape-qtip'
import cyforcelayout from 'cytoscape-ngraph.forcelayout'
import {Sigma, RandomizeNodePositions, RelativeSize} from 'react-sigma';
import Graph from "react-graph-vis";
import { slide as Menu } from 'react-burger-menu'
import { keys, map, isArray, sortBy } from 'lodash'
import FRC, { Checkbox, CheckboxGroup, Input, RadioGroup, Row as FormsyRow, Select, File, Textarea } from 'formsy-react-components'
import numeral from 'numeral'
import request from 'superagent'
import { render } from 'react-dom'
import { Image, Grid, Col, Clearfix, Row } from 'react-bootstrap'

var divContentLanding = {
  contenttest: {
    position: 'relative',
	left: '20%',
	right: '20%',
	top: '36px',
	height: '1000px',
	border: '3px',
	borderColor: 'black',
	borderStyle: '',
  },
  contenttest2: {
    position: 'relative',
	height: '1000px',
	border: '3px',
	borderColor: 'black',
	borderStyle: '',
  },
  marginfree: {
    marginLeft: '0px'
  },
  contentdiv: {
	position:'relative',
	top:'30%'
  },
  h2: {
	verticalAlign:'bottom',
	lineHeight:'30px',
	position:'relative',
	top:'100%',
	textAlign:'center'
  },
  p: {
	textAlign:'center',
	color:'gray'
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
	top:'15px'
  }
}

const Request = ({ onSubmit }) => (
   <FRC.Form onSubmit={onSubmit}>
       <fieldset>
		   <Input name="addon-after" layout="vertical" id="search_string" value="epigenetics idh oncogenic" type="text" help="Let us create a network of your search results." addonAfter={<span type="submit" className="glyphicon glyphicon-search"/>} />
	   </fieldset>
	   {/*<fieldset>
           <Row>
               <input className="btn btn-primary" type="submit" defaultValue="Submit" />
           </Row>
       </fieldset>*/}
   </FRC.Form>
)

const Pending = ({ id }) => <h2>Pending #{id}</h2>
{/** const About = "" **/}
const rootUrl = new URL(window.location.origin)
rootUrl.port = 8080

class Main extends Component {
  constructor(props) {
      super(props);
      this.state = { results: {}, pending: {} };
      this.onSubmit = this.onSubmit.bind(this)   
  }

  poll(id) {
      return () => {
          request.get(new URL(id, rootUrl)).end( (err, res) => { // call api with id -> will return task_id and if ready result
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
      const payload = { search_string:    search_string, }
      request.put(rootUrl).send(payload).end( (err, res) => {
          if (err) return
          console.log(this.state)
          const { results, pending } = this.state
          console.log(res.body)
          const { result: id } = res.body
          const timers = {[id]:  setInterval(this.poll(id),  500)}
          this.setState({ pending: {...pending, ...timers} })
      })
  }

  render() {
      const { results, pending } = this.state
      return (
          <div className="row">
              <div>
                  <Request onSubmit={this.onSubmit} />
                  { map(sortBy(keys(pending), [x => -x]), id => <Pending key={id} id={id} />) }
                  { map(sortBy(keys(results), [x => -x]), id => <Cytoscape data={results[id]} />) }
                  
              </div>
          </div>
      )
  }
}

export class SearchLanding extends Component {
	render() {
		return (
		  		  <Grid>
				  <Row className="show-grid">
				  <Col md={8} xs={6}>
				  <div class="col-xs-12" style={{height:"10vh"}}></div>
				  </Col>
				  </Row>
				  <Row className="show-grid">
				  <Col md={8} xs={12}>
            		<h2 style={divContentLanding.h2}>GraphSearch</h2>
					<p></p>
					<p style={divContentLanding.p}>Welcome to the GraphSearch platform. Our mission is to make your biomedical literature search experience the best it can be. We take your search query and return a network of publications to you. The network contains the direct results of your search (in blue) as well as the publications they cite (in red). The structure of the network helps you to find highly cited publications and quickly identify publications that belong together.</p>
				</Col>
				</Row>
				<Row className="show-grid">
				<Col md={8} xs={12}>
					<Main />
				</Col>
				</Row>
				</Grid>
		)
	}
}

export class About extends Component {
	render() {
		return (
          <div className="row">
				<h2>About</h2>
				<p>{"We are a team of two: Ravi Mishra and Simon Brunner. Our mission is to improve how we explore the biomedical literature. As a researcher, you are used to receiving search results in the form of lists. In some cases, that is all you need. In many cases, a list hides a lot of information. What if you knew how each research publication connects with others through citations and authors? Can we help you find what you are looking for by displaying search results in the form of a network? Currently, it is our hypothesis that we can. Please let us know if we are succeeding or if you have other thoughts about our mission and project: contact@contact.com"}</p>
				<div class="col-xs-12" style={{height:"20px"}}></div>
				<Image src="/static/images/image_about.JPG" responsive />
				<div class="col-xs-12" style={{height:"30px"}}></div>
				<p><strong><a href="https://www.linkedin.com/in/ravi-mishra-1a2160153/" target="_blank">Ravi Mishra.</a> </strong>{"Ravi holds a Bachelor's degree in Economics from the University of Zurich. Realising that all the smart jobs go to mathematicians, he went on to obtain a Bachelor's in Math from the University of Zurich and a Master's in Math from ETH Zurich. He currently pursues a technical graduate training program at a leading finance institution in Zurich, Switzerland."}</p>
				<p><strong><a href="https://www.linkedin.com/in/simon-brunner-3631521a/" target="_blank">Simon Brunner.</a> </strong>{"Simon holds a Bachelor's degree in Biochemistry and a Master's degree in Systems Biology from ETH Zurich. He then pursued doctoral studies at the Lab of Molecular Biology (MRC-LMB) in Cambridge, United Kingdom and graduated with a PhD from the University of Cambridge. He currently pursues post-doctoral research at The Sanger Wellcome Trust Institute in Cambridge, UK."}</p>
		  </div>
	) }
}

// The Cytoscape components
cydagre( cytoscape );
cyqtip( cytoscape ); // register extension
cyforcelayout( cytoscape );


let cyStyle = {
    height: '1000px',
    width: '1000px',
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
                'width': '2px',
                'height': '2px',
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

class BurgerTest extends React.Component {
    constructor(props) {
        super(props);
    }
	
	showSettings (event) {
		event.preventDefault();
	}

	render() {
		return (
			<Menu>
				<a id="home" className="menu-item" href="/">Home</a>
			</Menu>
		);
	}
}

export default Cytoscape;   
