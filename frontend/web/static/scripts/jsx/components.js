import React, { Component } from 'react';
import { slide as Menu } from 'react-burger-menu'
import { keys, map, isArray, sortBy } from 'lodash'
import FRC, { Checkbox, CheckboxGroup, Input, RadioGroup, Row as FormsyRow, Select, File, Textarea } from 'formsy-react-components'
import numeral from 'numeral'
import request from 'superagent'
import { render } from 'react-dom'
import { Image, Grid, Col, Clearfix, Row } from 'react-bootstrap'
import CytoGraph from './cytoComponents'
import { Graph } from 'react-d3-graph'
import ReactToolip from 'react-tooltip'
import { Tooltip } from 'react-lightweight-tooltip'
var $ = require('jquery');
import { Network, WithTooltip, Nodes, Links } from '@data-ui/network'

// the graph configuration, you only need to pass down properties
// that you want to override, otherwise default ones will be used
const myConfig = {
    nodeHighlightBehavior: true,
    node: {
        color: 'lightgreen',
        size: 120,
        highlightStrokeColor: 'blue'
    },
    link: {
        highlightColor: 'lightblue'
    },
    staticGraph: false
};

class MyTooltip extends Component {

    render(){
        return (
            <div>
            <p data-tip="hello world">Tooltip</p>
            <ReactTooltip /> 
            </div>
        );
        }
}

// graph event callbacks
const onClickNode = function(nodeId) {
     //window.alert(`Clicked node ${nodeId}.fill`);
     //document.getElementById(nodeId)
     //return <MyTooltip/>
     console.log(nodeId)
     
};

const onMouseOverNode = function(nodeId) {

     //window.alert(`Mouse over node ${nodeId}`);
};

const onMouseOutNode = function(nodeId) {
     //window.alert(`Mouse out node ${nodeId}`);
};

const onClickLink = function(source, target) {
     //window.alert(`Clicked link between ${source} and ${target}`);
};

const onMouseOverLink = function(source, target) {
     //window.alert(`Mouse over in link between ${source} and ${target}`);
};

const onMouseOutLink = function(source, target) {
     //window.alert(`Mouse out link between ${source} and ${target}`);
};

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

class DataUI extends Component {

}

class Main extends Component {
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
        const payload = { 'search_string': search_string }
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

    render() {
        const { results, pending } = this.state
        function getRandomID() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
              const randomNumber = Math.random() * 16 | 0;
              const value = char === 'x' ? randomNumber : ((randomNumber & 0x3) | 0x8);
              return value.toString(16);
            });
          }
        const defaultNodes = [
            {
              x: 100,
              y: 200,
              id: '1',
              size: 10,
              opacity: 1,
              fill: '#e03131',
              label: <a href="https://www.google.com">User A</a>,
              type: 'Attr',
              journal: 'Nature',
              title: 'Blag',
              authors: 'blah blah',
              pubDate: '12.34.2333'
            },
            {
              x: 200,
              y: 200,
              id: '2',
              size: 10,
              opacity: 0.3,
              fill: '#5f3dc4',
              label: 'User B',
              type: 'User',
            },
            {
              x: 200,
              y: 100,
              id: '3',
              size: 15,
              opacity: 0.8,
              label: 'User C',
              type: 'User',
            },
          ];
          
          const defaultLinks = [
            {
              source: defaultNodes[1],
              target: defaultNodes[2],
              id: '4',
            },
            {
              source: defaultNodes[0],
              target: defaultNodes[2],
              id: '5',
            },
            {
              source: defaultNodes[0],
              target: defaultNodes[1],
              id: '6',
            },
          ];
          
          const defaultGraph = {
            nodes: defaultNodes,
            links: defaultLinks,
          };

          const renderTooltip = function( obj ){
            var { event, index, id, data } = obj;
            console.log(data);
            var url = "https://www.ncbi.nlm.nih.gov/pubmed/" + data.id + "target=_blank"
            return <div><b><a href={url}> {data.title}</a></b><br/><i> {data.journal}</i><br/><i> {data.pubDate} </i> <br/>{data.authors}</div>
          };

          const tooltipData = {
              event: "click",
              index: 1,
              id: 2,
              data: 3 
          };
        return (
            <div className="row">
                <div>
                    <Request onSubmit={this.onSubmit} />
                    { map(sortBy(keys(pending), [x => -x]), id => <Pending key={id} id={id} />) }         
                    { map(sortBy(keys(results), [x => -x]), id => <Network 
                        graph={results[id]} 
                        animated={true} 
                        height={200}  
                        width={400} 
                        ariaLabel={"myGraph"}
                        tooltipData={tooltipData}
                        renderTooltip={renderTooltip}/>) }
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
				        <div class="col-xs-12" style={{height:"2vh"}}></div>
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
