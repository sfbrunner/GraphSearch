import React, { Component } from 'react';
import { render } from 'react-dom'
import { 
    Image, Grid, Col, Row, Navbar, Nav, NavItem, MenuItem, 
    Button, ButtonToolbar, FormControl, Popover, Badge,
    InputGroup, Glyphicon, Panel, Modal, Well, DropdownButton } from 'react-bootstrap'
import { CytoGraph } from './cytoComponents'
import { DotLoader } from 'react-spinners';
import { keys, map, isArray, sortBy } from 'lodash';
import ReactGA from 'react-ga';
import numeral from 'numeral'
import request from 'superagent'
import { Histogram, DensitySeries, BarSeries, withParentSize, XAxis, YAxis, WithTooltip } from '@data-ui/histogram';
import { format } from "d3-format";
import renderTooltip from './renderHistogramTooltip'; 
import { TagCloud } from "react-tagcloud";
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
        return <h1>Sorry, something went wrong. We are trying to fix it asap.</h1>;
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
                                    <FormControl type="text" id="searchString" style={{width:'400px'}} placeholder="Try more keywords and hit <Enter>"/>
                                    <InputGroup.Addon>
                                        <Glyphicon glyph="search" />
                                    </InputGroup.Addon>
                                </InputGroup>
                            </form>
                        </Navbar.Form>
                        </Nav>
                        <Nav>
                            <ButtonToolbar>
                                <DropdownButton title="History" id="dropdown-size-medium">
                                    <MenuItem eventKey="1" onClick={ event => this.props.historyHandler(3)}>Action</MenuItem>
                                </DropdownButton>
                            </ButtonToolbar>
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
        this.props.history.push({pathname: '/search', state: {searchQuery: searchString}})
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
            left: location ? (location.x-tooltipWidth / 2) : 0,
            top: location ? (location.y) : 0,
            pointerEvents: 'all',
            width: tooltipWidth,
            height: tooltipHeight,
            borderRadius: '7px',
            padding: '0px',
            zIndex: '10001',
        };
        var popoverStyle = 
        {
            positionTop: location ? (location.x - tooltipWidth / 2) : 0,
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

const ResponsiveHistogram = withParentSize(({ parentWidth, parentHeight, ...rest}) => (
    <Histogram width={parentWidth} height={parentHeight} renderTooltip={renderTooltip} {...rest} />
));

class GraphTagCloud extends React.Component{

    constructor(props){
        super(props);
        this.state = { tags: props.tags, clickedTag: null }
        this.nodeHighlighter = this.nodeHighlighter.bind(this);
    }

    nodeHighlighter(filter){
        this.props.nodeHighlighter(filter);
    }

    render(){
        const options = {
            luminosity: 'dark',
            hue: 'monochrome'
          };

        const customRenderer = (tag, size, color) => (
            <span key={tag.value}
                    style={{
                    fontSize: `${size}px`,
                    border: `0.0px solid ${color}`,
                    margin: '1px',
                    backgroundColor: tag.value==this.state.clickedTag? 'black' : 'grey',
                    padding: '3px',
                    color: 'white',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    whiteSpace: 'pre-wrap',
                    display: 'inline-block',
                    }}>{tag.value}
            </span>
        );

        return(
        <div>
            <TagCloud 
                minSize={12}
                maxSize={24}
                colorOptions={options}
                tags={this.state.tags}
                shuffle={false}
                renderer={customRenderer}
                onClick={tag => {
                    if (tag.value==this.state.clickedTag) {
                        this.nodeHighlighter('');
                        this.setState({clickedTag: null})
                    } else {
                        this.nodeHighlighter(tag.value); 
                        this.setState({clickedTag: tag.value})
                    }
                }}
                className="simple-cloud" />
        </div>
        )
    }
}

class GraphInfo extends React.Component {

    constructor(props) {
        super(props);
        this.state = { stats: props.data };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.data !== this.state) {
            this.setState({ stats: nextProps.data });
        }
    }

    render() {

        function tagCreator(entry){
            var tagEntry = {};
            tagEntry['value'] = `${entry[0]}`;
            tagEntry['count'] = entry[1];
            return tagEntry;
        };

        return (
            <div id="netstats" name="netstats">
                <Panel id="top-author-panel" defaultExpanded>
                    <Panel.Heading>
                        <Panel.Title toggle>Top Authors</Panel.Title>
                    </Panel.Heading>
                    <Panel.Body collapsible expanded="true">
                        <GraphTagCloud tags={Object.entries(this.state.stats.top_author_dict).map(tagCreator)} nodeHighlighter={this.props.authorHighlighter} />
                    </Panel.Body>
                </Panel>
                <Panel id="top-journal-panel" defaultExpanded>
                    <Panel.Heading>
                        <Panel.Title toggle>Top Journals</Panel.Title>
                    </Panel.Heading>
                    <Panel.Body collapsible expanded="true">
                    <GraphTagCloud tags={Object.entries(this.state.stats.top_journal_dict).map(tagCreator)} nodeHighlighter={this.props.nodeHighlighter} />
                    </Panel.Body>
                </Panel>
                <Panel id="publications-per-year-panel" defaultExpanded>
                    <Panel.Heading>
                        <Panel.Title toggle>Publications per year</Panel.Title>
                    </Panel.Heading>
                    <Panel.Body collapsible expanded="true">
                        <div style={{height:'140px'}}>
                        <ResponsiveHistogram ariaLabel='' orientation="vertical" binCount={this.state.stats.pub_years.num_bin} margin={{ top: 10, right: 12, bottom: 60, left: 12}}>
                        <BarSeries animated rawData={this.state.stats.pub_years.values} fill='grey' strokeWidth={0}/>
                        <XAxis numTicks={3} tickFormat={format('.4')}/>
                        </ResponsiveHistogram>
                        </div>
                    </Panel.Body>
                </Panel>
            </div>
        )
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
            marginTop: '5px',
            verticalAlign: 'middle',
            display: 'block',
            position: 'absolute', 
            top: '5%',
            left: '30%',
            borderRadius: '7px',
            padding: '7px',
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
            <Well bsSize="small" style={graphSummaryStyle}>
                <strong>Direct hits </strong>
                <Badge style={{backgroundColor:'#004cc6'}}>{ this.state.stats.num_results }</Badge>
                <strong>  Cited publications </strong>
                <Badge style={{backgroundColor:'red'}}>{ this.state.stats.num_citations }</Badge>
                <strong>  Citation links </strong>
                <Badge style={{backgroundColor:'lightgrey'}}>{ this.state.stats.num_links }</Badge>
                <strong>  Citation strength </strong>
                <Badge style={{backgroundColor:'lightgrey'}}>0</Badge>{'\u00A0'}{ gradient_svg }{'\u00A0'}
                <Badge style={{backgroundColor:'red'}}>{this.state.stats.max_degree_cited}</Badge>
            </Well>         
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
        // TODO: In a very unlikely case this producesa bug.
        this.updateVisualGraphState({"zoomLevel": Math.round(Math.random() * 1000) / 1000});
    }

    handleZoomOut(){
        this.updateVisualGraphState({"zoomLevel": -Math.round(Math.random() * 1000) / 1000 });
    }

    handleRefocus(){
        this.updateVisualGraphState({"zoomLevel": 0.0});
    }

	render() {
        
        const noResultsString = "Sorry, your search yielded no results. Please try again.";

		return (
            <Grid>
                <Row>
                    <SearchNav formHandler={this.onSubmit} historyHandler={this.poll}/>
                </Row>
                <Row>
                    <ErrorBoundary>
                    <Panel style={{padding: '0.5%', background:'#d3d3d34d', borderColor: 'lightgrey', display: this.state.loading? 'none': 'block', pointerEvents: 'all', zIndex: '10001', position: 'absolute', left: '1%', top: '8%', width: '20%'}}>
                        {map(keys(this.state.graphJson), id => this.state.foundResults 
                            ? <GraphInfo data={this.state.graphJson[id].stats} nodeHandler={this.nodeHandler} nodeHighlighter={this.nodeHighlighter} authorHighlighter={this.authorHighlighter}/> 
                            : <h2>{noResultsString}</h2>)}
                    </Panel>
                    <div style={{width: '100%', float: 'left', height: '100%', display: this.state.loading? 'none': 'block'}}>
                        <div id='cy' style={{width: '100%', float: 'left', left: '0%', height: '100%', position: 'absolute', zIndex: '999'}}>
                            {map(keys(this.state.graphJson), id => <CytoGraph graph={this.state.graphJson[id].graph} contextMenuHandler={this.contextMenuHandler} visualGraphState={this.state.visualGraphState} />)};
                        </div>
                        <ContextMenu contextMenuState={this.state.contextMenuState} />
                        <GraphHelperMenu handleRefocus={this.handleRefocus} handleZoomIn={this.handleZoomIn} handleZoomOut={this.handleZoomOut}/>
                        {map(keys(this.state.graphJson), id => this.state.foundResults 
                            ? <GraphSummaryDisplay data={this.state.graphJson[id].stats}/> 
                            : null)}
                    </div>
                    <div style={{left: '45%', top: '40%', position: 'absolute', bottom: 0, height: '0px'}}>
                        <DotLoader loading={this.state.loading}/>
                    </div>
                    </ErrorBoundary>
                </Row>
            </Grid>
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
      )
    }
  }
