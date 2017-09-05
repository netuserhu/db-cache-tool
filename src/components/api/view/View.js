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

class APIEdit extends React.Component {

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
		var apiId = this.props.routeParams.id;
		fetch('/web/api/' + apiId).then((resp) => {
            const api = resp.data;
            //store.dispatch({type: 'OUTER_RESTORE', outer: api});
            this.props.onRestore(api);
        });
	}

	componentWillUnmount() {
		this.props.onDestroy();
	}

	handleStepClick(type) {
		console.log(type);
		var index = 0;
		const stepNames = ['outer', 'inner', 'test', 'doc', 'pub'];
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
			    <Step active={ this.state.step == 'test' } icon={<Icon type="setting" />} title='测试' description='测试API功能' onClick={this.handleStepClick.bind(this, 'test')} />
			    <Step active={ this.state.step == 'doc' } icon={<Icon type="book" />} title='文档完善' description='完善用户可查看的文档' onClick={this.handleStepClick.bind(this, 'doc')}  />
			    <Step active={ this.state.step == 'pub' } icon={<Icon type="upload" />} title='发布' description='发布接口' onClick={this.handleStepClick.bind(this, 'pub')} />
			  </Steps>
			  <br/>
			  <br/>

			  {this.state.step == 'outer' && <Outer handleContinue={this.handleStepClick.bind(this, 'inner') } mode={'view'} />}
			  {this.state.step == 'inner' && <Inner handleContinue={this.handleStepClick.bind(this, 'test') } handlePrevious={this.handleStepClick.bind(this, 'outer')} mode={'view'} />}
			  {this.state.step == 'test' && <Test handleContinue={this.handleStepClick.bind(this, 'doc')} handlePrevious={this.handleStepClick.bind(this, 'inner')} mode={'view'} />}
			  {this.state.step == 'doc' && <Doc handleContinue={this.handleStepClick.bind(this, 'pub')} handlePrevious={this.handleStepClick.bind(this, 'test')} mode={'view'} />}
			  {this.state.step == 'pub' && <Pub handlePrevious={this.handleStepClick.bind(this, 'doc')} mode={'view'} />}

			</div>
		);
	}

}

APIEdit.contextTypes = _.extend(APIEdit.contextTypes, {
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

export default connect(mapStateToProps, mapDispatchToProps)(APIEdit);
