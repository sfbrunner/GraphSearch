import React, { Component } from 'react';
import { render } from 'react-dom'
import { Image, Grid, Col, Clearfix, Row, Navbar, Nav, NavItem, NavDropdown, MenuItem, Button, form, ButtonToolbar, FormGroup, FormControl, InputGroup, Glyphicon, Panel } from 'react-bootstrap'
import { CytoGraph, GraphInfo } from './cytoComponents'
import { DotLoader } from 'react-spinners';
import { keys, map, isArray, sortBy } from 'lodash';
import ReactGA from 'react-ga';
import numeral from 'numeral'
import request from 'superagent'
import queryString from 'query-string'

var bgImage = require('../../images/main_img-01.svg')

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
        textAlign:'center',
        color:'#dadada'
    },
    p: {
        textAlign:'center',
        color:'#dadada'
    }
}

export class MainNav extends Component {
    render() {
        return (
            <Navbar fixedTop={ true } inverse={ false } fluid={ true }>
                <Navbar.Header>
                    <Navbar.Brand>
                    <a href="/">GraphSearch</a>
                    </Navbar.Brand>
                </Navbar.Header>
                <Nav>
                    <NavItem eventKey={1} href="/about">
                    About
                    </NavItem>
                    <NavItem eventKey={2} href="/searchactive2">
                    Search
                    </NavItem>
                </Nav>
            </Navbar>
        )
    }
}

export class SearchLanding extends Component {

    constructor(props) {
        super(props);
        this.handleForm = this.handleForm.bind(this);
    }

    handleForm(event) {
        event.preventDefault();
        var searchString = event.target.childNodes[0].children.searchString.value;
        console.log(searchString)
        this.props.history.push({pathname: '/searchactive2', state: {searchQuery: searchString}})
    }

	render() {
		return (
            <div style={{width:'100%', float:'left', height:'80%', position: 'absolute', left: '0%', 
            backgroundImage: "url(" + bgImage + ")", backgroundRepeat: "no-repeat" }}>
		  	<Grid>
                <Row style={{height:'20vh'}}>
                </Row>
				<Row className="show-grid">
                    <Col md={2}></Col>
				    <Col md={8}>
                    <Panel style={{backgroundColor: '#0000007d', borderStyle: 'none'}}>
                        <Panel.Body>
            		    <h2 style={divContentLanding.h2}>GraphSearch</h2>
					    <p></p>
					    <p style={divContentLanding.p}>Welcome to the GraphSearch platform. Our mission is to make your biomedical literature search experience the best it can be. We take your search query and return a network of publications to you. The network contains the direct results of your search (in blue) as well as the publications they cite (in red). The structure of the network helps you to find highly cited publications and quickly identify publications that belong together.</p>
                        <form onSubmit={this.handleForm}>
                        <InputGroup>
                        <FormControl type="text" placeholder="Type your search query and hit <Enter>" id="searchString"/>
                        <InputGroup.Addon>
                        <Glyphicon glyph="search" />
                        </InputGroup.Addon>
                        </InputGroup>
                        </form>
                        </Panel.Body>
                    </Panel>
                    </Col>
                    <Col md={2}></Col>
				</Row>
				<Row className="show-grid">
                    <Col md={2}></Col>
				    <Col md={8}><p><br/></p></Col>
                    <Col md={2}></Col>
				</Row>
			</Grid>
            </div>
		)
	}
}

export class SearchActive extends Component {
	render() {
		return (
            <Grid>
                <Row className="show-grid">
                    <Col md={8} xs={12}>
                        <h2>SearchActive</h2>
                    </Col>
                </Row>
                <Row className="show-grid">
                    <Col md={8} xs={12} style={{marginLeft:"20px"}}>
                    </Col>
                </Row>
            </Grid>
	) }
}

export class SearchActive2 extends Component {
	render() {
		return (
            <div style={{width:'100%', float:'left', height:'100%'}}>
                <div style={{background:'grey', height:'100%', width:'20%'}}>
                    <h2>Info div</h2>
                </div>
                <div style={{background:'red', height:'100%', width:'70%'}}>
                    <h2>Main network</h2>
                </div>
            </div>
	) }
}

const rootUrl = new URL(window.location.origin)
rootUrl.port = 8080
const apiUrl = new URL("/api/", rootUrl)
const maxTime = 60 * 1000;
const pollInterval = 500;

export class SearchActive4 extends Component {

    constructor(props) {
        super(props);
        this.state = { graphJson: {}, pending: {}, loading: false, foundResults: false, numApiCalls: 0, searchString: null };
        this.onSubmit = this.onSubmit.bind(this);
        this.cytoGraph = React.createRef();
        this.search = this.search.bind(this);
        this.searchHint = 'other hint'
    }

    componentDidMount() {
        if(this.props.location.state != undefined)
        {
            const values = this.props.location.state.searchQuery
            console.log('in constructor')
            console.log(values)
            this.searchHint = values
            this.search(values)
        }
    }

    poll(id) {
        return () => {
            request.get(new URL(id, apiUrl))
                .end((err, res) => { // call api with id -> will return task_id and if ready result
                    if (err) return;
                    const { result } = res.body;
                    const { numApiCalls } = this.state;
                    if (!result) 
                    {
                        if (numApiCalls > maxTime/pollInterval)
                        {
                            const { pending } = this.state;
                            clearInterval(pending[id]);
                            delete pending[id];
                            this.setState({ graphJson: {[id]: null }, loading: false, foundResults: false, numApiCalls: 0 });
                        }
                        else
                        {
                            this.setState({numApiCalls: numApiCalls+1});
                        }
                        return;
                    }
                    else
                    {
                        const { pending } = this.state;
                        clearInterval(pending[id]);
                        delete pending[id];
                        this.setState({ graphJson: { [id]: result }, loading: false, foundResults: (result.stats.num_results > 0), numApiCalls: 0 });
                    }
                })
        }
    }

    search(searchQuery) {
        this.setState({ loading: true}) //, searchString: searchQuery});
        ReactGA.event({ category: 'Search', action: 'Submitted search', label: searchQuery });
        const payload = { 'search_string': searchQuery, 'graph_format': 'cytoscape' };
        request.put(apiUrl).send(payload)
            .end((err, res) => {
                if (err) return;
                const { graphJson, pending, loading, foundResults } = this.state;
                const { result: id } = res.body;
                const timers = { [id]: setInterval(this.poll(id), pollInterval) };
                setTimeout(() => { clearInterval( timers[id] );}, maxTime * 1.5);
                this.setState({ pending: { ...pending, ...timers } });
            })
    }

    onSubmit(event) {
        event.preventDefault();
        this.search(event.target.childNodes[0].children.searchString.value);
    }

	render() {
        var graphMenuStyle = {
            paddingRight: '20px',
            paddingLeft: '20px',
            verticalAlign: 'middle',
            display: 'block',
            position: 'absolute', 
            left: '75%',
            top: '95%',
            pointerEvents: 'all',
            width: '40%',
            height: '100px',
            borderRadius: '7px',
            padding: '7px',
            zIndex: '10100'
        };
        const noRestultsString = "Sorry, your search yielded no results. Please try again.";
        const { graphJson, pending, loading } = this.state;
		return (
            <div>
                <div style={{background:'#d3d3d34d',
                        verticalAlign: 'left',
                        display: 'block',
                        position: 'absolute', 
                        left: '0%',
                        top:  36,
                        pointerEvents: 'all',
                        width: '22vw',
                        height: '100%',
                        zIndex: '1001',
                        borderStyle: 'solid',
                        borderColor: 'lightgrey',
                        borderWidth: '0.5px'
                    }}>
                    <Row style={{height:'2vh'}}></Row>
                    <Row>
                        <Col md={1}>
                        </Col>
                        <Col md={10}>
                            <div style={{left:'10px'}}>
                            <form onSubmit={this.onSubmit}>
                                <InputGroup>
                                    <FormControl type="text" id="searchString" defaultValue = { this.searchHint }/>
                                    <InputGroup.Addon>
                                        <Glyphicon glyph="search" />
                                    </InputGroup.Addon>
                                </InputGroup>
                            </form>
                            </div>
                        </Col>
                        <Col md={1}>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={1}></Col>
                        <Col md={10}>
                        {map(keys(graphJson), id => !this.state.loading
                            ? (this.state.foundResults ? <GraphInfo data={graphJson[id].stats}/> : <h2>{noRestultsString}</h2>)
                            : {})
                        }
                        </Col>
                        <Col md={1}></Col>
                    </Row>
                </div>
                <div style={{width:'100%', float:'left', height:'100%'}}>
                    <div style={{verticalAlign: 'middle', left: '50%', top:'20%'}}>
                    <DotLoader color={'#000000'} loading={loading} />
                    </div>
                    <div id='cy' style={{width:'100vw', float:'left', height:'90vh', position: 'relative'}}>
                    {map(keys(graphJson), id => !this.state.loading
                            ? (this.state.foundResults ? <CytoGraph data={graphJson[id]}/> : <h2>{noRestultsString}</h2>)
                            : {})}
                    </div>
                    {!this.state.loading && this.state.foundResults ? 
                    <ButtonToolbar style={graphMenuStyle} >
                        <Button onClick={this.cytoGraph._refocusGraph}><span class="glyphicon glyphicon-fullscreen"></span></Button>
                        <Button onClick={this.cytoGraph._hideSecondaryNodes}><span class="glyphicon glyphicon-plus"></span></Button>
                        <Button onClick={this.cytoGraph._hidePrimaryNodes}><span class="glyphicon glyphicon-minus"></span></Button>
                    </ButtonToolbar >
                    : <div/>}
                </div>
            </div>
	) }
}

export class About extends Component {
	render() {
		return (
            <Grid>
                <Row className="show-grid">
                    <Col md={8} xs={12}>
                        <h2>About</h2>
                    </Col>
                </Row>
                <Row className="show-grid"><Col md={8} xs={12}>
                <p>{"We are a team of two: Ravi Mishra and Simon Brunner. Our mission is to improve how we explore the biomedical literature. As a researcher, you are used to receiving search results in the form of lists. In some cases, that is all you need. In many cases, a list hides a lot of information. What if you knew how each research publication connects with others through citations and authors? Can we help you find what you are looking for by displaying search results in the form of a network? Currently, it is our hypothesis that we can. Please let us know if we are succeeding or if you have other thoughts about our mission and project: contact@contact.com"}</p>
                </Col></Row>
                <div class="col-xs-12" style={{height:"20px"}}></div>
                <Row className="show-grid"><Col md={8} xs={12}>
				<Image src="/static/images/image_about.JPG" responsive />
                </Col></Row>
				<div class="col-xs-12" style={{height:"30px"}}></div>
                <Row className="show-grid"><Col md={8} xs={12}>
				<p><strong><a href="https://www.linkedin.com/in/ravi-mishra-1a2160153/" target="_blank">Ravi Mishra.</a> </strong>{"Ravi holds a Bachelor's degree in Economics from the University of Zurich. Realising that all the smart jobs go to mathematicians, he went on to obtain a Bachelor's in Math from the University of Zurich and a Master's in Math from ETH Zurich. He currently pursues a technical graduate training program at a leading finance institution in Zurich, Switzerland."}</p>
				</Col></Row>
                <Row className="show-grid"><Col md={8} xs={12}>
                <p><strong><a href="https://www.linkedin.com/in/simon-brunner-3631521a/" target="_blank">Simon Brunner.</a> </strong>{"Simon holds a Bachelor's degree in Biochemistry and a Master's degree in Systems Biology from ETH Zurich. He then pursued doctoral studies at the Lab of Molecular Biology (MRC-LMB) in Cambridge, United Kingdom and graduated with a PhD from the University of Cambridge. He currently pursues post-doctoral research at The Sanger Wellcome Trust Institute in Cambridge, UK."}</p>
                </Col></Row>
            </Grid>
	) }
}
