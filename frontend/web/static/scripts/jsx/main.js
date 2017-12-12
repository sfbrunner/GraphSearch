import React, { Component } from 'react'
import { render } from 'react-dom'
import numeral from 'numeral'
import request from 'superagent'
import CytoGraph from './components'


import FRC, { Checkbox, CheckboxGroup, Input, RadioGroup, Row, Select, File, Textarea } from 'formsy-react-components'
import { keys, map, isArray, sortBy } from 'lodash'

const Layout = ({ main, navbar, debug}) => (
    <div className="container-fluid">
        <div className="row">
            <div className="col-xs navbar">
                { navbar }
            </div>
        </div>
        <div className="row content">
            <div className="col-xs main">
                { main }
            </div>
            { debug }
        </div>
    </div>
)
  
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
           <legend>Fulltext search request</legend>
           <Input name="search_string" id="search_string" value="Stratton Cancer Breast" label="Search input:" type="text" help="Enter keywords separated by space" required />
       </fieldset>
       <fieldset>
           <Row>
               <input className="btn btn-primary" type="submit" defaultValue="Submit" />
           </Row>
       </fieldset>
   </FRC.Form>
)

const Pending = ({ id }) => <h2>Pending #{id}</h2>
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
                <div className="col-xs-6 offset-xs-3">
                    <Request onSubmit={this.onSubmit} />
                    { map(sortBy(keys(pending), [x => -x]), id => <Pending key={id} id={id} />) }
                    { map(sortBy(keys(results), [x => -x]), id => <CytoGraph graph={results[id]}/>) }
                </div>     
            </div>
        )
    }
}

render(
<Layout main={<Main />} navbar={<Navbar />} />,
  document.getElementById('root')
);