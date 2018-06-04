import React, { Component } from 'react';
import { render } from 'react-dom'
import { Image, Grid, Col, Clearfix, Row, Navbar, Nav, NavItem, NavDropdown, MenuItem, Button, form, ButtonToolbar, FormGroup, FormControl, InputGroup, Glyphicon, Panel, ControlLabel, Form, Modal } from 'react-bootstrap'
import { CytoGraph, GraphInfo, ContextMenu } from './cytoComponents'
import { DotLoader } from 'react-spinners';
import { keys, map, isArray, sortBy } from 'lodash';
import ReactGA from 'react-ga';
import numeral from 'numeral'
import request from 'superagent'
//import queryString from 'query-string'
//import Modal from 'react-bootstrap-modal'
//var Modal = require('react-bootstrap-modal')
//import createIssue from 'github-create-issue';
var createIssue = require( 'github-create-issue');
var bgImage = require('../../images/main_img-01.svg')
//var feedbackUrl = require('https://microfeedback-github-vbaphuxutm.now.sh/')

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

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Navbar fixedTop={ true } inverse={ false } fluid={ true }>
                <Navbar.Header>
                    <Navbar.Brand>
                    <a href="/">brightfield.io</a>
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
                <Navbar.Form pullRight>
                <FeedbackModal/>                
                </Navbar.Form>
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
            backgroundImage: "url(" + bgImage + ")", backgroundRepeat: "no-repeat", backgroundSize:'cover' }}>
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

export class SearchActive4 extends Component {

    constructor(props) {
        super(props);
        this.state = { 
            graphJson: {}, 
            pending: {}, 
            loading: false, 
            foundResults: false, 
            numApiCalls: 0, 
            //searchHint: 'cell division',
            searchString: null,
            oldSearchString: null,
            refocus: false,
            zoomIn: false,
            zoomOut: false,
            nodes: '',
            nodeFilter: null
         };
        this.handleForm = this.handleForm.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.cytoGraph = React.createRef();
        this.search = this.search.bind(this);
        this.searchHint = 'other hint'
        
        this.contextMenu = React.createRef();
        this.handleRefocus = this.handleRefocus.bind(this);
        this.handleZoomIn = this.handleZoomIn.bind(this);
        this.handleZoomOut = this.handleZoomOut.bind(this);
        this.nodeHandler = this.nodeHandler.bind(this);
        this.nodeHighlighter = this.nodeHighlighter.bind(this);
        this.handleForm = this.handleForm.bind(this);
        this._handleFieldChange = this._handleFieldChange.bind(this);
    }

    componentDidMount() {
        if(this.props.location.state != undefined)
        {
            if (this.state.searchString == null)
            {
            const values = this.props.location.state.searchQuery
            console.log('in constructor')
            console.log(values)
            //this.searchHint = values
            //this.setState({ searchQuery: values })
            this.setState( { searchQuery: values, searchString: values } )
            //this.search(values)
        }
    }
    }

    componentDidUpdate() {
        //console.log('did update')
        if(this.state.searchString != this.state.oldSearchString) {
            console.log('New search query')
            this.setState({oldSearchString: this.state.searchString})
            this.search(this.state.searchString)
        }
    }

    nodeHandler(){
        this.setState({nodes: 'cited'});
    }

    nodeHighlighter(filter){
        this.setState({nodeFilter: filter});
    }

    handleZoomIn(){
        this.setState({zoomIn: true})
    }

    handleZoomOut(){
        this.setState({zoomOut: true})
    }

    handleRefocus(){
        this.setState({refocus: true});
    }

    setCytoGraphRef(ref)
    {
        this.cytoGraph = ref;
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
        //this.setState({ oldSearchString: this.state.searchQuery })
        //this.setState({ loading: true, searchString: searchQuery});
        this.setState({ searchHint: searchQuery })
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

    handleForm(event) {
        event.preventDefault();
        var searchString = event.target.childNodes[0].children.searchString.value;
        console.log(searchString)
        this.setState({refocus: true});
        this.setState({oldSearchString: this.state.searchString, searchHint: this.state.searchString, searchString: searchString})
        //this.setState({searchString: searchString})
        //this.props.history.push({pathname: '/searchactive2', state: {searchQuery: searchString}})
    }

    onSubmit(event) {
        event.preventDefault();
        this.search(event.target.childNodes[0].children.searchString.value);
    }
    
    //re-render when input changes
    _handleFieldChange(event) {
        this.setState({searchHint: event.target.value});
    }

    handleForm(event) {
        event.preventDefault();
        var searchString = event.target.childNodes[0].children.searchString.value;
        console.log(searchString)
        this.props.history.push({pathname: '/searchactive2', state: {searchQuery: searchString}})
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
        
        const noRestultsString = "Sorry, your search yielded no results. Please try again.";
        const { graphJson, pending, loading } = this.state;
		return (
            <div>
                <div style={graphMenuStyle}>
                    <Row style={{height:'2vh'}}></Row>
                    <Row>
                        <Col md={1}>
                        </Col>
                        <Col md={10}>
                            <div style={{left:'10px'}}>
                            <form onSubmit={this.handleForm}>
                                <InputGroup>
                                    <FormControl type="text" id="searchString" onChange={this._handleFieldChange} value = { this.state.searchHint }/>
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
                            ? (this.state.foundResults ? <GraphInfo data={graphJson[id].stats} cytoGraph={this.cytoGraph.current} nodeHandler={this.nodeHandler} nodeHighlighter={this.nodeHighlighter}/> : <h2>{noRestultsString}</h2>)
                            : {})
                        }
                        </Col>
                        <Col md={1}></Col>
                    </Row>
                </div>
                <div style={{left: '60%', top:'40%', position: 'absolute', bottom: 0, height: '50px'}}>
                    <DotLoader color={'#000000'} loading={loading}/>
                </div>
                <div style={{width:'100%', float:'left', height:'100%'}}>
                    <div id='cy' style={{width:'100%', float:'left', height:'100%', position: 'absolute', zIndex: '999'}}>
                        {map(keys(graphJson), id => !this.state.loading
                                ? (this.state.foundResults ? <CytoGraph ref={this.cytoGraph} data={graphJson[id]} contextMenu={this.contextMenu.current} refocus={this.state.refocus} zoomIn={this.state.zoomIn} zoomOut={this.state.zoomOut} nodes={this.state.nodes} nodeFilter={this.state.nodeFilter} /> : <div/>)
                                : {})}
                    </div>
                    <ContextMenu ref={this.contextMenu} />
                    <GraphHelperMenu handleRefocus={this.handleRefocus} handleZoomIn={this.handleZoomIn} handleZoomOut={this.handleZoomOut}/>
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
          'token': 'dd27030f6d6f26803f6aab50820f2838bfd87eb9',
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