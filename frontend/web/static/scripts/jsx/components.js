import React, { Component } from 'react';
import { render } from 'react-dom'
import { 
    Image, Grid, Col, Clearfix, Row, Navbar, Nav, NavItem, NavDropdown, MenuItem, 
    Button, form, ButtonToolbar, FormGroup, FormControl, Popover, Badge,
    InputGroup, Glyphicon, Panel, ControlLabel, Form, Modal } from 'react-bootstrap'
import { CytoGraph, GraphInfo } from './cytoComponents'
import { DotLoader } from 'react-spinners';
import { keys, map, isArray, sortBy } from 'lodash';
import ReactGA from 'react-ga';
import numeral from 'numeral'
import request from 'superagent'
var createIssue = require( 'github-create-issue');
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

class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }
  
    componentDidCatch(error, info) {
      // Display fallback UI
      this.setState({ hasError: true });
      // You can also log the error to an error reporting service
      // logErrorToMyService(error, info);
    }
  
    render() {
      if (this.state.hasError) {
        // You can render any custom fallback UI
        return <h1>Sorry, something went wrong. Please try again.</h1>;
      }
      return this.props.children;
    }
}

export class MainNav extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Navbar fixedTop={true} inverse={true} fluid={true}>
                <Navbar.Header>
                    <Navbar.Brand>
                    <a href="/">brightfield.io</a>
                    </Navbar.Brand>
                </Navbar.Header>
                <Navbar.Collapse>
                    <Nav>
                        <NavItem eventKey={1} href="/about">
                            About
                        </NavItem>
                        </Nav>
                    <Nav pullRight>
                        <Navbar.Form >
                            <FeedbackModal/>                
                        </Navbar.Form>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        )
    }
}

export class SearchNav extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Navbar fixedTop={true} inverse={true} fluid={true}>
                <Navbar.Header>
                    <Navbar.Brand>
                    <a href="/">brightfield.io</a>
                    </Navbar.Brand>
                </Navbar.Header>
                <Navbar.Collapse>
                    <Nav>
                        <NavItem eventKey={1} href="/about">
                            About
                        </NavItem>
                        </Nav>
                        <Nav>
                        <Navbar.Form>
                            <form onSubmit={this.props.formHandler}>
                                <InputGroup>
                                    <FormControl type="text" id="searchString" style={{width:'400px'}}/>
                                    <InputGroup.Addon>
                                        <Glyphicon glyph="search" />
                                    </InputGroup.Addon>
                                </InputGroup>
                            </form>
                        </Navbar.Form>
                        </Nav>
                    <Nav pullRight>
                        <Navbar.Form >
                            <FeedbackModal/>                
                        </Navbar.Form>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        )
    }
}

export class SearchLanding extends Component {

    constructor(props) {
        super(props);
        this.onSubmit = this.onSubmit.bind(this);
    }

    onSubmit(event) {
        event.preventDefault();
        var searchString = event.target.childNodes[0].children.searchString.value;
        this.props.history.push({pathname: '/searchactive', state: {searchQuery: searchString}})
    }

	render() {
		return (
            <div>
            <div style={{ height:"36px" }}><MainNav/></div>
            <div style={{width:'100%', float:'left', height:'80%', position: 'absolute', left: '0%', 
            backgroundImage: `url(${bgImage})`, backgroundRepeat: "no-repeat", backgroundSize:'cover' }}>
		  	<Grid>
                <Row style={{height:'20vh'}}>
                </Row>
				<Row className="show-grid">
                    <Col md={2}></Col>
				    <Col md={8}>
                    <Panel style={{backgroundColor: '#0000007d', borderStyle: 'none'}}>
                        <Panel.Body>
            		    <h2 style={divContentLanding.h2}>Let us illuminate your research.</h2>
					    <p></p>
					    <p style={divContentLanding.p}>Our mission is to make your biomedical literature search experience the best it can be. We take your search query and return a network of publications to you. The network contains the direct results of your search (in blue) as well as the publications they cite (in red). The structure of the network helps you to find highly cited publications and quickly identify publications that belong together.</p>
                        <form onSubmit={this.onSubmit}>
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
            </div>
		)
	}
}

class ContextMenu extends React.Component {
/**
 * Component to render tooltip on Graph
 */

    constructor(props){
        super(props);
        this.state = props.contextMenuState;
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.contextMenuState.tooltipString !== this.state.tooltipString) {
            this.setState(nextProps.contextMenuState);
        }
    }

    shouldComponentUpdate(){
        return true;
    }

    render() {
        var tooltipWidth = 250;
        var tooltipHeight = 180;
        var location = this.state.contextMenuLocation;
        var contentMenuStyle = {
            display: this.state.tooltipString != null && location ? 'block' : 'none',
            position: 'absolute', 
            left: location ? (location.x-tooltipWidth / 2 + 15) : 0, // 15px offset from  container-fluid padding
            top: location ? (location.y + 36) : 0, // 36px offset from div height
            pointerEvents: 'all',
            width: tooltipWidth,
            height: tooltipHeight,
            borderRadius: '7px',
            padding: '0px',
            zIndex: '10001',
        };
        var popoverStyle = 
        {
            positionTop: location ? (location.x-tooltipWidth/2) : 0,
            positionLeft: location ? (location.y) : 0,
        }

        return (
            <div id="results" 
                style={contentMenuStyle} 
                onClick={(e) => {e.stopPropagation(); e.nativeEvent.stopImmediatePropagation()}}>
                <Popover id="tooltipPopover" placement="bottom" style={popoverStyle}>
                    <div dangerouslySetInnerHTML={{ __html: this.state.tooltipString}} />
                </Popover>
            </div>
        );
    }

}

class GraphSummaryDisplay extends Component {

    constructor(props){
        super(props);
        this.state = { stats: props.data };
    }

    render(){
        var graphSummaryStyle = {
            paddingRight: '20px',
            paddingLeft: '20px',
            verticalAlign: 'middle',
            display: 'block',
            position: 'absolute', 
            left: '78%',
            top: '5%',
            pointerEvents: 'all',
            width: '75%',
            height: '100px',
            borderRadius: '7px',
            padding: '7px',
            zIndex: '10001'
        };
        var graphSummaryStyleLeft = {
            paddingRight: '20px',
            paddingLeft: '20px',
            verticalAlign: 'middle',
            display: 'block',
            position: 'absolute', 
            left: '23%',
            top: '5%',
            pointerEvents: 'all',
            width: '75%',
            height: '100px',
            borderRadius: '7px',
            padding: '7px',
            zIndex: '10001'
        };
        var statsMenuStyle = {
            display: 'block',
            pointerEvents: 'all',
            zIndex: '10001',
            marginTop: '10px',
            padding: '5px',
            paddingBottom: '5px',
            borderWidth: '0.5px',
            borderRadius: '5px',
            background:'white'
        };
        var gradient_svg = <svg width="100" height="20">
        <defs>
            <linearGradient id="MyGradient">
                <stop offset="5%" stopColor="white" />
                <stop offset="95%" stopColor="red" />
            </linearGradient>
        </defs>
        <rect fill="url(#MyGradient)" x="0" y="10" width="100" height="20" />
        </svg>

        return(
        <div>
        <div style={graphSummaryStyleLeft}>
            <Row style={statsMenuStyle}>
                <strong>Direct hits </strong>
                <Badge style={{backgroundColor:'#004cc6'}}>{ this.state.stats.num_results }</Badge>
                <strong> | Cited publications </strong>
                <Badge style={{backgroundColor:'red'}}>{ this.state.stats.num_citations }</Badge>
                <strong> | Citation links </strong>
                <Badge style={{backgroundColor:'lightgrey'}}>{ this.state.stats.num_links }</Badge>
            </Row>
        </div>
        <div style={graphSummaryStyle}>
            <Row style={statsMenuStyle}>
                <div style={{whiteSpace: 'nowrap', overflow:'hidden', display:'inline-block'}}>
                    <strong>Citations per publication: </strong>
                    <Badge style={{backgroundColor:'lightgrey'}}>0</Badge>{'\u00A0'}{ gradient_svg }{'\u00A0'}
                    <Badge style={{backgroundColor:'red'}}>{this.state.stats.max_degree_cited}</Badge>
                </div>
            </Row>
        </div>
        </div>
        )
    }
}

class GraphHelperMenu extends Component {

    constructor(props){
        super(props);
        this.handleRefocus = this.handleRefocus.bind(this);
        this.handleZoomIn = this.handleZoomIn.bind(this);
        this.handleZoomOut = this.handleZoomOut.bind(this);
    }

    handleRefocus(e){
        this.props.handleRefocus();
    }

    handleZoomIn(e){
        this.props.handleZoomIn();
    }

    handleZoomOut(e){
        this.props.handleZoomOut();
    }

    render(){
        var graphHelperMenuStyle = {
            paddingRight: '20px',
            paddingLeft: '20px',
            verticalAlign: 'middle',
            display: 'block',
            position: 'absolute', 
            left: '80%',
            top: '93%',
            pointerEvents: 'all',
            width: '40%',
            height: '100px',
            borderRadius: '7px',
            padding: '7px',
            zIndex: '10100'
        };
        return(
            <ButtonToolbar style={graphHelperMenuStyle} >
                <Button onClick={this.handleRefocus}><span class="glyphicon glyphicon-fullscreen"></span></Button>
                <Button onClick={this.handleZoomIn}><span class="glyphicon glyphicon-plus"></span></Button>
                <Button onClick={this.handleZoomOut}><span class="glyphicon glyphicon-minus"></span></Button>
            </ButtonToolbar >
        )
    }
}

const rootUrl = new URL(window.location.origin)
rootUrl.port = 8080
const apiUrl = new URL("/api/", rootUrl)
const maxTime = 30 * 1000; // miliseconds
const pollInterval = 500;

export class SearchActive extends Component {

    constructor(props) {
        super(props);
        var defaultVisualGraphState = {
            zoomLevel: 0.7,
            nodeFilter: null,
            nodeHighlighter: null,
            displayNodes: true
        };
        var defaultContextMenuState = {
            tooltipString: null,
            contextMenuLocation: null,
        };
        this.state = { 
            visualGraphState: defaultVisualGraphState,
            contextMenuState: defaultContextMenuState,
            graphJson: {}, 
            pending: {}, 
            loading: false, 
            foundResults: false, 
            numApiCalls: 0, 
            searchString: null,
        };
        this.contextMenuHandler = this.contextMenuHandler.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.search = this.search.bind(this);
        this.handleRefocus = this.handleRefocus.bind(this);
        this.handleZoomIn = this.handleZoomIn.bind(this);
        this.handleZoomOut = this.handleZoomOut.bind(this);
        this.nodeHandler = this.nodeHandler.bind(this);
        this.nodeHighlighter = this.nodeHighlighter.bind(this);
        this.authorHighlighter = this.authorHighlighter.bind(this);
        this.updateVisualGraphState = this.updateVisualGraphState.bind(this);
    }

    componentDidMount() {
        console.log(`componentDidMount: ${this.props.location.state.searchQuery}`);
        this.search(this.props.location.state.searchQuery);
    }

    onSubmit(event) {
        event.preventDefault();
        event.stopPropagation();
        this.updateVisualGraphState({"displayNodes": false}); // Need to remove graph manually
        this.search(event.target.childNodes[0].children.searchString.value);
    }

    search(searchQuery) {
        ReactGA.event({ category: 'Search', action: 'Submitted search', label: searchQuery });
        this.setState({loading: true, foundResults: false});
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

    poll(id) {
        return () => {
            request.get(new URL(id, apiUrl))
                .end((err, res) => { // call api with id -> will return task_id and if ready result
                    if (err) return;
                    const { result } = res.body;
                    const { numApiCalls } = this.state;
                    if (!result) {
                        if (numApiCalls > maxTime / pollInterval) {
                            const { pending } = this.state;
                            clearInterval(pending[id]);
                            delete pending[id];
                            this.setState({ loading: false, numApiCalls: 0 });
                        }
                        else {
                            this.setState({ numApiCalls: numApiCalls + 1 });
                        }
                    }
                    else {
                        const { pending } = this.state;
                        clearInterval(pending[id]);
                        delete pending[id];
                        this.updateVisualGraphState({"displayNodes": true}); // Need to add graph manually
                        this.setState({ graphJson: { [id]: result }, loading: false, foundResults: (result.stats.num_results > 0), numApiCalls: 0 });
                    }
                })
        }
    }

    updateVisualGraphState(updateDict){
        var visualGraphState = this.state.visualGraphState;
        for(var propertyName in updateDict){
            visualGraphState[propertyName] = updateDict[propertyName];
        };
        this.setState({visualGraphState: visualGraphState});
    }

    contextMenuHandler(contextMenuState){
        this.setState({contextMenuState: contextMenuState});
    }

    nodeHandler(filter){
        this.updateVisualGraphState({"nodeFilter": filter});
    }

    nodeHighlighter(filter){
        this.updateVisualGraphState({"nodeHighlighter": filter});
    }

    authorHighlighter(filter){
        this.updateVisualGraphState({"authorHighlighter": filter})
    }

    handleZoomIn(){
        this.updateVisualGraphState({"zoomLevel": Math.min(this.state.visualGraphState.zoomLevel + 0.1, 3.0)});
    }

    handleZoomOut(){
        this.updateVisualGraphState({"zoomLevel": Math.max(this.state.visualGraphState.zoomLevel - 0.1, 0.0)});
    }

    handleRefocus(){
        this.updateVisualGraphState({"zoomLevel": 1.0});
    }

	render() {
        var graphMenuStyle = {
            background:'#d3d3d34d',
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
        }
        
        const noResultsString = "Sorry, your search yielded no results. Please try again.";
        const { graphJson, pending, loading } = this.state;
		return (
            <div>
                <div style={{ height:"36px" }}><SearchNav formHandler={this.onSubmit}/></div>
            <div>
                <ErrorBoundary>
                <div style={graphMenuStyle}>
                    <Row style={{height:'2vh'}}></Row>
                    <Row>
                        <Col md={1}/>
                    </Row>
                    <Row>
                        <Col md={1}></Col>
                        <Col md={10}>
                        {map(keys(graphJson), id => !this.state.loading
                            ? (this.state.foundResults ? <GraphInfo data={graphJson[id].stats} nodeHandler={this.nodeHandler} nodeHighlighter={this.nodeHighlighter} authorHighlighter={this.authorHighlighter}/> : <h2>{noResultsString}</h2>)
                            : <div/>)}
                        </Col>
                        <Col md={1}></Col>
                    </Row>
                </div>
                <div style={{left: '60%', top:'40%', position: 'absolute', bottom: 0, height: '50px'}}>
                    <DotLoader color={'#000000'} loading={this.state.loading}/>
                </div>
                <div style={{width:'100%', float:'left', height:'100%'}}>
                    <div id='cy' style={{width:'100%', float:'left', height:'100%', position:'absolute', zIndex:'999'}}>
                        {map(keys(graphJson), id => <CytoGraph graph={graphJson[id].graph} contextMenuHandler={this.contextMenuHandler} visualGraphState={this.state.visualGraphState} />)};
                    </div>
                    <ContextMenu contextMenuState={this.state.contextMenuState} />
                    <GraphHelperMenu handleRefocus={this.handleRefocus} handleZoomIn={this.handleZoomIn} handleZoomOut={this.handleZoomOut}/>
                    {map(keys(graphJson), id => !this.state.loading
                        ? (this.state.foundResults ? <GraphSummaryDisplay data={graphJson[id].stats}/> : <div/>)
                        : <div/>)}
                </div>
                </ErrorBoundary>
            </div>
            </div>
	) }
}

export class About extends Component {
	render() {
		return (
            <div>
            <div style={{ height:"36px" }}><MainNav/></div>
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
            </div>
	) }
}

export class FeedbackModal extends Component {
    constructor() {
      super();
  
      this.state = {
        modalIsOpen: false,
        col_title: 'black'
      };
  
      this.openModal = this.openModal.bind(this);
      this.afterOpenModal = this.afterOpenModal.bind(this);
      this.closeModal = this.closeModal.bind(this);
      this.issue_callback = this.issue_callback.bind(this);
      this.hideModal = this.hideModal.bind(this);

    }
     
    issue_callback( error, issue, info ) {
        // Check for rate limit information...
        if ( info ) {
            console.error( 'Limit: %d', info.limit );
            console.error( 'Remaining: %d', info.remaining );
            console.error( 'Reset: %s', (new Date( info.reset*1000 )).toISOString() );
        }
        if ( error ) {
            throw new Error( error.message );
        }
        console.log( JSON.stringify( issue ) );
        // returns <issue_data>
    }
  
    afterOpenModal() {
      // references are now sync'd and can be accessed.
    }
  
    openModal() {
      this.setState({modalIsOpen: true});
    }

    hideModal() {
        this.setState({modalIsOpen: false});
    }
  
    closeModal(event) {
        event.preventDefault();
        var feedback_title = event.target.childNodes[0].children.feedback_title.value;
        var feedback_body = event.target.childNodes[0].children.feedback_body.value;
        { feedback_title==''
            ? this.setState({col_title: 'red'})
            : this.setState({col_title: 'black'})
        }
        var github_opts = {
          'token': 'ff087a2639f785667f246312a64d2709d6965229',
          'body': feedback_body,
          'labels': ['feedback'] 
        }
      //ReactGA.event({category: 'Feedback', action: 'Submitted feedback', label: feedback_string });
      createIssue( 'sfbrunner/GraphSearch', feedback_title, github_opts, this.issue_callback );
      this.setState({modalIsOpen: false});
    }
  
    render() {
      return (
        <div>
            <Button onClick={this.openModal}>Feedback</Button>
            <Modal
                show={this.state.modalIsOpen}
                onHide={this.hideModal}
                aria-labelledby="contained-modal-title"
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title">
                    Please provide us with your feedback.
                    </Modal.Title>
                </Modal.Header>
                <form>
                    <Modal.Body>
                    <h5>Subject<FormControl id='feedback_title' type='text' label='Subject' placeholder="Feedback subject"/></h5>
                    <h5>Your email (optional)<FormControl id='useremail' type='email' label='Email address (optional)' placeholder="your@email.com"/></h5>
                    <h5>Your feedback<FormControl id='feedback_body' rows='5' componentClass="textarea" placeholder="Type your feedback here."/></h5>
                    </Modal.Body>
                    <Modal.Footer>
                    <Button onClick={this.hideModal}>Cancel</Button>  
                    <Button type="submit" bsStyle="primary">Submit</Button>
                    </Modal.Footer>
                    </form>
                
            </Modal>
        </div>
      );
    }
  }
