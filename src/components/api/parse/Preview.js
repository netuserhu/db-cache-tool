import React, { Component } from 'react';
import {Steps, Icon} from 'antd';
import Outer from '../edit/Outer';
import Inner from '../edit/Inner';
import Test from '../edit/Test';
import Doc from '../edit/Doc';
import Pub from '../edit/Pub';
import {connect} from 'react-redux';
var _ = require('lodash');
const Step = Steps.Step;

class APIParsePreview extends React.Component {

	constructor(props) {
		super(props);
		this.state = { 
			step: 'outer', 
			stepChain: [false, true, true, true, true],
			stepIndex: 0,
			outerParams: [], 
			innerParams: [], 
			innerCommonParams: [] 
		};
		this.handleStepClick = this.handleStepClick.bind(this);

	}

	componentDidMount() {
		const store = this.context.store;
		var apiId = this.props.apiId;
		const interfaceName = this.props.interfaceName;
		const methodName = this.props.methodName;
		fetch('/web/apidoc/' + interfaceName + '/' + methodName + '/preview').then((resp) => {
            const api = resp.data;
            api.carmenApi.id = '';
            this.props.onRestore(api);
        });
	}

	componentWillUnmount() {
		this.props.onDestroy();
	}

	handleStepClick(type) {
		console.log(type);
		var index = 0;
		const stepNames = ['outer', 'inner'];
		for (var i=0; i<stepNames.length; i++) {
			if (stepNames[i] == type) {
				index = i;
				break;
			}
		}
		this.setState({step: type, stepIndex: index});
	}

	handleStateChange(val) {
		this.setState(val);
	}

	render() {
		return (
			<div>
			  <Steps current={this.state.stepIndex}>
			  	<Step active={ this.state.step == 'outer' } icon={<Icon type="edit" />} title='API对外配置' description='对API基础信息进行配置' onClick={this.handleStepClick.bind(this, 'outer')} />
			    <Step active={ this.state.step == 'inner' } icon={<Icon type="edit" />} title='API对内配置' description='对API基础信息进行配置' onClick={this.handleStepClick.bind(this, 'inner')} />
			  </Steps>
			  <br/>
			  <br/>

			  {this.state.step == 'outer' && <Outer handleContinue={this.handleStepClick.bind(this, 'inner') } mode={'view'} />}
			  {this.state.step == 'inner' && <Inner handlePrevious={this.handleStepClick.bind(this, 'outer')} mode={'view'} />}

			</div>
		);
	}

}

APIParsePreview.contextTypes = _.extend(APIParsePreview.contextTypes, {
 store: React.PropTypes.object.isRequired
});


const mapStateToProps = (state) => {
	return {
		params: state.outer.params,
		outer: state.outer
	}
}

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		onRestore: (api, outer) => {
			dispatch({type: 'OUTER_RESTORE', api: api});
			dispatch({type: 'INNER_RESTORE', api: api});
		},
		onRestoreDoc: (doc) => {
			dispatch({type: 'DOC_RESTORE', doc: doc});
		},
		onDestroy: () => {
			dispatch({type: 'OUTER_RESET_STORE'});
			dispatch({type: 'INNER_RESET_STORE'});
			dispatch({type: 'TEST_RESET_STORE'});
			dispatch({type: 'DOC_RESET_STORE'});
		}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(APIParsePreview);
