import React, { Component } from 'react';
import BurgerMenu from 'react-burger-menu'

var styles = 
{ 
  bmBurgerButton: { position: 'fixed', width: '36px', height: '30px', left: '36px', top: '36px' },
  bmBurgerBars: { background: '#373a47' },
  bmCrossButton: { height: '24px', width: '24px' },
  bmCross: { background: '#bdc3c7' },
  bmMenu: { background: '#ffffff', padding: '2.5em 1.5em 0', fontSize: '1.15em', color: '#000000','a': { color: '#000000'} },
  bmMorphShape: { fill: '#373a47'},
  bmItemList: { color: '#000000', padding: '0.8em', fontWeight: '700', span: { color: '#000000'}, a: {color: '#000000'} },
  bmOverlay: { background: 'rgba(0, 0, 0, 0.3)'},
  bmMenuWrap: {bottom: '0px', left: '0px', width: '20%'}, a: {color: '#000000'}
} 

class MenuWrap extends Component {
  constructor (props) {
    super(props);
    this.state = { hidden: false };
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


export class BurgerTest extends React.Component {
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
          <a key="0" href="searchlanding" style={styles.a}><i className="fa fa-fw fa-star-o" /><span>Home</span></a>,
          <a key="1" href="about" style={styles.a}><i className="fa fa-fw fa-star-o" /><span>About</span></a>,
          <a key="2" href="searchlanding" style={styles.a}><i className="fa fa-fw fa-star-o" /><span>Login (soon)</span></a>
        ];

    	return items;
  	}

	getMenu() {
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
		return (
			<div id="outer-container" style={{height: '100%'}}>
				{this.getMenu()}
			</div>
		);
	}
}
