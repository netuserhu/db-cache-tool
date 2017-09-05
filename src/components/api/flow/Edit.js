
import React, { Component } from 'react'
import ReactEcharts from 'echarts-for-react';
import { Pagination, Table, Form } from 'antd';
import { Menu, Dropdown, Button, Icon, message, Select, Input, Row, Col, BackTop, Modal, AutoComplete, notification, Radio, InputNumber, Tooltip } from 'antd';
import debounce from 'lodash.debounce';
const Option = Select.Option;
import Constant from '../../../constant/global';

import 'whatwg-fetch';

export default class APIFlowEdit extends React.Component {

	constructor(props) {
		super(props);
		this.state = { api: {}, searchApis: []};
		this.onSearchApiByName = debounce(this.onSearchApiByName, 300);
	}

	componentDidMount() {
		var id = this.props.routeParams.id;
		fetch('/web/api/flow/' + id).then((resp) => {
			var flow = resp.data;
			if (!flow.whiteKdtIds) {
				flow.whiteKdtIds = [];
			}
			if (!flow.blackKdtIds) {
				flow.blackKdtIds = [];
			}
			this.setState({'flow': flow});
		});

	}

	onSetField(col, val) {
		this.state.flow[col] = val;
		this.setState({flow: this.state.flow});
	}

	onSearchApiByName(kw) {
		var flow = this.state.flow;
		flow.targetApiId = '';
		this.setState({flow: flow});
		fetch('/web/api?name=' + kw).then((resp) => {
			var data = resp.data;
			this.setState({'searchApis': data.list});
		});
	}

	onUpdate() {
		if (!this.state.flow.targetApiId) {
			notification.error({
				message: '必须选中一个目标API，才能继续操作'
			});
			return;
		}

		if (this.state.flow.whiteKdtIds) {
			for (var i=0; i<this.state.flow.whiteKdtIds.length; i++) {
				var kdtId = this.state.flow.whiteKdtIds[i];
				var parsed = parseInt(kdtId);
				if (isNaN(parsed) || typeof parsed == 'undefined' || parsed < 0) {
					notification.error({
						message: '白名单中包含错误的店铺ID，请检查'
					});
					return;
				}
			}
		}
		if (this.state.flow.blackKdtIds) {
			for (var i=0; i<this.state.flow.blackKdtIds.length; i++) {
				var kdtId = this.state.flow.blackKdtIds[i];
				var parsed = parseInt(kdtId);
				if (isNaN(parsed) || typeof parsed == 'undefined' || parsed < 0) {
					notification.error({
						message: '黑名单中包含错误的店铺ID，请检查'
					});
					return;
				}
			}
		}
		if (typeof this.state.flow.flowRatio == 'undefined' || 
			this.state.flow.flowRatio < 0 || this.state.flow.flowRatio > 100) {
			notification.error({
				message: '分流比例错误，必须介于[0, 100]之间'
			});
			return;
		}

		var form = {
			apiId: this.state.flow.apiId,
			targetApiId: this.state.flow.targetApiId,
			flowRatio: this.state.flow.flowRatio,
			blackKdtIds: this.state.flow.blackKdtIds,
			whiteKdtIds: this.state.flow.whiteKdtIds
		}

		fetch('/web/api/flow', {
			method: 'POST',
			body: JSON.stringify(form)
		}).then(resp => {
			notification.info({
				message: '更新成功'
			});
		});
	}

	render() {

		return (
			<div>
				{
					this.state.flow && 
					<div>
						<Form>
							<Form.Item labelCol={{md: 7}} wrapperCol={{md: 7}} label="源API" >
								<Input value={this.state.flow.apiName} disabled={true} /> 
							</Form.Item>
							<Form.Item labelCol={{md: 7}} wrapperCol={{md: 8}} label="目标API" >
								<AutoComplete value={this.state.flow.targetApiName} dataSource={this.state.searchApis.map(api => <Option apiId={api.id} key={api.id.toString()} value={api.name + '.' + api.version} text={api.name + '.' + api.version}>{api.name + '.' + api.version}</Option>)} 
									style={{ width: '90%' }} size={'large'} onChange={val => {this.setState({apiName: val}); this.onSearchApiByName(val)}} placeholder="输入API名称进行搜索" onSelect={(val, option)=> { this.onSetField('targetApiId', option.props.apiId) }}
									optionLabelProp="text" /> &nbsp;&nbsp;
								<Tooltip title="点击查看帮助">
			          		        <a href="#" target="blank" style={{color: '#595959'}} ><Icon type="question-circle" /></a>
			          		    </Tooltip>
							</Form.Item>
							<Form.Item labelCol={{md: 7}} wrapperCol={{md: 10}} label="店铺白名单" >
								<Select tags style={{ width: '90%' }} value={this.state.flow.whiteKdtIds} searchPlaceholder="输入店铺ID，回车结束一次输入" placeholder="输入店铺ID，回车结束一次输入" onChange={ val=> { this.onSetField('whiteKdtIds', val); } }
								  >
								    
								</Select> &nbsp;&nbsp;
								<Tooltip title="点击查看帮助">
			          		        <a href="#" target="blank" style={{color: '#595959'}} ><Icon type="info-circle" /></a>
			          		    </Tooltip>
							</Form.Item>
							<Form.Item labelCol={{md: 7}} wrapperCol={{md: 10}} label="店铺黑名单" >
								<Select tags style={{ width: '90%' }} value={this.state.flow.blackKdtIds} searchPlaceholder="输入店铺ID，回车结束一次输入" placeholder="输入店铺ID，回车结束一次输入" onChange={ val=> { this.onSetField('blackKdtIds', val); } }
								  >
								    
								</Select>
								&nbsp;&nbsp;
								<Tooltip title="点击查看帮助">
			          		        <a href="#" target="blank" style={{color: '#595959'}} ><Icon type="info-circle" /></a>
			          		    </Tooltip>
							</Form.Item>
							<Form.Item labelCol={{md: 7}} wrapperCol={{md: 8}} label="分流比例">
								<InputNumber min={0} max={100} value={this.state.flow.flowRatio} onChange={val=>{ this.onSetField('flowRatio', val) }} disabled={this.props.mode == 'view'} /> % / 分钟
							</Form.Item>
						</Form>
						<center>
							<Button type="primary" onClick={e=> {e.preventDefault(); this.onUpdate() }} >更新</Button>
						</center>
					</div>
				}
			</div>
		);
	}
}

APIFlowEdit.contextTypes = {
  router: React.PropTypes.object.isRequired
}

