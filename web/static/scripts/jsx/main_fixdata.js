import React, { Component } from 'react'
import { render } from 'react-dom'
import numeral from 'numeral'
import request from 'superagent'
import cytoscape from 'cytoscape'
import cydagre from 'cytoscape-dagre'

cydagre(cytoscape);

import FRC, { Checkbox, CheckboxGroup, Input, RadioGroup, Row, Select, File, Textarea } from 'formsy-react-components'

import { keys, map, isArray, sortBy } from 'lodash'

let cyStyle = {
  height: '400px',
  display: 'block'
};

let conf = {
  boxSelectionEnabled: false,
  autounselectify: true,
  zoomingEnabled: true,
 
  layout: {
      name: 'dagre'
  }
};

class Cytoscape extends Component {
  constructor(props) {
      super(props);
      this.state = { cy: {} }
  }

  componentDidMount() {
      conf.container = this.cyRef;
      conf.elements = {
        "edges": [
            {
                "data": {
                    "id": "0_2",
                    "source": "3114864",
                    "target": "4989131"
                }
            },
            {
                "data": {
                    "id": "0_3",
                    "source": "3114864",
                    "target": "4897148"
                }
            },
            {
                "data": {
                    "id": "1_2",
                    "source": "3507582",
                    "target": "4989131"
                }
            },
            {
                "data": {
                    "id": "1_3",
                    "source": "3507582",
                    "target": "4897148"
                }
            },
            {
                "data": {
                    "id": "2_3",
                    "source": "4989131",
                    "target": "4897148"
                }
            }
        ],
        "nodes": [
            {
                "data": {
                    "authors": "Qu HQ, Li Q, Rentfro AR ...",
                    "group": "Cited",
                    "id": "3114864",
                    "journal": "PLoS ONE",
                    "name": "3114864",
                    "pubDate": "2011 Jun 14",
                    "title": "The Definition of Insulin Resistance Using HOMA-IR for Americans of Mexican Descent Using Machine Learning"
                }
            },
            {
                "data": {
                    "authors": "Qu HQ, Li Q, Lu Y ...",
                    "group": "Cited",
                    "id": "3507582",
                    "journal": "Diabetes Care",
                    "name": "3507582",
                    "pubDate": "2012 Nov 14",
                    "title": "Ancestral Effect on HOMA-IR Levels Quantitated in an American Population of Mexican Origin"
                }
            },
            {
                "data": {
                    "authors": "Bermudez V, Salazar J, Martínez MS ...",
                    "group": "Searched",
                    "id": "4989131",
                    "journal": "Advances in Preventive Medicine",
                    "name": "4989131",
                    "pubDate": "2016 Aug 4",
                    "title": "Prevalence and Associated Factors of Insulin Resistance in Adults from Maracaibo City, Venezuela"
                }
            },
            {
                "data": {
                    "authors": "Bermúdez V, Rojas J, Martínez MS ...",
                    "group": "Searched",
                    "id": "4897148",
                    "journal": "International Scholarly Research Notices",
                    "name": "4897148",
                    "pubDate": "2014 Oct 29",
                    "title": "Epidemiologic Behavior and Estimation of an Optimal Cut-Off Point for Homeostasis Model Assessment-2 Insulin Resistance: A Report from a Venezuelan Population"
                }
            }
        ]
    };
      const cy = cytoscape(conf);

      this.state = { cy };
      //cy.json();
  }

  shouldComponentUpdate() {
      return false;
  }

  componentWillReceiveProps(nextProps) {
      if (this.state.cy) {
          this.state.cy.destroy();
      }
      conf.container = this.cyRef;
      conf.elements = nextProps.data;
      const cy = cytoscape(conf);

      this.state = { cy };
  }

  componentWillUnmount() {
      if (this.state.cy) {
          this.state.cy.destroy();
      }
  }

  render() {
      return <div style={cyStyle} ref={(cyRef) => {
          this.cyRef = cyRef;
      }}/>
  }
}

const Layout = ({ main, navbar, debug, cyto}) => (
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
      <div className="row content">
          <div className="col-xs main">
              { cyto }
          </div>
      </div>
  </div>
)

const Navbar = () => (
  <nav className="navbar navbar-fixed-top bg-inverse navbar-dark">
      <a className="navbar-brand" href="#">Integrator</a>
      <ul className="nav navbar-nav">
          <li className="nav-item">
              <a className="nav-link" href="#">Home</a>
          </li>
      </ul>
  </nav>
)

const Request = ({ onSubmit }) => (
   <FRC.Form onSubmit={onSubmit}>
       <fieldset>
           <legend>Request</legend>
           <Input name="search_string" id="search_string" value="Stratton Cancer Breast" label="Function" type="text" help="Use `xs` for variable name" required />
       </fieldset>
       <fieldset>
           <Row>
               <input className="btn btn-primary" type="submit" defaultValue="Submit" />
           </Row>
       </fieldset>
   </FRC.Form>
)

const Pending = ({ id }) => <h2>Pending #{id}</h2>

class Result extends Component {
    constructor(props) {
        super(props)
        const { id, value } = this.props
        const [approx, script, div] = isArray(value) ? value : [value, undefined, undefined]
        this.state = { approx, script, div }
    }
 
    componentDidMount() {
        const { script } = this.state
        if (!script) return
 
        const parser = new DOMParser()
        const scriptNode = parser.parseFromString(script, "text/html").getElementsByTagName('script')[0]
        eval(scriptNode.text)
    }
 
    render() {
        const { id } = this.props
        const { approx, script, div } = this.state
 
        return (
            <div style={{ marginBottom: '2rem' }}>
                <h2>Result #{id}</h2>
                <h3>Approximate Value: { approx }</h3>
                { div ? <div dangerouslySetInnerHTML={{__html: div}} /> : null }
            </div>
        )
    }
}

const rootUrl = new URL(window.location.origin)
rootUrl.port = 8080

class Main extends Component {
  constructor(props) {
      super(props)

      this.state = { results: {}, pending: {} }

  }

  poll(id) {
      return () => {
          request.get(new URL(id, rootUrl)).end( (err, res) => {
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
      const payload = {
          search_string:    search_string,
      }
      request.put(rootUrl).send(payload).end( (err, res) => {
          if (err) return

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
                  { map(sortBy(keys(results), [x => -x]), id => <Result key={id}  id={id} value={results[id]} />) }
                  <Cytoscape results[id]} />
              </div>
          </div>
      )
  }
}

render(
<Layout main={<Main />} navbar={<Navbar />} cyto={<Cytoscape/>} />,
  document.getElementById('root')
);