import React, { Component } from 'react';
import Collapse from 'react-collapse';
import {presets} from 'react-motion';
import Constant from '../../../constant/global';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { monokai } from 'react-syntax-highlighter/dist/styles';
import {Tabs, Table, Column, Button, Row, Col, Select, Input, Card, notification, Icon, Checkbox, Modal, Form, AutoComplete, Popconfirm} from 'antd';
const uuidV1 = require('uuid/v1');
import {connect} from 'react-redux';
import 'whatwg-fetch';
var CodeMirror = require('react-codemirror');
var _ = require('lodash');
import JSONTree from 'react-json-tree'

const theme = {
  scheme: 'monokai',
  author: 'wimer hazenberg (http://www.monokai.nl)',
  base00: '#272822',
  base01: '#383830',
  base02: '#49483e',
  base03: '#75715e',
  base04: '#a59f85',
  base05: '#f8f8f2',
  base06: '#f5f4f1',
  base07: '#f9f8f5',
  base08: '#f92672',
  base09: '#fd971f',
  base0A: '#f4bf75',
  base0B: '#a6e22e',
  base0C: '#a1efe4',
  base0D: '#66d9ef',
  base0E: '#ae81ff',
  base0F: '#cc6633'
};

class Doc extends React.Component {

	constructor(props) {
		super(props);
		this.state = { step: 'edit', results: [], activeLang: 'Java', isRequestExpand: true, isResultExpand: true, isErrorExpand: true, isSuccessExpand: true, isFailExpand: true, types: [], myResultTypes: [], showTypeList: false, showTypeAdd: false, showTypeEdit: false,
		typeName: '', typeFields: [], searchMetas: [], metaData: {}, currentUser: {userName: ''}, apiData: {namespace: '', name: '', version: ''} };
		this.props.onReset();
	}

	componentDidMount() {
		var apiId = this.props.state.inner.apiId;
		if (!apiId) {
			apiId = this.props.apiId;
		}
		this.setState({apiId: apiId});

		const outerTypes = Constant.API_OUTER_TYPE;
		for (var i=0; i<outerTypes.length; i++) {
			this.state.types.push(outerTypes[i]);
			this.state.myResultTypes.push({
				...outerTypes[i],
				isBasic: true
			});
		}

		fetch('/web/api/' + apiId).then(resp => {
			this.setState({apiData: resp.data.carmenApi});
		});

		if (this.props.review) {
			fetch('/web/audit/' + apiId + '/doc').then(resp => {
				if (!resp.data || resp.data == null) {
					return;
				}
				this.props.onRestoreDoc(resp.data);
			});
		} else {
			this.onReloadMeta(apiId, () => {
				fetch('/web/api/' + apiId + '/doc').then(resp => {
					if (!resp.data || resp.data == null) {
						return;
					}
					this.props.onRestoreDoc(resp.data);
				});
				fetch('/web/user/self').then(resp => {
					this.setState({currentUser: resp.data});
					this.onRefresh();
				})
			})
		}
	}

	onReloadMeta(apiId, fn) {
		fetch('/web/meta?pageSize=1000000').then(resp => {
			if (!resp.data || resp.data == null) {
				return;
			}
			const structs = resp.data.list;
			var types = [];
			var myResultTypes = [];
			for (var i=0; i<Constant.API_OUTER_TYPE.length; i++) {
				const type = Constant.API_OUTER_TYPE[i];
				myResultTypes.push({
					id: uuidV1(),
					text: type.text,
					value: type.value
				});
			}

			for (var i=0; i<structs.length; i++) {
				types.push({
					id: uuidV1(),
					text: structs[i].name,
					value: structs[i].name
				});
				myResultTypes.push({
					id: uuidV1(),
					text: structs[i].name,
					value: structs[i].name
				});

				myResultTypes.push({
					id: uuidV1(),
					text: structs[i].name + '[]',
					value: structs[i].name + '[]'
				});

				types.push({
					id: uuidV1(),
					text: structs[i].name + '[]',
					value: structs[i].name + '[]'
				});
			}
			this.setState({types: types, myResultTypes: myResultTypes});
			if (fn) {
				fn(apiId);
			}
		});
	}

	componentWillUnmount() {
		this.props.onReset();
	}

	handleAddResult(e) {
		e.preventDefault();
	}

	handleContinue(e) {
		this.props.handleContinue(e);
	}

	handleLangClick(e, {name}) {
		this.setState({activeLang: name});
	}

	onSave() {
		this.props.onUpdate(this.props.state.inner.apiId, this.props.doc);
	}

	onRefresh(pageNum) {
		var newPageNum = 1;
		if (pageNum) {
			newPageNum = pageNum;
		}
		var qs = 'pageNum=' + newPageNum + '&';
		if (this.state.metaName) {
			qs += 'name=' + this.state.metaName; 
		}

		fetch('/web/meta?' + qs).then(resp => {
			this.setState({metaData: resp.data});
		});
	}

	onAddTypeField() {
		this.state.typeFields.push({
			id: uuidV1(),
            isBasic: true
		});
		this.setState({typeFields: this.state.typeFields});
	}

	onSetTypeField(row, col, val) {
		this.state.typeFields.map(f => {
			if (f.id != row) {
				return f;
			}
            const outerTypes = Constant.API_OUTER_TYPE;
            var isBasic = false;
            for (var i=0; i<outerTypes.length; i++) {
                if (outerTypes[i].value == val) {
                    isBasic = true;
                    break;
                }
            }
			f[col] = val;
            f.isBasic = isBasic;
		});
		this.setState({typeFields: this.state.typeFields});
	}

	onDeleteTypeField(row) {
		var newParams = this.state.typeFields.filter(f => f.id != row);
		this.setState({typeFields: newParams});
	}

	onAddType() {
		if (!this.state.typeName) {
			notification.error({message: '请输入类型名称'});
			return false;
		}
		var form = {
			name: this.state.typeName,
			description: this.state.typeDesc,
			fields: [...this.state.typeFields]
		};

		fetch('/web/meta', {
			method: 'POST',
			body: JSON.stringify(form)
		}).then(resp => {
			this.setState({typeName: '', typeFields: [], typeDesc: ''});
			notification.info({message: '添加返回值结构成功'});
			this.onRefresh();
			this.onReloadMeta(this.state.apiId);
		});

		return true;
	}

    onUpdateType() {
        if (!this.state.typeName) {
            notification.error({message: '请输入类型名称'});
            return false;
        }
        var newTypes = this.state.myResultTypes.filter((item) => item.id != this.state.typeId);
        
        var form = {
			name: this.state.typeName,
			description: this.state.typeDesc,
			fields: [...this.state.typeFields]
		};

        fetch('/web/meta', {
        	method: 'PUT',
        	body: JSON.stringify(form)
        }).then(resp => {
        	this.setState({typeName: '', typeFields: [], typeDesc: ''});
        	notification.info({message: '更新返回值结构成功'});
        });
        return true;
    }

    onEditType(name) {
    	fetch('/web/meta/' + name).then(resp => {
    		if (!resp.data) {
    			notification.error({message: '结构不存在'});
    			return;
    		}
    		const meta = resp.data;
    		var fields = [];
    		if (meta.fields) {
    			meta.fields.map(f => {
    				fields.push({
    					id: uuidV1(),
    					name: f.name,
    					description: f.description,
    					example: f.example,
    					type: f.type
    				})
    			})
    		}
    		this.setState({typeId: meta.id, typeName: meta.name, typeDesc: meta.description, typeFields: fields});
    	});
    }

    onDeleteType(name) {
    	fetch('/web/meta/' + name, {
    		method: 'DELETE'
    	}).then(resp => {
    		notification.info({message: '删除结构成功'});
    		this.onRefresh();
    		this.onReloadMeta(this.state.apiId);
    	})
    }

	render() {

		const apiNamespace = this.state.apiData.namespace;
		const apiMethod = this.state.apiData.name;
		const apiVersion = this.state.apiData.version;
		const outerUrl = "https://open.youzan.com/api";
		const innerUrl = "https://carmen.youzan.com/gw";
		const oauthUrl = 'oauthentry';
		const signUrl = 'entry';
		const apiFullName = apiNamespace + '/' + apiVersion + '/' + apiMethod ;

		return (
			<div>
				<Card title="URL调用示例">
					<Tabs>
						<Tabs.TabPane tab="对内" key="1">
							<Row gutter={16}>
								<Col span={3}>
									<span style={{ color: '#28b5d6', fontSize: '13px' }}>
										服务商接入: 
									</span>
								</Col>
								<Col span={21}>
									<span style={{ color: '#28b5d6', fontSize: '13px' }}>
										<p>
											curl -X POST -d "key1=value1&key2=value2" { innerUrl + '/' + oauthUrl + '/' + apiFullName }
										</p>
									</span>
								</Col>
							</Row>
							<br/>
							<Row gutter={16}>
								<Col span={3}>
									<span style={{ color: '#28b5d6', fontSize: '13px' }}>
										商家自有接入: 
									</span>
								</Col>
								<Col span={21}>
									<span style={{ color: '#28b5d6', fontSize: '13px' }}>
										<p>
											curl -X POST -d "key1=value1&key2=value2" { innerUrl + '/' + signUrl + '/' + apiFullName }
										</p>
									</span>
								</Col>
							</Row>
						</Tabs.TabPane>
						<Tabs.TabPane tab="对外" key="2">
							<Row gutter={16}>
								<Col span={3}>
									<span style={{ color: '#28b5d6', fontSize: '13px' }}>
										服务商接入: 
									</span>
								</Col>
								<Col span={21}>
									<span style={{ color: '#28b5d6', fontSize: '13px' }}>
										<p>
											curl -X POST -d "key1=value1&key2=value2" { outerUrl + '/' + oauthUrl + '/' + apiFullName }
										</p>
									</span>
								</Col>
							</Row>
							<br/>
							<Row gutter={16}>
								<Col span={3}>
									<span style={{ color: '#28b5d6', fontSize: '13px' }}>
										商家自有接入: 
									</span>
								</Col>
								<Col span={21}>
									<span style={{ color: '#28b5d6', fontSize: '13px' }}>
										<p>
											curl -X POST -d "key1=value1&key2=value2" { outerUrl + '/' + signUrl + '/' + apiFullName }
										</p>
									</span>
								</Col>
							</Row>
						</Tabs.TabPane>
					</Tabs>
				</Card>
				<br />

				<Card title="SDK调用示例">
					<Tabs>
						<Tabs.TabPane tab="Java示例" key="1">
							<CodeMirror value={this.props.doc.javaDemo} options={{lineNumbers: true, readOnly: this.props.mode == 'view'}} onChange={val => {this.props.onSetFieldValue('javaDemo', val); }} />
						</Tabs.TabPane>
						<Tabs.TabPane tab="C#示例" key="2">
							<CodeMirror value={this.props.doc.csharpDemo} options={{lineNumbers: true, readOnly: this.props.mode == 'view'}} onChange={val => {this.props.onSetFieldValue('csharpDemo', val); }} />
						</Tabs.TabPane>
						<Tabs.TabPane tab="PHP示例" key="3">
							<CodeMirror value={this.props.doc.phpDemo} options={{lineNumbers: true, readOnly: this.props.mode == 'view'}} onChange={val => {this.props.onSetFieldValue('phpDemo', val); }} />
						</Tabs.TabPane>
						<Tabs.TabPane tab="Python示例" key="4">
							<CodeMirror value={this.props.doc.pythonDemo} options={{lineNumbers: true, readOnly: this.props.mode == 'view'}} onChange={val => {this.props.onSetFieldValue('pythonDemo', val); }} />
						</Tabs.TabPane>
						<Tabs.TabPane tab="NodeJS示例" key="5">
							<CodeMirror value={this.props.doc.nodejsDemo} options={{lineNumbers: true, readOnly: this.props.mode == 'view'}} onChange={val => {this.props.onSetFieldValue('nodejsDemo', val); }} />
						</Tabs.TabPane>
					</Tabs>
				</Card>
				
				<br />
				<Card title="返回值">
					<Table showHeader={true} dataSource={this.props.doc.resultParams} pagination={false} bordered >
				      	<Column title='名称' dataIndex='name' key='name' width='10%' render={(text, result) => (
			      			<Input value={result.name} onChange={e=> {this.props.onSetResultValue(result.id, 'name', e.target.value)}} disabled={this.props.mode == 'view'} />
				      	 ) } />
				      	<Column title='类型' dataIndex='type' key='type' width='20%' render={(text, result) => (
				      		<Row>
					      		<Col md={24}>
						      		<Select showSearch placeholder="选择类型" style={{width: '100%'}} value={result.type} onSelect={val=> {this.props.onSetResultValue(result.id, 'type', val)}} 
						      		disabled={this.props.mode == 'view'} 
						      		filterOption={(input, option) => { if (option.props.value) { return option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0 }; return false; }}>
					      				{
					      					this.state.myResultTypes.map(type => {
									    		return (
									    			<Option key={type.value} value={type.value}>{type.text}</Option>
									    		)
									    	})
					      				}
					      			</Select>
					      		</Col>
			      			</Row>
				      	 ) } />
				      	<Column title='默认值' dataIndex='defaultValue' key='defaultValue' width='10%' render={(text, result) => (
			      			<Input type='textarea' autosize={true} value={result.defaultValue} onChange={e=> {this.props.onSetResultValue(result.id, 'defaultValue', e.target.value)}} disabled={this.props.mode == 'view'} />
				      	 ) } />
				      	<Column title='示例' dataIndex='example' key='example' width='10%' render={(text, result) => (
			      			<Input type='textarea' autosize={true} value={result.example} onChange={e=> {this.props.onSetResultValue(result.id, 'example', e.target.value)}} disabled={this.props.mode == 'view'} />
				      	 ) } />
				      	<Column title='描述' dataIndex='desc' key='desc' width='10%' render={(text, result) => (
			      			<Input type='textarea' autosize={true} value={result.desc} onChange={e=> {this.props.onSetResultValue(result.id, 'desc', e.target.value)}} disabled={this.props.mode == 'view'} />
				      	 ) } />
				      	<Column title='是否必须' dataIndex='isNeed' key='isNeed' width='8%' render={(text, result) => (
			      			<Checkbox checked={result.isNeed} onChange={e=> { this.props.onSetResultValue(result.id, 'isNeed', e.target.checked) }} disabled={this.props.mode == 'view'} >是</Checkbox>
				      	 ) } />
				      	<Column title='操作' dataIndex='operation' key='operation' width='10%' render={(text, result) => (
						    <span>
						      <Button onClick={e => {e.preventDefault(); this.props.onDeleteResult(result.id)}} disabled={this.props.mode == 'view'} >删除</Button>
						    </span>
						  )} />
				      </Table>
				      <br />
			      	  <Button type="primary" htmlType="submit" size="large" onClick={e => {e.preventDefault(); this.props.onAddResult()}} disabled={this.props.mode == 'view'} >+ 参数</Button>&nbsp;&nbsp;
			      	   
		      	  	<span>
		      	  		<Button type="primary" htmlType="submit" size="large" onClick={e => {e.preventDefault(); this.setState({showTypeAdd: true, typeName: '', typeFields: [], typeDesc: ''}) }} disabled={this.props.mode == 'view'} >+ 新增结构</Button>&nbsp;&nbsp;
		      	  		<Button type="primary" htmlType="submit" size="large" onClick={e => {e.preventDefault(); this.setState({showTypeList: true}) }} disabled={this.props.mode == 'view'} ><Icon type='setting' />管理结构</Button>
		      	  	</span>
			      	  
				</Card>
		
			      <br />
			      <Card title="正确响应">
			      	<CodeMirror value={this.props.doc.successResponse} options={{lineNumbers: true, readOnly: this.props.mode == 'view'}} onChange={val => {this.props.onSetFieldValue('successResponse', val); }} />
			      </Card>
			      <br />
			      <Card title="错误响应">
			      	<CodeMirror value={this.props.doc.errorResponse} options={{lineNumbers: true, readOnly: this.props.mode == 'view'}} onChange={val => {this.props.onSetFieldValue('errorResponse', val); }} />
			      </Card>
			      <br />
			      <Card title="错误码">
			      	<Table showHeader={true} dataSource={this.props.doc.errorCodes} pagination={false} bordered >
				      	<Column title='错误码' dataIndex='name' key='name' width='10%' render={(text, errorCode) => (
			      			<Input value={errorCode.name} onChange={e=> {this.props.onSetErrorCodeValue(errorCode.id, 'name', e.target.value)}} disabled={this.props.mode == 'view'} />
				      	 ) } />
				      	<Column title='描述' dataIndex='desc' key='desc' width='10%' render={(text, errorCode) => (
			      			<Input type='textarea' autosize={true} value={errorCode.desc} onChange={e=> {this.props.onSetErrorCodeValue(errorCode.id, 'desc', e.target.value)}} disabled={this.props.mode == 'view'} />
				      	 ) } />
				      	<Column title='解决方法' dataIndex='solution' key='solution' width='10%' render={(text, errorCode) => (
			      			<Input type='textarea' autosize={true} value={errorCode.solution} onChange={e=> {this.props.onSetErrorCodeValue(errorCode.id, 'solution', e.target.value)}} disabled={this.props.mode == 'view'} />
				      	 ) } />
				      	<Column title='操作' dataIndex='operation' key='operation' width='10%' render={(text, errorCode) => (
						    <span>
						      <Button onClick={e => {e.preventDefault(); this.props.onDeleteErrorCode(errorCode.id)}} disabled={this.props.mode == 'view'} >删除</Button>
						    </span>
						  )} />
				      </Table>
				      <br />
				      <Button type="primary" htmlType="submit" size="large" onClick={e => {e.preventDefault(); this.props.onAddErrorCode()}} disabled={this.props.mode == 'view'} >+ 错误码</Button> &nbsp;&nbsp;
				      <a href="http://doc.qima-inc.com/pages/viewpage.action?pageId=4857493" target="_blank" >卡门错误码列表</a>
			      </Card>
			      <br/>
			      {
			      	!this.props.isListTrigger && 
			      	<center>
				      	<Button type="primary" htmlType="submit" size="large" onClick={e=>{this.props.handlePrevious(); }} ghost={true} ><Icon type="left" /> 上一步</Button>
				      	&nbsp;&nbsp;&nbsp;&nbsp;
				      	{
				      		!(this.props.mode && this.props.mode == "view") && 
				      		<Button type="primary" htmlType="submit" size="large" onClick={e=>{e.preventDefault(); this.onSave()}} loading={this.props.state.app.loading}>保存</Button>
				      	}
	                    &nbsp;&nbsp;&nbsp;&nbsp;
	                    <Button type="primary" htmlType="submit" size="large" ghost={true} onClick={e=>{e.preventDefault(); this.handleContinue(e)}}>继续 <Icon type="right" /></Button>
	                </center>
			      }

			      <Modal
                  title="添加返回值结构"
                  wrapClassName="vertical-center-modal"
                  okText="添加"
                  cancelText="取消"
                  visible={this.state.showTypeAdd}
                  width={900}
                  onOk={() => this.setState({showTypeAdd: false})}
                  onCancel={() => this.setState({showTypeAdd: false})}
                  footer={
                    <center>
                        <Button type="primary" onClick={e=>{e.preventDefault(); this.onAddType();}}>添加</Button> 
                        <Button onClick={e=>{e.preventDefault(); this.setState({showTypeAdd: false});}}>取消</Button>
                    </center>}
                >
                  <Form >
                    <Form.Item labelCol={{md: 7}} wrapperCol={{md: 10}} label="名称" >
                      <Input value={this.state.typeName} onChange={e=>{this.setState({typeName: e.target.value})}} placeholder="例如：UserResultModel" />
                    </Form.Item>
                    <Form.Item labelCol={{md: 7}} wrapperCol={{md: 10}} label="描述" >
                      <Input type="textarea" autosize={true} value={this.state.typeDesc} onChange={e=>{this.setState({typeDesc: e.target.value})}} placeholder="" />
                    </Form.Item>
                  </Form>
                  <Table showHeader={true} dataSource={this.state.typeFields} pagination={false} bordered  >
                    <Column title='名称' dataIndex='name' key='name' width='20%' render={(text, field) => (
                        <Input value={field.name} onChange={e=> {this.onSetTypeField(field.id, 'name', e.target.value)}} />
                     ) } />
                    <Column title='类型' dataIndex='type' key='type' width='25%' render={(text, field) => (
                        <Row>
                            <Col md={24}>
                                <Select showSearch placeholder="选择类型" style={{width: '100%'}} value={field.type} onSelect={val=> {this.onSetTypeField(field.id, 'type', val)}} 
                                filterOption={(input, option) => { return option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0 || option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}}>
                                    {
                                        this.state.myResultTypes.map(type => {
                                            return (
                                                <Option key={type.value} value={type.value}>{type.text}</Option>
                                            )
                                        })
                                    }
                                </Select>
                            </Col>
                        </Row>
                     ) } />
                    <Column title='描述' dataIndex='description' key='description' width='25%' render={(text, field) => (
                        <Input type="textarea" autosize={true} value={field.description} onChange={e=> {this.onSetTypeField(field.id, 'description', e.target.value)}} />
                     ) } />
                    <Column title='示例' dataIndex='example' key='example' width='20%' render={(text, field) => (
                        <Input value={field.example} onChange={e=> {this.onSetTypeField(field.id, 'example', e.target.value)}} />
                     ) } />
                    <Column title='操作' dataIndex='operation' key='operation' width='10%' render={(text, field) => (
                        <span>
                          <Button onClick={e => {e.preventDefault(); this.onDeleteTypeField(field.id)}} >删除</Button>
                        </span>
                      )} />
                    </Table>
                <br/>
                <Button type="primary" htmlType="submit" size="large" onClick={e=>{e.preventDefault(); this.onAddTypeField()}}>+ 字段</Button>
                </Modal>

                <Modal
                  title="编辑返回值结构"
                  wrapClassName="vertical-center-modal"
                  okText="添加"
                  cancelText="取消"
                  visible={this.state.showTypeEdit}
                  width={900}
                  onOk={() => this.setState({showTypeEdit: false})}
                  onCancel={() => this.setState({showTypeEdit: false})}
                  footer={
                    <center>
                        <Button type="primary" onClick={e=>{e.preventDefault(); this.onUpdateType();}}>保存</Button> 
                        <Button onClick={e=>{e.preventDefault(); this.setState({showTypeEdit: false});}}>取消</Button>
                    </center>}
                >
                  <Form >
                    <Form.Item labelCol={{md: 7}} wrapperCol={{md: 10}} label="名称" >
                      <Input value={this.state.typeName} onChange={e=>{this.setState({typeName: e.target.value})}} disabled={true} />
                    </Form.Item>
                    <Form.Item labelCol={{md: 7}} wrapperCol={{md: 10}} label="描述" >
                      <Input type="textarea" autosize={true} value={this.state.typeDesc} onChange={e=>{this.setState({typeDesc: e.target.value})}} placeholder="" />
                    </Form.Item>
                  </Form>
                  <Table showHeader={true} dataSource={this.state.typeFields} pagination={false} bordered  >
                    <Column title='名称' dataIndex='name' key='name' width='20%' render={(text, field) => (
                        <Input value={field.name} onChange={e=> {this.onSetTypeField(field.id, 'name', e.target.value)}} />
                     ) } />
                    <Column title='类型' dataIndex='type' key='type' width='25%' render={(text, field) => (
                        <Row>
                            <Col md={24}>
                                <Select showSearch placeholder="选择类型" style={{width: '100%'}} value={field.type} onSelect={val=> {this.onSetTypeField(field.id, 'type', val)}} 
                                filterOption={(input, option) => { return option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0 || option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}}>
                                    {
                                        this.state.myResultTypes.map(type => {
                                            return (
                                                <Option key={type.value} value={type.value}>{type.text}</Option>
                                            )
                                        })
                                    }
                                </Select>
                            </Col>
                        </Row>
                     ) } />
                    <Column title='描述' dataIndex='description' key='description' width='25%' render={(text, field) => (
                        <Input type="textarea" autosize={true} value={field.description} onChange={e=> {this.onSetTypeField(field.id, 'description', e.target.value)}} />
                     ) } />
                    <Column title='示例' dataIndex='example' key='example' width='20%' render={(text, field) => (
                        <Input value={field.example} onChange={e=> {this.onSetTypeField(field.id, 'example', e.target.value)}} />
                     ) } />
                    <Column title='操作' dataIndex='operation' key='operation' width='10%' render={(text, field) => (
                        <span>
                          <Button onClick={e => {e.preventDefault(); this.onDeleteTypeField(field.id)}} >删除</Button>
                        </span>
                      )} />
                    </Table>
                <br/>
                <Button type="primary" htmlType="submit" size="large" onClick={e=>{e.preventDefault(); this.onAddTypeField()}}>+ 字段</Button>
                </Modal>

                <Modal
                  title="返回值结构列表"
                  wrapClassName="vertical-center-modal"
                  okText="添加"
                  cancelText="取消"
                  visible={this.state.showTypeList}
                  width={900}
                  onOk={() => this.setState({showTypeList: false})}
                  onCancel={() => this.setState({showTypeList: false})}
                  footer={<center><Button type="primary" onClick={e=>{e.preventDefault(); this.setState({showTypeList: false});}}>关闭</Button></center>}
                >
            	  <Row>
					<Col md={10}>
						<AutoComplete value={this.state.metaName} dataSource={this.state.searchMetas.map(meta => <Option key={meta.name} value={meta.name} text={meta.name}>{meta.name}</Option>)} 
						style={{ width: '97%' }} size={'large'} onChange={val => { this.setState({metaName: val}); }} placeholder="输入结构名称进行搜索" 
						optionLabelProp="text" />
					</Col>
					<Col md={3}>
						<Button type="primary" size={'large'} onClick={e=> {e.preventDefault(); this.onRefresh();}}><Icon type='search' />搜索</Button>
					</Col>
				  </Row>
				  <br/>
                  <Table showHeader={true} dataSource={this.state.metaData.list} bordered pagination={ { 
							current: this.state.metaData.pageNum, 
							pageSize: this.state.metaData.pageSize, 
							total: this.state.metaData.total, 
							showSizeChanger: false,
							onChange: (page, pageSize) => { this.onRefresh(page, pageSize) }
						} } >
                    <Table.Column title='名称' dataIndex='name' key='name' width='60%' render={(text, type) => (
                        <label>{type.name}</label>
                     ) } />
                    <Table.Column title='创建者' dataIndex='creatorName' key='creatorName' width='10%' render={(text, type) => (
                        <label>{type.creatorName}</label>
                     ) } />
                    <Table.Column title='操作' dataIndex='operation' key='operation' width='20%' render={(text, type) => (
                    	<span>
	                    	{
	                    		(this.state.currentUser.userGroup == 0 || this.state.currentUser.userName == type.creator) &&
	                    		<span>
		                            <Button onClick={e => {e.preventDefault(); this.onEditType(type.name); this.setState({showTypeList: false, showTypeAdd: false, showTypeEdit: true});}} >编辑</Button>
		                            &nbsp;&nbsp;
		                            <Popconfirm title="确认删除该结构吗?" onConfirm={ e=> { this.onDeleteType(type.name) } } okText="确定" cancelText="取消">
								      <Button onClick={e => {e.preventDefault();}} >删除</Button>
								  	</Popconfirm>
		                        </span>
	                    	}
                    	</span>
                      )} />
                    </Table>
                    <br />
                    <Button type="primary" onClick={e=>{e.preventDefault(); this.setState({showTypeList: false, showTypeEdit: false, showTypeAdd: true})}}>添加结构</Button>
                </Modal>
			</div>
		);
	}

}

const mapStateToProps = (state) => {
	return {
		doc: state.doc,
		state: state
	}
}

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		onAddResult: () => {
			dispatch({type: 'DOC_ADD_RESULT', id: uuidV1()});
		},
		onDeleteResult: (id) => {
			dispatch({type: 'DOC_DELETE_RESULT', 'id': id});
		},
		onSetResultValue: (id, col, val) => {
			dispatch({type: 'DOC_SET_RESULT', 'id': id, col: col, value: val});
		},
		onSetFieldValue: (field, val) => {
			dispatch({type: 'DOC_SET_FIELD', field: field, value: val});
		},
		onAddErrorCode: () => {
			dispatch({type: 'DOC_ADD_ERROR', id: uuidV1()});
		},
		onDeleteErrorCode: (id) => {
			dispatch({type: 'DOC_DELETE_ERROR', 'id': id});
		},
		onSetErrorCodeValue: (id, col, val) => {
			dispatch({type: 'DOC_SET_ERROR', 'id': id, col: col, value: val});
		},
		onReset: () => {
			dispatch({type: 'DOC_RESET_STORE'});
		},
		onUpdate: (apiId, doc) => {
			var requestDemos = [];
			if (doc.javaDemo) {
				requestDemos.push({
					lang: 'java',
					code: doc.javaDemo
				});
			}
			if (doc.csharpDemo) {
				requestDemos.push({
					lang: 'csharp',
					code: doc.csharpDemo
				});
			}
			if (doc.phpDemo) {
				requestDemos.push({
					lang: 'php',
					code: doc.phpDemo
				});
			}
			if (doc.pythonDemo) {
				requestDemos.push({
					lang: 'python',
					code: doc.pythonDemo
				});
			}
			if (doc.nodejsDemo) {
				requestDemos.push({
					lang: 'nodejs',
					code: doc.nodejsDemo
				});
			}

			var results = [];
			for (var i=0; i<doc.resultParams.length; i++) {
				const result = doc.resultParams[i];
				if (!result.name) {
					notification.error({
						message: '第' + (i + 1) + '个返回值的名称不能为空'
					});
					return;
				}
				if (!result.type) {
					notification.error({
						message: '第' + (i + 1) + '个返回值的类型不能为空'
					});
					return;
				}
				if (!result.desc) {
					notification.error({
						message: '第' + (i + 1) + '个返回值的描述不能为空'
					});
					return;
				}
				results.push({
					name: result.name,
					type: result.type,
					desc: result.desc,
					isNeed: result.isNeed,
					defaultValue: result.defaultValue,
					example: result.example
				});
			}

			var errorCodes = [];
			for (var i=0; i<doc.errorCodes.length; i++) {
				const error = doc.errorCodes[i];
				if (!error.name) {
					notification.error({
						message: '第' + (i + 1) + '个错误码的错误码不能为空'
					});
					return;
				}
				if (!error.desc) {
					notification.error({
						message: '第' + (i + 1) + '个错误码的描述不能为空'
					});
					return;
				}
				errorCodes.push({
					errorCode: error.name,
					errorDesc: error.desc,
					solution: error.solution
				})
			}

			var docForm = {
				apiId: apiId,
				successResponse: doc.successResponse,
				errorResponse: doc.errorResponse,
				demos: requestDemos,
				results: results,
				errorCodes: errorCodes
			}

			docForm.id = doc.id;
			fetch('/web/api/' + apiId + '/doc', {
				method: 'PUT',
				body: JSON.stringify(docForm)
			}).then((resp) => {
				notification.info({
	                message: '更新文档成功'
	            });
			});
		},
		onRestoreDoc: (doc) => {
			dispatch({type: 'DOC_RESTORE', doc: doc});
		}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Doc);
