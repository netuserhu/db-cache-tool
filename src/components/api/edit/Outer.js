import React, { Component } from 'react';
import { Form, Input, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox, Button, Radio, Table, Card, Collapse, Modal, AutoComplete, Popconfirm, Tree } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
import Constant from '../../../constant/global';
import 'whatwg-fetch';
import {connect} from 'react-redux';
var _ = require('lodash');
const uuidV1 = require('uuid/v1');
import { notification } from 'antd';
const { Column, ColumnGroup } = Table;
import debounce from 'lodash.debounce';

class Outer extends React.Component {

	constructor(props) {
		super(props);
		this.state = {apiGroups: [], searchUsers: [], searchParamTypes: [], structData: {}, paramTypes: [], typeFields: [], typeName: '', typeId: 0,showTypeAdd: false, showTypeEdit: false, showTypeList: false};
		this.onSearchUser = debounce(this.onSearchUser, 300);
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
	
		// 添加用户时，初始化责任人
		fetch('/web/user/self').then(resp => {
			this.setState({currentUser: resp.data});
			if (this.props.mode && (this.props.mode == 'add' || this.props.mode == 'parse')) {
				if (!this.props.outer.owners || this.props.outer.owners.length == 0) {
					this.props.onSetFieldValue('owners', [{
						key: resp.data.userName,
						label: resp.data.realName
					}]);
				}
			}
		});

		this.onReloadParamTypes();
	}

	onReloadParamTypes() {
		var myTypes = [];
		const types = Constant.API_OUTER_TYPE;
		for (var i=0; i<types.length; i++) {
			myTypes.push({
				text: types[i].text,
				value: types[i].value,
				isBasic: true
			});
		}

		this.setState({paramTypes: myTypes});

		fetch('/web/api/param/struct?pageSize=999999').then(resp => {
			if (!resp || !resp.data) {
				return;
			}
			const apiParamStructs = resp.data.list;
			for (var i=0; i<apiParamStructs.length; i++) {
				myTypes.push({
					text: apiParamStructs[i].name,
					value: apiParamStructs[i].name,
					isBasic: false
				});

				myTypes.push({
					text: apiParamStructs[i].name + '[]',
					value: apiParamStructs[i].name  + '[]',
					isBasic: false
				});
			}
			this.setState({paramTypes: myTypes});
		});
	}

	onSearchUser(kw) {
		this.setState({userName: kw});
		if (kw && kw.length > 0) {
			fetch('/web/oauser?name=' + kw).then((resp) => {
				var data = resp.data;
				this.setState({'searchUsers': data.list});
			});
		}
	}

	handleContinue(e) {
		console.log(this.state);
		this.props.handleContinue(e);
	}

	handleSubmit = (e) => {
	  e.preventDefault();
	  this.props.form.validateFieldsAndScroll((err, values) => {
	  	// 校验参数
	  	for (var i=0; i<this.props.params.length; i++) {
	  		const param = this.props.params[i];
	  		var msg = '第' + (i+1) + '个参数';
	  		if (!param.name) {
	  			notification.error({
	  				message: msg + '名称不能为空'
	  			});
	  			return;
	  		}
	  		// 只有对外API才需要校验参数名是否合法
	  		if (this.props.outer.isOuter) {
	  			if (this.props.mode == 'add' && !/^[a-z]?[a-z_]*[a-z]([\[]])?$/g.test(param.name)) {
		  			notification.error({
		  				message: msg + '名称只能包含a-z或_或[]'
		  			});
		  			return;
		  		}
	  		}
	  		if (!param.type) {
	  			notification.error({
	  				message: msg + '类型不能为空'
	  			});
	  			return;
	  		}
	  		if (this.props.mode == 'add' && !param.desc) {
	  			notification.error({
	  				message: msg + '描述不能为空'
	  			});
	  			return;
	  		}
	  	}
	    if (!err) {
	    	this.handleContinue(e);
	    }
	  });
	}

	checkName = (rule, value, callback) => {
		if (this.props.mode && this.props.mode != 'edit' && this.props.mode != 'view') {
			if (!value || !/^[a-z]([a-z]|\.)*([a-z])$/g.test(value)) {
				callback('名称只能以a-z开头和结尾，中间可以包含字符"."或"_"，最后一个单词以动词结束，例如: youzan.item.create');
			}
		}
		callback();
	}

	checkVersion = (rule, value, callback) => {
		if (!value || !/^[0-9]([0-9]|\.)+[0-9]$/g.test(value)) {
			callback('版本号只能以0-9开头和结尾，中间可以包含字符"."，例如: 1.0.0');
		}
		callback();
	}

	checkApiExists() {
		if (!this.props.outer.name || !this.props.outer.version) {
			return;
		}
		fetch('/web/api/exist?apiName=' + this.props.outer.name + '&version=' + this.props.outer.version).then(resp => {
			if (resp.data == true) {
				notification.error({
					message: 'API已经存在，请重新填写'
				});
				return;
			}
		})
	}

	isPrimitiveType(typeName) {
		if (!typeName) {
			return true;
		}

		const types = Constant.API_OUTER_TYPE;
		for (var i=0; i<types.length; i++) {
			if (types[i].value == typeName) {
				return true;
			}
		}

		return false;
	}

	onLoadParamStruct(pageNum) {
		var newPageNum = 1;
		if (pageNum) {
			newPageNum = pageNum;
		}
		var qs = 'pageNum=' + newPageNum + '&';
		if (this.state.paramTypeName) {
			qs += 'name=' + this.state.paramTypeName; 
		}

		fetch('/web/api/param/struct?' + qs).then(resp => {
			this.setState({structData: resp.data});
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

		var tmpFields = this.state.typeFields;
		var fields = [];
		for (var i=0; i<tmpFields.length; i++) {
			tmpFields[i].id = '';
			fields.push(tmpFields[i]);
		}

		var form = {
			name: this.state.typeName,
			description: this.state.typeDesc,
			fields: [...fields]
		};

		fetch('/web/api/param/struct', {
			method: 'POST',
			body: JSON.stringify(form)
		}).then(resp => {
			this.setState({typeName: '', typeFields: [], typeDesc: ''});
			notification.info({message: '添加参数结构成功'});
			this.onLoadParamStruct();
			this.onReloadParamTypes();
		});

		return true;
	}

	onUpdateType() {
			if (!this.state.typeName) {
					notification.error({message: '请输入类型名称'});
					return false;
			}

			var tmpFields = this.state.typeFields;
			var fields = [];
			for (var i=0; i<tmpFields.length; i++) {
				tmpFields[i].id = '';
				fields.push(tmpFields[i]);
			}
			
			var form = {
				name: this.state.typeName,
				description: this.state.typeDesc,
				fields: [...fields]
			};

			fetch('/web/api/param/struct/' + this.state.typeName, {
				method: 'PUT',
				body: JSON.stringify(form)
			}).then(resp => {
				this.setState({typeName: '', typeFields: [], typeDesc: ''});
				notification.info({message: '更新参数结构成功'});
			});
			return true;
	}

	onEditType(name) {
		fetch('/web/api/param/struct/' + name).then(resp => {
			if (!resp.data) {
				notification.error({message: '结构不存在'});
				return;
			}
			const apiParamStruct = resp.data;
			var fields = [];
			if (apiParamStruct.fields) {
				apiParamStruct.fields.map(f => {
					fields.push({
						id: uuidV1(),
						fieldName: f.fieldName,
						description: f.description,
						example: f.example,
						fieldType: f.fieldType
					})
				})
			}
			this.setState({typeId: apiParamStruct.id, typeName: apiParamStruct.name, typeDesc: apiParamStruct.description, typeFields: fields});
		});
	}

	onDeleteType(name) {
		fetch('/web/api/param/struct/' + name, {
			method: 'DELETE'
		}).then(resp => {
			notification.info({message: '删除结构成功'});
			this.onLoadParamStruct();
			this.onReloadParamTypes();
		})
	}

	getTree(struct) {
		if (!struct) {
			return;
		}
		return (
			<Tree showLine={true} defaultExpandedKeys={['0']}>
				{
					this.traceTree(struct, ['0'])
				}
			</Tree>
		)
	}

	traceTree(struct, route) {
		var childrenNodes = [];
		var keyPrefix = '';
		for (var i=0; i<route.length; i++) {
			keyPrefix += route[i];
		}
		if (struct.children && struct.children.length > 0) {
			for (var i=0; i<struct.children.length; i++) {
				route.push('-' + i);
				const node = this.traceTree(struct.children[i], route);
				childrenNodes.push(node);
				route.pop();
			}
		}

		return (
			<Tree.TreeNode title={struct.name + '[' + struct.type + ']'} key={keyPrefix}>
				{childrenNodes}
			</Tree.TreeNode>
		)
	}

	render() {

		const { getFieldDecorator } = this.props.form;
		var advanced = [];
		// 如果配置过高级选项，则默认展开
		if (this.props.outer.transResult != '1' || this.props.outer.resultFormat != '1') {
			advanced.push('advanced');
		}

		return (

			<div >
			<Card title="对外配置">
				<Form >
			        <FormItem labelCol={{md: 7}} wrapperCol={{md: 8}} label="名称"  >
			          <Row>
			          	<Col md={18}>
			          		{getFieldDecorator('name', {
					            rules: [{
					              required: true, message: '请输入名称',
					            }, {
					              validator: this.checkName,
					            }],
					            initialValue: this.props.outer.name
					          })(
					            <Input onChange={e=> { this.props.onSetFieldValue('name', e.target.value); }} onBlur={e=>{ this.checkApiExists() }} placeholder="例如：youzan.item.create" style={{width: '97%'}} disabled={this.props.mode == 'view'} />
					          )}
			          	</Col>
			          	<Col md={6}>
							<Tooltip title="点击查看API命名规范">
			          			<a href="http://gitlab.qima-inc.com/open-platform/carmen-console-ng-doc/wikis/specification-for-api-of-youzanyun" target="blank" style={{color: '#595959'}} ><Icon type="info-circle" /> API命名规范</a>
			          		</Tooltip>
			          	</Col>
			          </Row>
			          
			        </FormItem>
			        <FormItem labelCol={{md: 7}} wrapperCol={{md: 4}} label="版本"  >
			          {getFieldDecorator('version', {
			            rules: [{
			              required: true, message: '请输入版本号',
			            }, {
			            	validator: this.checkVersion
			            }],
						initialValue: this.props.outer.version
			          })(
			            <Input value={this.props.outer.version} onChange={e=> { this.props.onSetFieldValue('version', e.target.value); }} onBlur={e=>{ this.checkApiExists() }} disabled={this.props.mode == 'view'} />
			          )}
			        </FormItem>
			        <FormItem labelCol={{md: 7}} wrapperCol={{md: 6}} label="分组" >
			          {getFieldDecorator('group', {
			            rules: [{
			              required: true, message: '请选择分组',
			            }],
			            initialValue: this.props.outer.group
			          })(
			            <Select showSearch placeholder="选择分组" value={this.props.outer.group}  onSelect={val => { this.props.onSetFieldValue('group', val); }} disabled={this.props.mode == 'view'} 
			            filterOption={(input, option) => { return option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0 || option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}}>
			              {
						    	this.state.apiGroups.map(apiGroup => {
						    		return (
						    			<Option key={apiGroup.alias} value={apiGroup.alias}>{apiGroup.name}</Option>
						    		)
						    	})
						    }
			            </Select>
			          )}
			        </FormItem>
			        <FormItem labelCol={{md: 7}} wrapperCol={{md: 8}} label="对外开放"  >
			          {getFieldDecorator('isOuter', {
			            rules: [{
			              required: true, message: '',
			            }],
			            initialValue: this.props.outer.isOuter
			          })(
			            <Checkbox checked={this.props.outer.isOuter} onChange={e=> { this.props.onSetFieldValue('isOuter', e.target.checked) }} disabled={this.props.mode == 'view'}>需要对外开放</Checkbox>
			          )}
			          <Tooltip title="点击查看帮助">
	          		      <a href="http://gitlab.qima-inc.com/open-platform/carmen-console-ng-doc/wikis/config-api#-a-%E5%9F%BA%E7%A1%80%E9%85%8D%E7%BD%AE-1" target="blank" style={{color: '#595959'}} ><Icon type="question-circle" /> 如果需要将API暴露到有赞云请勾选该项</a>
	          		  </Tooltip>
			        </FormItem>
					<Form.Item labelCol={{md: 7}} wrapperCol={{md: 10}} label="http调用方法" >
						{getFieldDecorator('httpMethod', {
							rules: [{
								required: true, message: '请选择方法',
							}],
							initialValue: this.props.outer.httpMethodName
						})(
							<Select style={{width: '35%'}} showSearch placeholder="选择http方法" value={this.props.outer.httpMethodName} onSelect={(val, option) => { this.props.onSetFieldValue('httpMethod', val); this.props.onSetFieldValue('httpMethodName', option.props.name); }} disabled={this.props.mode == 'view'}
							filterOption={(input, option) => { return option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0 || option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}}>
								{
									Constant.API_METHOD.map(method => {
										return (
											<Option key={method.value} value={method.value} name={method.text}>{method.text}</Option>
										)
									})
								}
							</Select>
						)}
						<span>&nbsp;&nbsp;&nbsp;&nbsp;<Icon type="info-circle" /> 调用该接口的http方法(<span style={{color: 'red'}}>php接口以内部http方法为准</span>)</span>
					</Form.Item>
			        <FormItem labelCol={{md: 7}} wrapperCol={{md: 6}} label="返回值转换" style={{marginBottom: '10px'}} >
			        	{getFieldDecorator('isTransResult', {
				            rules: [{
				              required: true, message: '',
				            }],
				            initialValue: this.props.outer.transResult
				        })(
				            <Select placeholder='选择结果转换' style={{width: '100%'}} value={this.props.outer.transResult} onChange={(val, d)=> { this.props.onSetFieldValue('transResult', val)}} disabled={this.props.mode == 'view'} >
					      		<Option key='1' value='1'>不需要转换</Option>
					      		<Option key='2' value='2'>将结果中的键由驼峰转换成下划线</Option>
					      	</Select>
				        )}
			      	</FormItem>
			        <FormItem labelCol={{md: 7}} wrapperCol={{md: 16}} label="鉴权方式" >
			          {getFieldDecorator('auth', {
			          	rules: [{
			              required: true, message: '请选择鉴权方式',
			            }],
			            initialValue: this.props.outer.auth
			          })(
			            <Radio.Group onChange={e=>{ this.props.onSetFieldValue('auth', e.target.value); }} disabled={this.props.mode == 'view'}>
			              <Radio value="all">免签名模式(Token)和签名(Sign)</Radio>
			              <Radio value="token">免签名模式(Token)</Radio>
			              <Radio value="sign">签名模式(Sign)</Radio>
			            </Radio.Group>
			          )}
			          <Tooltip title="点击查看鉴权方式介绍">
			          	<a href="http://gitlab.qima-inc.com/open-platform/carmen-console-ng-doc/wikis/config-api#-a-%E5%9F%BA%E7%A1%80%E9%85%8D%E7%BD%AE-1" target="blank" style={{color: '#595959'}} ><Icon type="question-circle" /></a>
			          </Tooltip>
			        </FormItem>
			        <FormItem labelCol={{md: 7}} wrapperCol={{md: 8}} label="责任人" >
			          {getFieldDecorator('owners', {
			            rules: [{
			              required: true, message: '选择责任人',
			            }],
			            initialValue: this.props.outer.owners
			          })(
			            <Select multiple labelInValue placeholder="选择责任人" filterOption={false} onSearch={ kw => {this.onSearchUser(kw)}} onChange={ val => { this.props.onSetFieldValue('owners', val); } } style={{ width: '100%' }} disabled={this.props.mode == 'view'}>
					        {
					        	this.state.searchUsers.map(item => <Option key={item.userName} value={item.userName} >{item.realName}</Option>)
					        }
					    </Select>
			          )}
			        </FormItem>
			        <FormItem labelCol={{md: 7}} wrapperCol={{md: 10}} label="功能描述"  >
			          {getFieldDecorator('desc', {
			            rules: [{
			              required: true, message: '请输入简略描述信息',
			            }],
			            initialValue: this.props.outer.desc
			          })(
			            <Input type="textarea" autosize={true} placeholder='输入简略描述信息' style={{height: '140px'}} value={this.props.outer.desc} onChange={e=> { this.props.onSetFieldValue('desc', e.target.value); }} disabled={this.props.mode == 'view'} />
			          )}
			        </FormItem>
			        <FormItem labelCol={{md: 7}} wrapperCol={{md: 10}} label="详细描述"  >
			          {getFieldDecorator('scenarios', {
			            rules: [{
			              required: true, message: '请输入该API使用的场景详细描述',
			            }],
			            initialValue: this.props.outer.scenarios
			          })(
			            <Input type="textarea" placeholder='输入该API使用的场景详细描述' style={{height: '140px'}} value={this.props.outer.scenarios} onChange={e=> { this.props.onSetFieldValue('scenarios', e.target.value); }} disabled={this.props.mode == 'view'} />
			          )}
			        </FormItem>
			        <FormItem labelCol={{md: 7}} wrapperCol={{md: 11}} label="高级配置"  >
			          <Collapse >
					      <Collapse.Panel header="点击展开高级配置" key="1" >
					      	<FormItem labelCol={{md: 5}} wrapperCol={{md: 12}} label="登录校验" style={{marginBottom: '1px'}}  >
					        	<Checkbox style={{width: '100%'}} checked={this.props.outer.isLogin} onChange={e=> { this.props.onSetFieldValue('isLogin', e.target.checked) }} disabled={this.props.mode == 'view'}>需要登录校验</Checkbox>
					        </FormItem>
					      	<FormItem labelCol={{md: 5}} wrapperCol={{md: 13}} label="源端调用类型" style={{marginBottom: '10px'}} >
					      		<Select placeholder='选择结果转换' style={{width: '100%'}} value={this.props.outer.resultFormat} onChange={(val, d)=> { this.props.onSetFieldValue('resultFormat', val)}} disabled={this.props.mode == 'view'} >
						      		<Option key='1' value='1'>通用类型</Option>
						      		<Option key='2' value='2'>微信回调</Option>
						      		<Option key='3' value='3'>支付宝回调</Option>
						      	</Select>
					      	</FormItem>
					      	<FormItem labelCol={{md: 5}} wrapperCol={{md: 12}} label="开启API日志" style={{marginBottom: '1px'}} >
					      		<Select placeholder='选择是否开启API日志' style={{width: '100%'}} value={this.props.outer.enableLog} onChange={(val, d)=> { this.props.onSetFieldValue('enableLog', val)}} disabled={this.props.mode == 'view'} >
						      		<Option key='0' value='0'>不开启</Option>
						      		<Option key='1' value='1'>开启</Option>
						      	</Select>
					      	</FormItem>
					      </Collapse.Panel>
				        </Collapse>

			        </FormItem>
			        
			      </Form>
			      <br/>
			      <Table showHeader={true} dataSource={this.props.outer.params} pagination={false} bordered >
			      	<Column title='名称' dataIndex='name' key='name' width='10%' render={(text, param) => (
		      			<Input value={param.name} onChange={e=> {this.props.onSetParamValue(param.id, 'name', e.target.value)}} />
			      	 ) } />
			      	<Column title='类型' dataIndex='type' key='type' width='12%' render={(text, param) => (
			      		<Row>
				      		<Col md={24}>
					      		{
											!(this.props.mode == 'view' && !this.isPrimitiveType(param.type)) &&
												<Select showSearch placeholder="选择类型" style={{width: '100%'}} value={param.type} onSelect={val=> {this.props.onSetParamValue(param.id, 'type', val)}} disabled={this.props.mode == 'view'} 
													filterOption={(input, option) => { return option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0 || option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}}>
														{
															this.state.paramTypes.map(type => {
															return (
																<Option key={type.value} value={type.value}>{type.text}</Option>
															)
														})
														}
											</Select>
										}
										{
											(this.props.mode == 'view' && !this.isPrimitiveType(param.type)) &&
											this.getTree(param.struct)
										}
				      		</Col>
		      			</Row>
			      	 ) } />
			      	<Column title='是否必填' dataIndex='isRequired' key='isRequired' width='5%' render={(text, param) => (
		      			<Checkbox checked={param.isRequired} onChange={e=> { this.props.onSetParamValue(param.id, 'isRequired', e.target.checked) }} disabled={this.props.mode == 'view'} >是</Checkbox>
			      	 ) } />
			      	<Column title='默认值' dataIndex='defaultValue' key='defaultValue' width='10%' render={(text, param) => (
		      			<Input type='textarea' autosize={true} value={param.defaultValue} onChange={e=> {this.props.onSetParamValue(param.id, 'defaultValue', e.target.value)}} disabled={this.props.mode == 'view'} />
			      	 ) } />
			      	<Column title='描述' dataIndex='desc' key='desc' width='13%' render={(text, param) => (
		      			<Input type='textarea' autosize={true} value={param.desc} onChange={e=> {this.props.onSetParamValue(param.id, 'desc', e.target.value)}} disabled={this.props.mode == 'view'} />
			      	 ) } />
			      	<Column title='示例' dataIndex='example' key='example' width='10%' render={(text, param) => (
		      			<Input type='textarea' autosize={true} value={param.example} onChange={e=> {this.props.onSetParamValue(param.id, 'example', e.target.value)}} disabled={this.props.mode == 'view'} />
			      	 ) } />
			      	<Column title='操作' dataIndex='operation' key='operation' width='5%' render={(text, param) => (
					    <span>
					      <Button onClick={e => {e.preventDefault(); this.props.onDeleteParam(param.id)}} disabled={this.props.mode == 'view'} >删除</Button>
					    </span>
					  )} />
			      </Table>
			      <br />
			      <Button type="primary" htmlType="submit" size="large" onClick={e => {e.preventDefault(); this.props.onAddParam()}} disabled={this.props.mode == 'view'} >+ 参数</Button>
						&nbsp;&nbsp;&nbsp;&nbsp;
						<Button type="primary" htmlType="submit" size="large" onClick={e=>{e.preventDefault(); this.setState({showTypeAdd: true, typeName: '', typeFields: []})}} disabled={this.props.mode == 'view'} >+ 参数类型</Button>
						&nbsp;&nbsp;&nbsp;&nbsp;
						<Button type="primary" htmlType="submit" size="large" onClick={e=>{e.preventDefault(); this.setState({showTypeList: true}); this.onLoadParamStruct()}} ><Icon type='setting' />管理类型</Button>
						&nbsp;&nbsp;&nbsp;&nbsp;
						<span style={{color: 'red'}} ><Icon type="question-circle" style={{color: '#595959'}} /> 复合类型的参数目前仅作展示用，实际传入应用的是一个json的字符串，请谨慎使用，
						<a target="blank" href="http://gitlab.qima-inc.com/open-platform/carmen-console-ng-doc/wikis/config-api#-a-%E5%9F%BA%E7%A1%80%E9%85%8D%E7%BD%AE-1">点击查看详情</a></span>
			      <br />
			      <br />
			   </Card>
			   <br/>
			   <center>
			      	<Button type="primary" htmlType="submit" size="large" onClick={e=>this.handleSubmit(e)} ghost={true}>继续 <Icon type="right" /></Button>
			   </center>

				 <Modal
						title="添加对外结构体类型(注意: 仅供展示使用，实际传入应用仍然是json的字符串)"
						wrapClassName="vertical-center-modal"
						okText="添加"
						cancelText="取消"
						visible={this.state.showTypeAdd}
						width={1000}
						onOk={() => this.setState({showTypeAdd: false})}
						onCancel={() => this.setState({showTypeAdd: false})}
						footer={
							<center>
									<Button type="primary" onClick={e=>{e.preventDefault(); this.onAddType();}} disabled={this.props.mode == 'view'}>添加</Button> 
									<Button onClick={e=>{e.preventDefault(); this.setState({showTypeAdd: false});}}>取消</Button>
							</center>}
					>
						<Form >
							<Form.Item labelCol={{md: 7}} wrapperCol={{md: 10}} label="名称" >
								<Input value={this.state.typeName} onChange={e=>{this.setState({typeName: e.target.value})}} placeholder="填入名称：如UserCreateForm" />
							</Form.Item>
						</Form>
						<Table showHeader={true} dataSource={this.state.typeFields} pagination={false} bordered  >
							<Column title='名称' dataIndex='fieldName' key='fieldName' width='10%' render={(text, field) => (
									<Input value={field.fieldName} onChange={e=> {this.onSetTypeField(field.id, 'fieldName', e.target.value)}} />
								) } />
							<Column title='类型' dataIndex='fieldType' key='fieldType' width='10%' render={(text, field) => (
									<Row>
											<Col md={24}>
													<Select showSearch placeholder="选择类型" style={{width: '100%'}} value={field.fieldType} onSelect={val=> {this.onSetTypeField(field.id, 'fieldType', val)}} 
													filterOption={(input, option) => { return option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0 || option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}}>
															{
																	this.state.paramTypes.map(type => {
																			return (
																					<Option key={type.value} value={type.value}>{type.text}</Option>
																			)
																	})
															}
													</Select>
											</Col>
									</Row>
								) } />
							<Column title='描述' dataIndex='description' key='description' width='10%' render={(text, field) => (
								<Input value={field.description} onChange={e=> {this.onSetTypeField(field.id, 'description', e.target.value)}} />
							) } />
							<Column title='示例' dataIndex='example' key='example' width='10%' render={(text, field) => (
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
						title="编辑对外结构体类型"
						wrapClassName="vertical-center-modal"
						okText="添加"
						cancelText="取消"
						visible={this.state.showTypeEdit}
						width={1000}
						onOk={() => this.setState({showTypeEdit: false})}
						onCancel={() => this.setState({showTypeEdit: false})}
						footer={
							<center>
									<Button type="primary" onClick={e=>{e.preventDefault(); this.onUpdateType();}} disabled={this.props.mode == 'view'}>保存</Button> 
									<Button onClick={e=>{e.preventDefault(); this.setState({showTypeEdit: false});}}>取消</Button>
							</center>}
					>
						<Form >
							<Form.Item labelCol={{md: 7}} wrapperCol={{md: 10}} label="名称" >
								<Input value={this.state.typeName} onChange={e=>{this.setState({typeName: e.target.value})}} />
							</Form.Item>
						</Form>
						<Table showHeader={true} dataSource={this.state.typeFields} pagination={false} bordered  >
							<Column title='名称' dataIndex='fieldName' key='fieldName' width='10%' render={(text, field) => (
									<Input value={field.fieldName} onChange={e=> {this.onSetTypeField(field.id, 'fieldName', e.target.value)}} />
								) } />
							<Column title='类型' dataIndex='fieldType' key='fieldType' width='10%' render={(text, field) => (
									<Row>
											<Col md={24}>
													<Select showSearch placeholder="选择类型" style={{width: '100%'}} value={field.fieldType} onSelect={val=> {this.onSetTypeField(field.id, 'fieldType', val)}}
													filterOption={(input, option) => { return option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0 || option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}}>
															{
																	this.state.paramTypes.map(type => {
																			return (
																					<Option key={type.value} value={type.value}>{type.text}</Option>
																			)
																	})
															}
													</Select>
											</Col>
									</Row>
								) } />
							<Column title='描述' dataIndex='description' key='description' width='10%' render={(text, field) => (
								<Input value={field.description} onChange={e=> {this.onSetTypeField(field.id, 'description', e.target.value)}} />
							) } />
							<Column title='示例' dataIndex='example' key='example' width='10%' render={(text, field) => (
									<Input value={field.example} onChange={e=> {this.onSetTypeField(field.id, 'example', e.target.value)}} />
								) } />
							<Column title='操作' dataIndex='operation' key='operation' width='10%' render={(text, field) => (
									<span>
										<Button onClick={e => {e.preventDefault(); this.onDeleteTypeField(field.id)}} disabled={this.props.mode == 'view'}>删除</Button>
									</span>
								)} />
							</Table>
					<br/>
					<Button type="primary" htmlType="submit" size="large" onClick={e=>{e.preventDefault(); this.onAddTypeField()}} disabled={this.props.mode == 'view'}>+ 字段</Button>
					</Modal>

					<Modal
						title="对外结构体类型列表"
						wrapClassName="vertical-center-modal"
						okText="添加"
						cancelText="取消"
						visible={this.state.showTypeList}
						width={1000}
						onOk={() => this.setState({showTypeList: false})}
						onCancel={() => this.setState({showTypeList: false})}
						footer={<center><Button type="primary" onClick={e=>{e.preventDefault(); this.setState({showTypeList: false});}}>关闭</Button></center>}
					>
						<Row>
							<Col md={10}>
								<Input value={this.state.paramTypeName} style={{ width: '97%' }} size={'large'} onChange={e => { this.setState({paramTypeName: e.target.value}); }} placeholder="输入结构名称进行搜索" />
							</Col>
							<Col md={3}>
								<Button type="primary" size={'large'} onClick={e=> {e.preventDefault(); this.onLoadParamStruct()}}><Icon type='search' />搜索</Button>
							</Col>
						</Row>
						<br/>
						<Table showHeader={true} dataSource={this.state.structData.list} bordered pagination={ { 
							current: this.state.structData.pageNum, 
							pageSize: this.state.structData.pageSize, 
							total: this.state.structData.total, 
							showSizeChanger: false,
							onChange: (page, pageSize) => { this.onLoadParamStruct(page, pageSize) }
						} } >
							<Column title='名称' dataIndex='name' key='name' width='70%' render={(text, type) => (
									<label>{type.name}</label>
								) } />
							<Table.Column title='操作' dataIndex='operation' key='operation' width='20%' render={(text, type) => (
								<span>
									{
										(this.state.currentUser.userGroup == 0 || this.state.currentUser.userName == type.creator) &&
										<span>
													<Button onClick={e => {e.preventDefault(); this.onEditType(type.name); this.setState({showTypeList: false, showTypeAdd: false, showTypeEdit: true});}} >编辑</Button>
													&nbsp;&nbsp;
													<Popconfirm title="确认删除该结构吗?" onConfirm={ e=> { this.onDeleteType(type.name) } } okText="确定" cancelText="取消">
														<Button onClick={e => {e.preventDefault();}} disabled={this.props.mode == 'view'}>删除</Button>
													</Popconfirm>
											</span>
									}
								</span>
								)} />
							</Table>
							<br />
							<Button type="primary" onClick={e=>{e.preventDefault(); this.setState({showTypeList: false, showTypeEdit: false, showTypeAdd: true})}} disabled={this.props.mode == 'view'}>添加类型</Button>
					</Modal>

			</div>
		);
	}
}

const OuterForm = Form.create()(Outer);

const mapStateToProps = (state) => {
	return {
		params: state.outer.params,
		outer: state.outer
	}
}

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		onAddParam: () => {
			dispatch({type: 'OUTER_ADD_PARAM', id: uuidV1()});
		},
		onDeleteParam: (id) => {
			dispatch({type: 'OUTER_DELETE_PARAM', 'id': id});
		},
		onSetParamValue: (id, col, val) => {
			dispatch({type: 'OUTER_SET_PARAM', 'id': id, col: col, value: val});
		},
		onSetFieldValue: (field, val) => {
			dispatch({type: 'OUTER_SET_FIELD', field: field, value: val});
		}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(OuterForm);

