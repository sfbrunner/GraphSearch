import React, { Component } from 'react';
import { render } from 'react-dom'
import { BrowserRouter, Route, Link, Switch, hashHistory } from 'react-router-dom'
import numeral from 'numeral'
import request from 'superagent'
import CytoGraph from './cytoComponents'
{/**import FRC, { Checkbox, CheckboxGroup, Input, RadioGroup, Select, File, Textarea } from 'formsy-react-components' **/}
import { keys, map, isArray, sortBy } from 'lodash'
import { BurgerTest } from './burgercomponent'
import { SearchLanding, About } from './components'
import { Image, Grid, Row, Col, Clearfix } from 'react-bootstrap'

var divContentMain = {
	maindiv: {
    	position: 'relative',
		left: '10%',
		right: '10%',
		top: '36px',
		height:'100%'
	}
}

const Layout = ({ burger, routehandler}) => (
    <div className="container-fluid wrapper" id="outer-container">
		{burger}
		<main id="page-wrap">
			<div class="col-xs-12" style={{height:"36px"}}></div>
			<Grid>
				<Row className="show-grid">
					<Col md={10} xs={12}>
					</Col>
				</Row>
				<Row className="show-grid">
					<Col md={10} xs={12}>
						{routehandler}
					</Col>
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

const Home = () => <h1>Hello from Home!</h1>
const Address = () => <h1>We are located at 555 Jackson St.</h1>

render(
<Layout burger={<BurgerTest />} routehandler={<RouteHandler />}/>,
  document.getElementById('app')
);
