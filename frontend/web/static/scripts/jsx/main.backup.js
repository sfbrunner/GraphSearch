import React, { Component } from 'react'
import { render } from 'react-dom'
import numeral from 'numeral'
import request from 'superagent'
import Cytoscape from './components'
import FRC, { Checkbox, CheckboxGroup, Input, RadioGroup, Row, Select, File, Textarea } from 'formsy-react-components'
import { keys, map, isArray, sortBy } from 'lodash'
import BurgerMenu from 'react-burger-menu'
{/* import 'static/scripts/jsx/styles3.css' */}

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
  marginfree: {
    marginLeft: '0px'
  },
  contentdiv: {
	position:'relative',
	top:'40%'
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
    position: 'relative',
	left: '20%',
	right: '20%',
	top: '36px',
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

var styles = {
  bmBurgerButton: {
    position: 'fixed',
	width: '36px',
	height: '30px',
    left: '36px',
    top: '36px'
  },
  bmBurgerBars: {
    background: '#373a47'
  },
  bmCrossButton: {
    height: '24px',
    width: '24px'
  },
  bmCross: {
    background: '#bdc3c7'
  },
  bmMenu: {
    background: '#ffffff',
    padding: '2.5em 1.5em 0',
    fontSize: '1.15em',
	color: '#000000',
	'a': {
		color: '#000000'
	}
  },
  bmMorphShape: {
    fill: '#373a47'
  },
  bmItemList: {
    color: '#000000',
    padding: '0.8em',
	fontWeight: '700',
	span: {
		color: '#000000'
	},
	a: {
	    color: '#000000'
	}
  },
  bmOverlay: {
    background: 'rgba(0, 0, 0, 0.3)'
  },
  bmMenuWrap: {
	bottom: '0px',
	left: '0px',
	width: '20%'
  },
  a: {
	color: '#000000'
  }
} 

const Layout = ({ burger, main, navbar, debug}) => (
    <div className="container-fluid" id="outer-container">
		{burger}
		<main id="page-wrap">
          <div className="row" style={divContentLanding.contenttest}>
              	<div className="row align-items-end" style={{height:'40%'}}>
				  <div style={divContentLanding.contentdiv}>
				  <div className="col col-lg-6" style={{height:'70%'}}>
            		<h2 style={divContentLanding.h2}>GraphSearch</h2>
					<p></p>
					<p style={divContentLanding.p}>Welcome to the GraphSearch platform. Our mission is to make your biomedical literature search experience the best it can be. We take your search query and return a network of publications to you. The network contains the direct results of your search (in blue) as well as the publications they cite (in red). The structure of the network helps you to find highly cited publications and quickly identify publications that belong together.</p>
				  </div>
				  </div>
              	</div>
		  		<div className="row">
				  <div className="col col-lg-6">
			  		{ main }
			      </div>
	      		</div>
		  </div>
		</main>
	</div>
)
	{/*	<div className="row">
			<div className="col col-lg-1">
				{ burger }
			</div>
			<div className="col col-lg-8">
            	<h2>GraphSearch</h2>
				<div className="row content">
            		<div className="col-xs main">
						{ main }
					</div>
					{ debug }
        			<div className="row content">
            			<div className="col-xs about">
                		{ About }
            			</div>
					</div>
				</div>
        	</div>
        </div>
    </div>*/}
  
const Navbar = () => (
    <nav className="navbar navbar-fixed-top bg-inverse navbar-dark">
        <a className="navbar-brand" href="">GraphSearch</a>
        <ul className="nav navbar-nav">
            <li className="nav-item">
                <a className="nav-link" href="#">About</a>
            </li>
            <li className="nav-item">
                <a className="nav-link" href="#">Help</a>
            </li>
            <li className="nav-item">
                <a className="nav-link" href="#">Report a bug</a>
            </li>
        </ul>
    </nav>
)

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
const About = ""
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

class MenuWrap extends Component {
  constructor (props) {
    super(props);
    this.state = {
      hidden: false
    };
  }

  componentWillReceiveProps(nextProps) {
    const sideChanged = this.props.children.props.right !== nextProps.children.props.right;

    if (sideChanged) {
      this.setState({hidden : true});

      setTimeout(() => {
        this.show();
      }, this.props.wait);
    }
  }

  show() {
    this.setState({hidden : false});
  }

  render() {
    let style;

    if (this.state.hidden) {
      style = {display: 'none'};
    }

    return (
      <div style={style} className={this.props.side}>
        {this.props.children}
      </div>
    );
  }
}


class BurgerTest extends React.Component {
    constructor(props) {
        super(props);

		this.state = {
			hidden: false,
			currentMenu: 'push',
			side: 'left'
		};
    }
	
	showSettings (event) {
		event.preventDefault();
	}

getItems() {
    let items;

        items = [
          <a key="0" href="" style={styles.a}><i className="fa fa-fw fa-star-o" /><span>Favorites</span></a>,
          <a key="1" href="" style={styles.a}><i className="fa fa-fw fa-bell-o" /><span>Alerts</span></a>,
          <a key="2" href="" style={styles.a}><i className="fa fa-fw fa-envelope-o" /><span>Messages</span></a>,
          <a key="3" href="" style={styles.a}><i className="fa fa-fw fa-comment-o" /><span>Comments</span></a>,
          <a key="4" href="" style={styles.a}><i className="fa fa-fw fa-bar-chart-o" /><span>Analytics</span></a>,
          <a key="5" href="" style={styles.a}><i className="fa fa-fw fa-newspaper-o" /><span>Reading List</span></a>
        ];

    	return items;
  	}

	getMenu() {
    	//const Menu = BurgerMenu[this.state.currentMenu];
    	//const items = this.getItems();
	//	const items = post => (
	//		<Menu>
	//			<a id="home" className="menu-item" href="/">Home</a>
	//			<a id="about" className="menu-item" href="/about">About</a>
	//			<a id="contact" className="menu-item" href="/contact">Contact</a>
	//			<a onClick={ this.showSettings } className="menu-item--small" href="">Settings</a>
	//		</Menu>);
	const Menu = BurgerMenu[this.state.currentMenu]
    const items = this.getItems();
	let jsx;

    if (this.state.side === 'right') {
      jsx = (
        <MenuWrap wait={20} side={this.state.side}>
          <Menu styles={ styles } id={this.state.currentMenu} pageWrapId={'page-wrap'} outerContainerId={'outer-container'} right>
            {items}
          </Menu>
        </MenuWrap>
      );
    } else {
      jsx = (
        <MenuWrap wait={20}>
          <Menu styles = { styles } id={this.state.currentMenu} pageWrapId={'page-wrap'} outerContainerId={'outer-container'}>
            {items}
          </Menu>
        </MenuWrap>
      );
    }

    return jsx;
  }

	render() {
		//const buttons = Object.keys(this.props.menus).map((menu) => {
		//	return (
		//			<a key={menu}
		//			className={classNames({'current-demo': menu === this.state.currentMenu})}
		//			onClick={this.changeMenu.bind(this, menu)}>
		//			{this.props.menus[menu].buttonText}
		//		</a>
      	//	);
    
		//});
		return (
			<div id="outer-container" style={{height: '100%'}}>
				{this.getMenu()}
			</div>
		);
	}
}

render(
<Layout burger={<BurgerTest />} main={<Main id="page-wrap" />} navbar={<Navbar />} />,
  document.getElementById('app')
);
