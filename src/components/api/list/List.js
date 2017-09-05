
import React, { Component } from 'react'
import ReactEcharts from 'echarts-for-react';
import { Pagination, Table } from 'antd';
import { Menu, Dropdown, Button, Icon, message, Select, Input, Row, Col, BackTop, Modal, AutoComplete, Tag, Popconfirm, notification } from 'antd';
const Option = Select.Option;
import {connect} from 'react-redux';
import Constant from '../../../constant/global';
import APITest from '../edit/Test';
import APIPublish from '../edit/Pub';
import APIDoc from '../edit/Doc';
import APIPreview from '../edit/Preview';
import APICopy from '../copy/Copy';
import { getStore } from '../../../util/globalStore';
import cookie from 'react-cookie';
import debounce from 'lodash.debounce';

import 'whatwg-fetch';

class APIList extends React.Component {

	constructor(props) {
		super(props);
		this.state = {apiGroups: [], apiData: {}, searchApis: [], searchUsers: [], showTest: false, showDoc: false, showCopy: false, testState: {}, apiGroup: 'all', apiProtocol: 'all', enableInnerOuter: 'all', currentUser: {env: 'dev'}};
		this.handleCreate = this.handleCreate.bind(this);
		this.onSearchUser = debounce(this.onSearchUser, 300);
		this.onSearchApiByName = debounce(this.onSearchApiByName, 300);
	}

	componentDidMount() {
		fetch('/web/group?pageSize=1000').then((resp) => {
			var apiGroups = [];
			for (var i=0; i<resp.data.list.length; i++) {
				var item = resp.data.list[i];
				apiGroups.push({
					text: item.name,
					value: item.alias
				})
			}
			this.setState({'apiGroups': resp.data.list});
		});
		
		fetch('/web/user/self').then(resp => {
			this.setState({currentUser: resp.data});
			// 首次加载从cookie获取用户
			var apiList = cookie.load('apiList');
			if (!apiList) {
				apiList = {};
			}
			if (typeof apiList.userName != 'undefined' && apiList.userName != null) {
				this.setState({userName: apiList.userName});
			} else {
				this.setState({userName: resp.data.userName});
			}
			if (typeof apiList.apiProtocol != 'undefined' && apiList.apiProtocol != null) {
				this.setState({apiProtocol: apiList.apiProtocol});
			}
			if (typeof apiList.enableInnerOuter != 'undefined' && apiList.enableInnerOuter != null) {
				this.setState({enableInnerOuter: apiList.enableInnerOuter});
			}
			if (typeof apiList.apiGroup != 'undefined' && apiList.apiGroup != null) {
				this.setState({apiGroup: apiList.apiGroup});
			}
			if (typeof apiList.apiName != 'undefined' && apiList.apiName != null) {
				this.setState({apiName: apiList.apiName});
			}
			if (typeof apiList.pageSize != 'undefined' && apiList.pageSize != null) {
				this.setState({pageSize: apiList.pageSize});
			}
			this.onRefresh();
		});
	}

	onRefresh(pageNum, pageSize) {
		if (typeof pageNum == 'undefined') {
			pageNum = 1;
		}
		var newPageSize = 10;

		var apiList = {
			apiGroup: 'all',
			apiProtocol: 'all',
			enableInnerOuter: 'all',
			apiName: '',
			userName: '',
			apiStatus: '',
			pageSize: newPageSize
		}

		if (pageSize) {
			newPageSize = pageSize;
			this.setState({pageSize: pageSize});
			apiList.pageSize = pageSize;
		} else if (this.state.pageSize) {
			newPageSize = this.state.pageSize;
			apiList.pageSize = newPageSize;
		}

		var qs = 'pageNum=' + pageNum + '&pageSize=' + newPageSize + '&';
		if (this.state.apiGroup && this.state.apiGroup != 'all') {
			qs += 'group=' + this.state.apiGroup + '&';
			apiList.apiGroup = this.state.apiGroup;
		}
		if (this.state.apiProtocol && this.state.apiProtocol != 'all') {
			var protocol = 0;
			if (this.state.apiProtocol.toLowerCase() == 'dubbo') {
				protocol = 1;
			} else if (this.state.apiProtocol.toLowerCase() == 'php') {
				protocol = 2;
			} else if (this.state.apiProtocol.toLowerCase() == 'nova_java') {
				protocol = 3;
			} else if (this.state.apiProtocol.toLowerCase() == 'nova_php') {
				protocol = 4;
			}
			qs += 'protocol=' + protocol + '&';
			apiList.apiProtocol = this.state.apiProtocol;
		}
		if (this.state.enableInnerOuter && this.state.enableInnerOuter != 'all') {
			qs += 'enableInnerOuter=' + this.state.enableInnerOuter + '&';
			apiList.enableInnerOuter = this.state.enableInnerOuter;
		}
		if (this.state.apiName) {
			qs += 'name=' + this.state.apiName + '&';
			apiList.apiName = this.state.apiName;
		}
		if (this.state.userName) {
			qs += 'creator=' + this.state.userName + '&';
			apiList.userName = this.state.userName;
		}
		if (this.state.apiStatus && this.state.apiStatus != 'all') {
			qs += 'apiStatus=' + this.state.apiStatus + '&';
		}
		cookie.save('apiList', apiList, { path: '/' });
		fetch('/web/api?' + qs).then((resp) => {
			var data = resp.data;
			this.setState({'apiData': data});
		});
	}

	handleCreate() {
		this.context.router.push('/api/add');
	}

	onShowTest(api) {
		this.setState({testApiName: api.name + '.' + api.version, showTest: true, testState: {
			apiId: api.id
		}});
	}

	onPreview(api) {
		fetch('/web/api/' + api.id).then(resp => {
			this.setState({previewApiName: api.name + '.' + api.version, previewApiDesc: resp.data.carmenApi.apiDesc, showPreview: true, previewState: {
				apiId: api.id
			}});
		});
	}

	onTestApi() {
		this.testComponent.selector.props.onTest(this.state.testState.apiId, this.testComponent.store.getState().test, () => {
			this.onRefresh();
		});
	}

	onShowPublish(api) {
		this.setState({publishApiName: api.name + '.' + api.version, showPublish: true, publishState: {
			apiId: api.id,
			api: api
		}});
	}

	onShowDoc(api) {
		this.setState({docApiName: api.name + '.' + api.version, showDoc: true, docState: {
			apiId: api.id
		}});
	}

	onShowCopy(api) {
		this.setState({copyApiName: api.name + '.' + api.version, showCopy: true, copyState: {
			apiId: api.id
		}});
	}
	
	onPublishApi() {
		this.publishComponent.selector.props.onPublish(this.state.publishState.apiId, this.state.publishState.api, () => {
			this.onRefresh();
		});
	}

	onUpdateDoc() {
		this.docComponent.selector.props.onUpdate(this.state.docState.apiId, this.docComponent.store.getState().doc);
	}

	onDeleteApi(apiId) {
		fetch('/web/api/' + apiId, {
			method: 'DELETE'
		}).then(resp => {
			notification.info({
				message: '删除成功'
			});
			this.onRefresh();
		});
	}

	onSearchApiByName(kw) {
		fetch('/web/api?name=' + kw).then((resp) => {
			var data = resp.data;
			this.setState({'searchApis': data.list});
		});
	}

	onSearchUser(kw) {
		if (kw && kw.length > 0) {
			fetch('/web/oauser?name=' + kw).then((resp) => {
				var data = resp.data;
				this.setState({'searchUsers': data.list});
			});
		}
	}

	onSearchApi() {
		
	}

	render() {
		const env = this.state.currentUser.env;
		const opWidth = (env == 'pre' || env == 'prod') ? '23%' : '18%';

		return (
			<div>
				<Row>
					<Col md={4}>
						<Select
						    showSearch
						    placeholder="选择API分组"
						    size={'large'}
						    style={{ width: '95%' }}
						    value={this.state.apiGroup}
						    onSelect={val => this.setState({apiGroup: val})}
						    optionFilterProp="children"
						    filterOption={(input, option) => { return option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0 || option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}}
						  >
						  	<Option key='all' value='all'>所有分组</Option>
						    {
						    	this.state.apiGroups.map(apiGroup => {
						    		return (
						    			<Option key={apiGroup.alias} value={apiGroup.alias}>{apiGroup.name}</Option>
						    		)
						    	})
						    }
					    </Select>
					</Col>
					&nbsp;&nbsp;
					<Col md={4}>
						<Select
					    showSearch
					    size={'large'}
					    style={{ width: '95%' }}
					    placeholder="选择API类型"
					    optionFilterProp="children"
					    onSelect={val => this.setState({apiProtocol: val})}
					    value={this.state.apiProtocol}
					    filterOption={(input, option) => { return option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0 || option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}}
					  >
					  	<Option key='all' value='all'>所有协议</Option>
					    {
					    	Constant.API_PROTOCOL.map(protocol => {
					    		return (
					    			<Option key={protocol.value} value={protocol.value}>{protocol.text}</Option>
					    		)
					    	})
					    }
						</Select>
					</Col>
					&nbsp;&nbsp;
					<Col md={3}>
						<Select
					    showSearch
					    size={'large'}
					    style={{ width: '93%' }}
					    placeholder="是否对外开放"
					    optionFilterProp="children"
					    onSelect={val => this.setState({enableInnerOuter: val})}
					    value={this.state.enableInnerOuter}
					    filterOption={(input, option) => { return option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0 || option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}}
					  >
							<Option key='all' value='all'>开放和不开放</Option>
							<Option key='1' value='1'>对外开放</Option>
							<Option key='0' value='0'>不对外开放</Option>
						</Select>
					</Col>
					&nbsp;&nbsp;
					<Col md={5}>
						<AutoComplete value={this.state.apiName} dataSource={this.state.searchApis.map(api => <Option key={api.id.toString()} value={api.name + '.' + api.version} text={api.name + '.' + api.version}>{api.name + '.' + api.version}</Option>)} 
						style={{ width: '95%' }} size={'large'} onChange={val => {this.setState({apiName: val}); this.onSearchApiByName(val) }} placeholder="输入API名称进行搜索" 
						optionLabelProp="text" />&nbsp;&nbsp;
					</Col>
					&nbsp;&nbsp;
					<Col md={4}>
						<AutoComplete dataSource={this.state.searchUsers.map(item => <Option key={item.userName} value={item.userName} text={item.realName}>{item.realName}</Option>)} 
						style={{ width: '95%' }} size={'large'} value={this.state.userName} onChange={val => { this.setState({userName: val}); this.onSearchUser(val)} } placeholder="输入用户进行搜索" 
						optionLabelProp="text" />&nbsp;&nbsp;
					</Col>
					&nbsp;&nbsp;
					<Col md={3}>
						<Button type="primary" size={'large'} onClick={e=> {e.preventDefault(); this.onRefresh();}}><Icon type='search' />搜索</Button>
					</Col>
				</Row>
				<br />
				{
					(env == 'qa' || env == 'dev') && 
					<Button type="primary"  onClick={this.handleCreate}  >+ 创建API</Button>
				}
				{
					(env == 'qa' || env == 'dev') && 
					<Button type="primary" style={{marginLeft: '10px'}} onClick={ e=> { e.preventDefault(); this.context.router.push('/api/parse'); }}  >+ 解析jar包中的API</Button>
				}
				{
					(env == 'qa' || env == 'dev') && 
					<br/>
				}
				{
					(env == 'qa' || env == 'dev') && 
					<br/>
				}
				<Table dataSource={this.state.apiData.list} bordered pagination={ { 
							current: this.state.apiData.pageNum, 
							pageSize: this.state.apiData.pageSize, 
							total: this.state.apiData.total, 
							showSizeChanger: true,
							onChange: (page, pageSize) => { this.onRefresh(page, pageSize) },
							onShowSizeChange: (curPageSize, newPageSize) => { this.onRefresh(undefined, newPageSize) }
						} }>
					<Table.Column title='名称' dataIndex='name' key='name' width='22%' render={(text, api) => (
		      			<a href={"/#/api/view/" + api.id}>{api.name + '.' + api.version}</a>
			      	 ) } />
					<Table.Column title='所属分组' dataIndex='apiGroupName' key='group' width='10%' />
					<Table.Column title='是否开放' dataIndex='enableInnerOuter' key='enableInnerOuter' width='5%' render={(text, api) => {
						return (
							<span>
							{
								api.enableInnerOuter == 1 ? <span>是</span> : <span>否</span> 
							}
							</span>
						)
					}} />
					<Table.Column title='协议类型' dataIndex='apiType' key='protocol' width='8%' render={(text, api) => {
						return (
						<span className="badge alert-error">
			      			{
			      				api.apiType == 1 && 'DUBBO'
			      			}
			      			{
			      				api.apiType == 2 && 'PHP'
			      			}
			      			{
			      				api.apiType == 3 && 'NOVA_JAVA'
			      			}
			      			{
			      				api.apiType == 4 && 'NOVA_PHP'
			      			}
		      			</span>
		      			)
			      	 } }  />
					<Table.Column title='创建者' dataIndex='creatorName' key='creatorName' width='5%' render={(text, api) => (
		      			<span className="badge alert-yes">{text}</span>
			      	 ) } />
					<Table.Column title='状态' dataIndex='apiStatus' key='status' width='5%' render={(text, api) => {
						return (
							<span>
							{
								api.apiStatus == 1 && <span className="badge alert-warning">{api.apiStatusName}</span>
							}
			      			{
								api.apiStatus == 2 && <span className="badge alert-debug">{api.apiStatusName}</span>
							}
							{
								api.apiStatus == 3 && <span className="badge alert-notify">{api.apiStatusName}</span>
							}
							{
								api.apiStatus == 4 && <span className="badge alert-error">{api.apiStatusName}</span>
							}
							{
								api.apiStatus == 5 && <span className="badge alert-info">{api.apiStatusName}</span>
							}
							{
								api.apiStatus == 6 && <span className="badge alert-success">{api.apiStatusName}</span>
							}
							</span>
						)
			      	 }} />
					<Table.Column title='操作' dataIndex='operation' key='operation' width={opWidth} render={(text, api) => (
		      			<span>
						  <a href="javascript:void(0)" onClick={e=>{e.preventDefault(); this.onPreview(api); }}><Icon type="eye" /> 预览</a>
						  &nbsp;<span className="ant-divider" /> 
						  <a href="javascript:void(0)" onClick={e=>{e.preventDefault(); this.onShowTest(api); }}><Icon type="setting" /> 测试</a>
						  &nbsp;<span className="ant-divider" /> 
					      {
					      	(this.state.currentUser.userGroup == 0 || api.owners.includes(this.state.currentUser.userName) || api.creator == this.state.currentUser.userName || (this.state.currentUser.userAccessGroup && this.state.currentUser.userAccessGroup.split(',').includes(api.apiGroup))) && 
					      	<span>
					      		{
					      			(env == 'dev' || env == 'qa' || this.state.currentUser.userGroup == 0) && 
					      			<span>
					      				<a href={"/#/api/edit/" + api.id} ><Icon type="edit" /> 编辑</a>
					      				&nbsp;<span className="ant-divider" /> &nbsp;
					      			</span>
					      		}
				      			<a href="javascript:void(0)" onClick={e=>{e.preventDefault(); this.onShowDoc(api); }} className="ant-dropdown-link">
					        		<Icon type="book" /> 文档完善</a>
					        		&nbsp;<span className="ant-divider" /> &nbsp;
					      		{
					      			(env != 'prod' && env != 'pre') && 
					      			<span>
					      				<a href="javascript:void(0)" onClick={e=>{e.preventDefault(); this.onShowPublish(api); }} className="ant-dropdown-link">
					        			<Icon type="upload" /> 发布</a>
					        			&nbsp;<span className="ant-divider" />&nbsp;
					      			</span>
					      		}
					      		<a href={"/#/api/flow/list?apiId=" + api.id} ><Icon type="usb" /> 分流</a>
			      				&nbsp;<span className="ant-divider" /> &nbsp;
					      	</span>
					      }
					      {
					      	(env == 'dev' || env == 'qa') &&
					      	<span>
					      		<a href={"/#/api/flow/list?apiId=" + api.id} onClick={e => {e.preventDefault(); this.onShowCopy(api) }} ><Icon type="copy" /> 复制</a>
  								&nbsp;<span className="ant-divider" /> &nbsp;
					      	</span>
					      }
					      {
					      	env == 'pre' &&
					      	<a href={"http://cmon-pre.s.qima-inc.com/#/apiStatistics/overview?apiId=" + api.id} target="_blank" className="ant-dropdown-link">
					        	<Icon type="area-chart" /> 统计
					        	<span>&nbsp;<span className="ant-divider" />&nbsp;</span>
					      	</a>
					      }
					      {
					      	env == 'prod' &&
					      	<a href={"http://cmon.s.qima-inc.com/#/apiStatistics/overview?apiId=" + api.id} target="_blank" className="ant-dropdown-link">
					        	<Icon type="area-chart" /> 统计
					        	<span>&nbsp;<span className="ant-divider" />&nbsp;</span>
					      	</a>
					      }
					      {
					      	this.state.currentUser.userGroup == 0 &&
					      	<span>
						      	<Popconfirm title="确认删除该api吗?" onConfirm={ e=> {this.onDeleteApi(api.id)} } okText="确定" cancelText="取消">
							      <a href="#" className="ant-dropdown-link" onClick={e=>{e.preventDefault();}}>
							        <Icon type="delete" /> 删除
							      </a>
							  	</Popconfirm>
						  	</span>
					      }
					    </span>
			      	 ) } />
				</Table>

				<Modal
		          title={this.state.testApiName}
		          wrapClassName="vertical-center-modal"
		          okText="测试"
		          cancelText="取消"
		          visible={this.state.showTest}
		          width={1000}
		          onOk={() => this.setState({showTest: false})}
		          onCancel={() => this.setState({showTest: false})}
		          footer={<center><Button type="primary" onClick={e=>{e.preventDefault(); this.onTestApi();}}>测试</Button> <Button onClick={e=>{e.preventDefault(); this.setState({showTest: false});}}>取消</Button></center>}
		        >
					{
						this.state.showTest && 
						<APITest isListTrigger={true} apiId={this.state.testState.apiId} ref={(test) => {this.testComponent = test;}} />
					}
				</Modal>

				<Modal
		          title={this.state.previewApiName + ' - ' + this.state.previewApiDesc}
		          wrapClassName="vertical-center-modal"
		          okText="测试"
		          cancelText="取消"
		          visible={this.state.showPreview}
		          width={1000}
		          onOk={() => this.setState({showPreview: false})}
		          onCancel={() => this.setState({showPreview: false})}
		          footer={<center><Button onClick={e=>{e.preventDefault(); this.setState({showPreview: false});}}>取消</Button></center>}
		        >
					{
						this.state.showPreview && 
						<APIPreview isListTrigger={true} apiId={this.state.previewState.apiId} ref={(test) => {this.previewComponent = test;}} mode='view' />
					}
				</Modal>

				<Modal
		          title={this.state.publishApiName}
		          wrapClassName="vertical-center-modal"
		          okText="发布"
		          cancelText="取消"
		          visible={this.state.showPublish}
		          width={1000}
		          onOk={() => this.setState({showPublish: false})}
		          onCancel={() => this.setState({showPublish: false})}
		          footer={
		          	<center>
			          	<Button type="primary" onClick={e=>{e.preventDefault(); this.onPublishApi();}} loading={this.props.state.app.loading}>发布</Button> 
			          	<Button onClick={e=>{e.preventDefault(); this.setState({showPublish: false});}}>取消</Button>
		          	</center>}
		        >
					{
						this.state.showPublish && 
						<APIPublish isListTrigger={true} apiId={this.state.publishState.apiId} ref={(pub) => {this.publishComponent = pub;}} />
					}
				</Modal>

				<Modal
		          title={this.state.docApiName}
		          wrapClassName="vertical-center-modal"
		          okText="文档"
		          cancelText="取消"
		          visible={this.state.showDoc}
		          width={1000}
		          onOk={() => this.setState({showDoc: false})}
		          onCancel={() => this.setState({showDoc: false})}
		          footer={<center><Button type="primary" onClick={e=>{e.preventDefault(); this.onUpdateDoc();}}>更新</Button> <Button onClick={e=>{e.preventDefault(); this.setState({showDoc: false});}}>取消</Button></center>}
		        >
					{
						this.state.showDoc && 
						<APIDoc isListTrigger={true} apiId={this.state.docState.apiId} ref={(doc) => {this.docComponent = doc;}} />
					}
				</Modal>

				<Modal
		          title={this.state.docApiName}
		          wrapClassName="vertical-center-modal"
		          okText="文档"
		          cancelText="取消"
		          visible={this.state.showCopy}
		          width={1000}
		          onOk={() => this.setState({showCopy: false})}
		          onCancel={() => this.setState({showCopy: false})}
		          footer={null}
		        >
					{
						this.state.showCopy && 
						<APICopy isListTrigger={true} apiId={this.state.copyState.apiId} ref={(copy) => {this.copyComponent = copy;}} />
					}
				</Modal>

				<BackTop />
			</div>
		);
	}
}

APIList.contextTypes = {
  router: React.PropTypes.object.isRequired
}

const mapStateToProps = (state) => {
	return {
		state: state
	}
}

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(APIList);

