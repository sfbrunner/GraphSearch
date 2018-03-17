import React, { Component } from 'react';
import { render } from 'react-dom'
import { BrowserRouter, Route, Link, Switch, hashHistory } from 'react-router-dom'
import { BurgerTest } from './burgercomponent'
import { SearchLanding, SearchActive, About } from './components'
import { Image, Grid, Row, Col, Clearfix } from 'react-bootstrap'

const Layout = ({ burger, routehandler}) => (
    <div className="container-fluid wrapper" id="outer-container">
		{ burger }
		<main id="page-wrap">
			<div class="col-xs-12" style={{ height:"36px" }}></div>
			<Grid>
				<Row className="show-grid">
					<Col md={10} xs={12}></Col>
				</Row>
				<Row className="show-grid">
					<Col style={{height:"3vh"}}></Col>
				</Row>
				<Row>
					{routehandler}
				</Row>
			</Grid>
		</main>
	</div>
) 

class RouteHandler extends Component {
	render() {
		return (
			<BrowserRouter history={hashHistory}>
				<Switch>
					<Route exact path='/' component={SearchLanding} />
					<Route path='/about' component={About} />
					<Route path='/searchlanding' component={SearchLanding} />
				</Switch>
			</BrowserRouter>
		)
	}
}

render(
<Layout burger={<BurgerTest />} routehandler={<RouteHandler />}/>,
  document.getElementById('app')
);
