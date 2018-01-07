import React, { Component } from 'react';
import { render } from 'react-dom'
import numeral from 'numeral'
import request from 'superagent'
import CytoGraph from './cytoComponents'
import FRC, { Checkbox, CheckboxGroup, Input, RadioGroup, Row, Select, File, Textarea } from 'formsy-react-components'
import { keys, map, isArray, sortBy } from 'lodash'
import Network from '@data-ui/network'

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

export class Search extends Component {
	render() {
		return (
          <div className="row" style={divContentLanding.contenttest}>
			<h2>SearchDiv</h2>
		  </div>
		)
	}
}

const Request = ({ onSubmit }) => (
   <FRC.Form onSubmit={onSubmit}>
       <fieldset>
		   <Input name="addon-after" layout="vertical" id="search_string" value="epigenetics idh oncogenic" type="text" help="Let us create a network of your search results." addonAfter={<span type="submit" className="glyphicon glyphicon-search" type="submit"/>} />
	   </fieldset>
	   {<fieldset>
           <Row>
               <input className="btn btn-primary" type="submit" defaultValue="Submit" />
           </Row>
       </fieldset>}
   </FRC.Form>
)

const Pending = ({ id }) => <h2>Pending #{id}</h2>
const About = ""
const rootUrl = new URL(window.location.origin)
rootUrl.port = 8080

export class Main extends Component {
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
                  { map(sortBy(keys(results), [x => -x]), id => <Network
  graph={{ nodes: [ { x: 431.7899967290973, y: 256.31427947596484, id: "2699d671-2905-4a50-a5d9-a352c54ed563"},{ x: 464.5846355646493, y: 262.557282014641, id: "5c973dc0-d34a-4781-9985-ce80f7177bbe" } ], links: [ { source: { x: 464.5846355646493, y: 262.557282014641, id: "5c973dc0-d34a-4781-9985-ce80f7177bbe" }, target: { x: 453.62536770625337, y: 231.1284385093941, id: "3968bda4-bb4d-445c-86d2-f724b07219d3"}, id: "54e3a565-74f3-475b-a0ea-711055e2f66b"},{ source: { x: 431.7899967290973, y: 256.31427947596484, id: "2699d671-2905-4a50-a5d9-a352c54ed563"}, target: { x: 453.62536770625337, y: 231.1284385093941, id: "3968bda4-bb4d-445c-86d2-f724b07219d3" }, id: "be1b090a-b4be-4920-96c5-63beac0a997e"} ] }}
  networkComponent={Network()} />) }
                  
              </div>
          </div>
      )
  }
}

