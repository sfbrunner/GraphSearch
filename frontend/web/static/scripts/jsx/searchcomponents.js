import React, { Component } from 'react';
import { render } from 'react-dom'
import numeral from 'numeral'
import request from 'superagent'
import CytoGraph from './cytoComponents'
import FRC, { Checkbox, CheckboxGroup, Input, RadioGroup, Row, Select, File, Textarea } from 'formsy-react-components'
import { keys, map, isArray, sortBy } from 'lodash'

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
                  { map(sortBy(keys(results), [x => -x]), id => <Cytoscape data={results[id]} />) }
                  
              </div>
          </div>
      )
  }
}

