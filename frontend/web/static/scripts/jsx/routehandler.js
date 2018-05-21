import React, { Component } from 'react';
import { render } from 'react-dom'
import { BrowserRouter, Route, Link, Switch, hashHistory } from 'react-router-dom'
import { BurgerTest } from './burgercomponent'
import { SearchLanding, SearchActive, SearchActive2, SearchActive3, SearchActive4, About, MainNav, FeedbackModal } from './components'
import { Image, Grid, Row, Col, Clearfix } from 'react-bootstrap'
import ReactGA from 'react-ga';
import createHistory from 'history/createBrowserHistory'

ReactGA.initialize('UA-116488460-1', { debug: true })
ReactGA.pageview(window.location.pathname + window.location.search);

const Layout = ({ routehandler}) => (
    <div className="container-fluid wrapper" id="outer-container">
			<div style={{ height:"36px" }}><MainNav/></div>
			<div style={{width:'100%'}}>{routehandler}</div>
	</div>
) 

class RouteHandler extends Component {

	render() {
		return (
			<BrowserRouter history={hashHistory} onUpdate={gaTracking}>
				<Switch>
					<Route exact path='/' component={SearchLanding} />
					<Route path='/about' component={About} />
					<Route path='/searchlanding' component={SearchLanding} />
					<Route path='/searchactive' component={SearchActive} />
					<Route path='/searchactive2' component={SearchActive4} />
				</Switch>
			</BrowserRouter>
		)
	}
}

function gaTracking() {
	ReactGA.pageview(window.location.hash)
}

render(
<Layout routehandler={<RouteHandler />}/>,
  document.getElementById('app')
);
