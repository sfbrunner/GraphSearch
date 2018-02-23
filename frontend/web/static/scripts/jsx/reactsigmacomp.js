import React, { Component } from 'react';
import { keys, map, isArray, sortBy } from 'lodash';
import FRC, { Checkbox, CheckboxGroup, Input, RadioGroup, Row as FormsyRow, Select, File, Textarea } from 'formsy-react-components'
import numeral from 'numeral'
import request from 'superagent'
import { render } from 'react-dom'
import { Image, Grid, Col, Clearfix, Row } from 'react-bootstrap'
import {Sigma, RandomizeNodePositions, RelativeSize, NOverlap, ForceAtlas2, SigmaEnableWebGL} from 'react-sigma';
import ForceLink from 'react-sigma/lib/ForceLink';

var divContentSearch = {
    contenttest: {
        left: '10%',
        right: '10%',
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
        top:'5px'
    }
}

const Request = ({ onSubmit }) => (
   <FRC.Form onSubmit={onSubmit}>
       <fieldset>
		   <Input name="search_string" layout="vertical" id="search_string" value="epigenetics idh oncogenic" type="text" help="Let us create a network of your search results." addonAfter={<span type="submit" className="glyphicon glyphicon-search" defaultValue="Submit"/>} />
	   </fieldset>
   </FRC.Form>
)

const Pending = ({ id }) => <h2>Pending #{id}</h2>
const rootUrl = new URL(window.location.origin)
rootUrl.port = 8080
const apiUrl = new URL("/api/", rootUrl)

export class MainSigma extends Component {
    constructor(props) {
        super(props);
        this.state = { results: {}, pending: {} };
        this.onSubmit = this.onSubmit.bind(this)   
    }

    poll(id) {
        return () => {
            request.get(new URL(id, apiUrl))
            .end( (err, res) => { // call api with id -> will return task_id and if ready result
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
        const payload = { 'search_string': search_string, 'graph_format': 'sigma' }
        request.put(apiUrl).send(payload)
        .end( (err, res) => {
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

          const renderTooltip = function( obj ){
            var { event, index, id, data } = obj;
            console.log(data);
            var url = "https://www.ncbi.nlm.nih.gov/pubmed/" + data.id + "target=_blank"
            return <div width="150px"><b><a href={url}> {data.title}</a></b><br/><i> {data.journal}</i><br/><i> {data.pubDate} </i> <br/>{data.authors}</div>
          };

          const tooltipData = {
              event: "click",
              index: 1,
              id: 2,
              data: 3 
          };
        return (
            <div className="row">
                <div style={{width:"1000px", height:"1000px"}}>
                    <Request onSubmit={this.onSubmit} />
                    { map(sortBy(keys(pending), [x => -x]), id => <Pending key={id} id={id} />) }         
                    { map(sortBy(keys(results), [x => -x]), id => 
                        <Sigma renderer="webgl" graph={results[id]} settings={{drawEdges: true, clone: false, animationsTime: 1000, defaultNodeColor:"#F00", minNodeSize:"5"}}>
                        <RelativeSize initialSize={15}/>
                        <ForceLink strongGravityMode linLogMode gravity={0.001} easing="cubicInOut" avgDistanceThreshold={0.5} randomize='locally' barnesHutOptimize barnesHutTheta={0.6} alignNodeSiblings/>
                      </Sigma>
                        ) }
                </div>
            </div>
        )
    }
}

// Other things tried:
//<RandomizeNodePositions/>
//<ForceLink background easing="cubicInOut" randomize='globally'/>
//<NOverlap gridSize={10} maxIterations={100}/>
//<ForceLink background easing="cubicInOut" randomize='globally' barnesHutOptimize/>