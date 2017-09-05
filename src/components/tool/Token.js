
import React, { Component } from 'react'
import ReactEcharts from 'echarts-for-react';
import { Pagination, Table, Form } from 'antd';
import { Menu, Dropdown, Button, Icon, message, Select, Input, Row, Col, BackTop, Modal, AutoComplete, notification, Radio, Popconfirm } from 'antd';
const Option = Select.Option;

import 'whatwg-fetch';

export default class AppEdit extends React.Component {

	constructor(props) {
		super(props);
		this.state = { groups: []};
	}

	componentDidMount() {
		fetch('/web/group?pageSize=1000').then((resp) => {
			this.setState({'groups': resp.data.list});
		});
	}

	onGetToken() {
		if (!this.state.accessToken) {
			notification.error({
				message: '请输入accessToken'
			});
			return;
		}
		fetch('/web/token/' + this.state.accessToken).then((resp) => {
			this.setState({token: resp.data});
		});
	}

	onSetField(col, val) {
		this.state.token[col] = val;
		this.setState({token: this.state.token});
	}

	render() {

		return (
			<div>
				<Row>
					<Col md={8}>
						<Input placeholder="输入token精确查找" size={'large'} addonBefore={<span>token</span>} onChange={e=> this.setState({accessToken: e.target.value})} />
					</Col>
					&nbsp;&nbsp;
					<Col md={3}>
						<Button type="primary" size={'large'} onClick={e=> {e.preventDefault(); this.onGetToken() }} style={{marginLeft: '10px'}}><Icon type='search' />查找</Button>
					</Col>
				</Row>
				<br/>
				<br/>
				{
					this.state.token && 
					<div>
						<Form>
							<Form.Item labelCol={{md: 7}} wrapperCol={{md: 7}} label="Access Token" >
								<Input value={this.state.token.accessToken} disabled={true}  />
							</Form.Item>
							<Form.Item labelCol={{md: 7}} wrapperCol={{md: 8}} label="Client ID" >
								<Input value={this.state.token.clientId} disabled={true} />
							</Form.Item>
							<Form.Item labelCol={{md: 7}} wrapperCol={{md: 8}} label="用户登录ID(Admin ID)">
								<Input value={this.state.token.adminId} onChange={e=>{ this.onSetField('adminId', e.target.value) }} disabled={true} />
							</Form.Item>
							<Form.Item labelCol={{md: 7}} wrapperCol={{md: 8}} label="店铺ID(KdtId)">
								<Input value={this.state.token.kdtId} onChange={e=>{this.onSetField('kdtId', e.target.value)}} disabled={true} />
							</Form.Item>
							<Form.Item labelCol={{md: 7}} wrapperCol={{md: 8}} label="组合用户ID">
								<Input value={this.state.token.userId} onChange={e=>{this.onSetField('userId', e.target.value)}} disabled={true} />
							</Form.Item>
							<Form.Item labelCol={{md: 7}} wrapperCol={{md: 8}} label="过期时间">
								<Input value={this.state.token.expires} onChange={e=>{this.onSetField('expires', e.target.value)}} disabled={true} />
							</Form.Item>
							<Form.Item labelCol={{md: 7}} wrapperCol={{md: 10}} label="权限(Scope)" >
								<Select disabled={true} multiple style={{ width: '100%' }} placeholder="选择权限组" value={ this.state.token.scope ? _.split(this.state.token.scope, ' ') : [] } onChange={val=> { this.onSetField('scope', _.join(val, ' ')) }} 
								filterOption={(input, option) => { return option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0 || option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}} >
							    	{
							    		this.state.groups.map(group => {
							    			return (
							    				<Option key={group.alias} value={group.alias}>{group.name}</Option>
							    			)
							    		})
							    	}
							    </Select>
							</Form.Item>
						</Form>
					</div>
				}
			</div>
		);
	}
}

