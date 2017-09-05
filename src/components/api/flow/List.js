
import React, { Component } from 'react'
import ReactEcharts from 'echarts-for-react';
import { Pagination, Table } from 'antd';
import { Menu, Dropdown, Button, Icon, message, Select, Input, Row, Col, BackTop, Modal, AutoComplete, notification, Popconfirm } from 'antd';
const Option = Select.Option;
import Constant from '../../../constant/global';

import 'whatwg-fetch';

export default class APIFlowList extends React.Component {

	constructor(props) {
		super(props);
		this.state = {flows: [] };
	}

	componentDidMount() {
		var apiId = this.props.location.query.apiId;
		if (!apiId) {
			notification.error({
				message: '参数错误，即将跳转回主页'
			});
			this.context.router.push('/api/list');
			return;
		}
		this.setState({apiId: apiId});
		fetch('/web/user/self').then(resp => {
			this.setState({currentUser: resp.data});
			this.onRefresh();
		});
	}

	onRefresh() {
		fetch('/web/api/flow?apiId=' + this.state.apiId + '&creator=' + this.state.currentUser.userName).then((resp) => {
			this.setState({flows: resp.data});
		});
	}

	onDelete(id) {
		fetch('/web/api/flow/' + id, {
			method: 'DELETE'
		}).then((resp) => {
			this.onRefresh();
			notification.info({
				message: '删除成功'
			});
		});
	}

	render() {

		return (
			<div>
				<Button type="primary" onClick={ e=> {e.preventDefault(); this.context.router.push('/api/flow/add?apiId=' + this.state.apiId); } }  >+ 创建分流</Button>
				<br/>
				<br/>
				<Table dataSource={this.state.flows.list} bordered pagination={false} >
					<Table.Column title='源API名称' dataIndex='apiName' key='apiName' width='25%' />
					<Table.Column title='目标API名称' dataIndex='targetApiName' key='targetApiName' width='25%' />
					<Table.Column title='分流比例' dataIndex='flowRatio' key='flowRatio' width='8%' render={(text, flow) => (
						<span>{text}% / 分钟</span>
					)} />
					<Table.Column title='分流配置' dataIndex='conf' key='conf' width='15%' />
					<Table.Column title='创建者' dataIndex='creatorName' key='creatorName' width='10%' />
					<Table.Column title='操作' dataIndex='operation' key='operation' width='22%' render={(text, flow) => (
		      			<span>
					      <a href={"/#/api/flow/edit/" + flow.id} className="ant-dropdown-link" >
					        <Icon type="edit" /> 编辑
					      </a>
					      &nbsp;&nbsp;
					      <span className="ant-divider" />
					      &nbsp;&nbsp;
					      {
					      	this.state.currentUser.userName == flow.creator &&
					      	<span>
						      	<Popconfirm title="确认删除该分流项吗?" onConfirm={ e=> {this.onDelete(flow.id)} } okText="确定" cancelText="取消">
							      <a href="#" className="ant-dropdown-link" onClick={e=>{e.preventDefault();}}>
							        <Icon type="delete" /> 删除
							      </a>
							  	</Popconfirm>
						  	</span>
					      }
					    </span>
			      	 ) } />
				</Table>
			</div>
		);
	}
}

APIFlowList.contextTypes = {
  router: React.PropTypes.object.isRequired
}
