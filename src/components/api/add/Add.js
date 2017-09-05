import React, { Component } from 'react';
import {Steps, Icon} from 'antd';

import Outer from '../edit/Outer';
import Inner from '../edit/Inner';
import Test from '../edit/Test';
import Doc from '../edit/Doc';
import Pub from '../edit/Pub';
import {connect} from 'react-redux';

const Step = Steps.Step;

class APIAdd extends React.Component {

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
		console.log('add loaded')
		this.handleStepClick = this.handleStepClick.bind(this);
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
			  	<Step active={ this.state.step == 'outer' } icon={<Icon type="edit" />} title='API对外配置' description='对API基础信息进行配置' />
			    <Step active={ this.state.step == 'inner' } icon={<Icon type="edit" />} title='API对内配置' description='对API基础信息进行配置' />
			    <Step active={ this.state.step == 'test' } icon={<Icon type="setting" />} title='测试' description='测试API功能' />
			    <Step active={ this.state.step == 'doc' } icon={<Icon type="book" />} title='文档完善' description='完善用户可查看的文档' />
			    <Step active={ this.state.step == 'pub' } icon={<Icon type="upload" />} title='发布' description='发布接口' />
			  </Steps>
			  <br/>
			  <br/>

			  {this.state.step == 'outer' && <Outer handleContinue={this.handleStepClick.bind(this, 'inner') } mode={'add'} />}
			  {this.state.step == 'inner' && <Inner handleContinue={this.handleStepClick.bind(this, 'test') } mode={'add'} handlePrevious={this.handleStepClick.bind(this, 'outer')} />}
			  {this.state.step == 'test' && <Test handleContinue={this.handleStepClick.bind(this, 'doc')} mode={'add'} handlePrevious={this.handleStepClick.bind(this, 'inner')} />}
			  {this.state.step == 'doc' && <Doc handleContinue={this.handleStepClick.bind(this, 'pub')} mode={'add'} handlePrevious={this.handleStepClick.bind(this, 'test')} />}
			  {this.state.step == 'pub' && <Pub handlePrevious={this.handleStepClick.bind(this, 'doc')} mode={'add'} />}

			</div>
		);
	}

}

APIAdd.contextTypes = _.extend(APIAdd.contextTypes, {
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
		onDestroy: () => {
			dispatch({type: 'OUTER_RESET_STORE'});
			dispatch({type: 'INNER_RESET_STORE'});
			dispatch({type: 'TEST_RESET_STORE'});
			dispatch({type: 'DOC_RESET_STORE'});
		}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(APIAdd);

