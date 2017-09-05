import React, { Component } from 'react';
import { Form, Input, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox, Button, Radio, Table, Popover, Alert, Card, notification } from 'antd';
import Constant from '../../../constant/global';
import 'whatwg-fetch';
import ObjectInspector from 'react-object-inspector';
import {connect} from 'react-redux';
import copy from 'copy-to-clipboard';
var _ = require('lodash');
const uuidV1 = require('uuid/v1');
const { Column, ColumnGroup } = Table;

class Test extends React.Component {

	constructor(props) {
		super(props);
		this.state = { step: 'edit', apiId: ''};
		this.props.onReset();
	}

	handleContinue(e) {
		e.preventDefault();
	}

	componentDidMount() {
		var apiId = this.props.state.inner.apiId;
		if (!apiId) {
			apiId = this.props.apiId;
		}
		this.setState({apiId: apiId});
		fetch('/web/api/' + apiId).then(resp => {
			const api = resp.data.carmenApi;
			const params = resp.data.carmenApiParams;
			var newParams = [];
			params.map(p => {
				newParams.push({
					name: p.paramName,
					type: p.paramName.indexOf('[]') >= 0 ? 'file' : 'text'
				})
			});

			this.props.initUrl({
				name: api.namespace + '.' + api.name,
				version: api.version,
				params: newParams
			});

			// 恢复参数
			fetch('/web/api/' + this.state.apiId + '/test').then(resp => {
				// 之前没有测试数据
				if (!resp.data || resp.data.length == 0) {
					return;
				}

				this.props.initUrl({
					name: api.namespace + '.' + api.name,
					version: api.version,
					params: resp.data
				});

			});
		});
	}

	componentWillUnmount() {
		this.props.onReset();
	}

	onSaveSuccessResult() {
		var docForm = {
			apiId: this.state.apiId,
			successResponse: this.props.test.result
		}

		fetch('/web/api/' + this.state.apiId + '/doc', {
			method: 'PUT',
			body: JSON.stringify(docForm)
		}).then(resp => {
			notification.info({
				message: '保存成功'
			});
		})
	}

  copyToClipboard(){
    let url =this.props.test.url;
    for (var i=0; i<this.props.test.params.length; i++) {
      if(i==0){
        url+="?";
      }else{
        url+="&";
      }
      let p = this.props.test.params[i];
      if (p.type == 'text') {
        url+=p.name;
        url+="=";
        url+=p.value;
      }
    }
    copy(url);
  }

	onSaveFailResult() {
		var docForm = {
			apiId: this.state.apiId,
			errorResponse: this.props.test.result
		}

		fetch('/web/api/' + this.state.apiId + '/doc', {
			method: 'PUT',
			body: JSON.stringify(docForm)
		}).then(resp => {
			notification.info({
				message: '保存成功'
			});
		})
	}

	render() {
		return (
			<div>
			  <Card title={<div><span>测试API</span>&nbsp;&nbsp; <a href='http://gitlab.qima-inc.com/open-platform/carmen-console-ng-doc/wikis/result-format-for-dubbo-api' target='_blank'>点击这里查看dubbo接口返回值规范</a></div>}>
				<Row>
					<Col md={16}>
						<Input addonBefore="请求地址" className='input-8' style={{width: '100%'}} value={this.props.test.url} onChange={e => { this.props.onSetFieldValue('url', e.target.value)}} disabled={this.props.mode == 'view'} />
					</Col>
					<Col md={3} style={{marginLeft: '10px'}} >
						{/*<Select placeholder='Http调用方法' style={{width: '30%'}} value={this.props.test.method} onChange={(val, d)=> { this.props.onSetFieldValue('method', val)}} disabled={this.props.mode == 'view'} >
				      		{
				      			Constant.API_METHOD.map(method => {
				      				return <Option key={method.value} value={method.value}>{method.text}</Option>
				      			})
				      		}
				      	</Select>&nbsp;&nbsp;*/}
				      	<Select placeholder='鉴权方式' style={{width: '100%'}} value={this.props.test.auth} onChange={(val, d)=> { this.props.onSetFieldValue('auth', val)}} disabled={this.props.mode == 'view'} >
				      		{
				      			Constant.API_AUTH_TYPE.map(auth => {
				      				return <Option key={auth.value} value={auth.value}>{auth.text}</Option>
				      			})
				      		}
				      	</Select>
					</Col>
          <Col md={4} style={{marginLeft: '10px'}}>
             <Button type="primary" onClick={e=> {e.preventDefault(); this.copyToClipboard(); }} >复制链接</Button>
          </Col>
				</Row>
			      	<br/>
			      <Table showHeader={true} dataSource={this.props.test.params} pagination={false} bordered  >
						<Column title='名称' dataIndex='name' key='name' width='10%' render={(text, param) => (
			      			<Input addonBefore={
								  <Select defaultValue="text" value={param.type} onSelect={val=> { this.props.onSetParamValue(param.id, 'type', val) }} disabled={param.name == 'access_token' || param.name == 'app_id'} >
									   <Option value="text">普通参数</Option>
									   <Option value="file">文件参数</Option>
                     <Option value="header">请求头参数</Option>
								  </Select>
							  } value={param.name} onChange={e=> {this.props.onSetParamValue(param.id, 'name', e.target.value)}} disabled={this.props.mode == 'view'} />
				      	 ) } />
				      	<Column title='值' dataIndex='type' key='type' width='10%' render={(text, param) => (
							  <span>
                  {param.type == 'text' && <Input value={param.value} onChange={e=> {this.props.onSetParamValue(param.id, 'value', e.target.value)}} disabled={this.props.mode == 'view'} />}
							  	{param.type == 'file' && <input id="upload" ref="upload" style={{width: '90%'}} type="file" accept="*/*" class='ant-btn' onChange={(e)=> { this.props.onSetParamValue(param.id, 'value', e.target.files[0]) }} />}
                  {param.type == 'header'&&<Input value={param.value} onChange={e=> {this.props.onSetParamValue(param.id, 'value', e.target.value)}} />}
							</span>
				      	 ) } />
				      	<Column title='操作' dataIndex='operation' key='operation' width='10%' render={(text, param) => (
						    <span>
						      {
						      	param.name == 'access_token' &&
						      	<span><Button type="primary" ghost={true} onClick={e => {e.preventDefault(); this.props.onGetToken(); }} disabled={this.props.mode == 'view'} >获取token</Button>&nbsp;&nbsp;</span>
						      }
						      {
						      	param.name == 'access_token' &&
						      	<Popover title={false} content={
						      		<Form>
						      			<Form.Item labelCol={{md: 6}} wrapperCol={{md: 10}} label="店铺ID">
						      				<Input value={this.state.kdtId} onChange={e=> { this.setState({kdtId: e.target.value}) }} placeholder="可以不填" disabled={this.props.mode == 'view'} />
						      			</Form.Item>
						      			<Form.Item labelCol={{md: 6}} wrapperCol={{md: 16}} label="账号">
						      				<Input value={this.state.mobile} onChange={e=> { this.setState({mobile: e.target.value}) }} placeholder="必填，通常为手机号" disabled={this.props.mode == 'view'} />
						      			</Form.Item>
						      			<center>
							      			<Button onClick={e => {e.preventDefault(); this.props.onGenerateToken(this.state.mobile, this.state.kdtId) }} disabled={this.props.mode == 'view'} >生成</Button>
							      		</center>
							      		<br/>
						      		</Form>
						      	} title="Title" trigger="hover">
							      <span>
							      	<Button onClick={e => {e.preventDefault();  }} disabled={this.props.mode == 'view'} >自定义获取token</Button>&nbsp;&nbsp;
							      </span>
							    </Popover>
						      }
						      <Button onClick={e => {e.preventDefault(); this.props.onDeleteParam(param.id)}} disabled={this.props.mode == 'view'} >删除</Button>
						      {
							    param.name == 'access_token' &&
						    	<Tooltip title="点我跳转到完全自定义获取token文档" >
			          		      <span>
									&nbsp;&nbsp;
			          		      	<a href="http://gitlab.qima-inc.com/open-platform/carmen-console-ng-doc/wikis/get-token" target="blank" style={{color: '#595959',  width: '3%'}} ><Icon type="info-circle" /></a>
			          		      </span>
			          		    </Tooltip>
						      }
						    </span>
						  )} />
				   </Table>
				   <br/>
				   <Button type="primary" onClick={e=>{e.preventDefault(); this.props.onAddParam()}} disabled={this.props.mode == 'view'}>+ 参数</Button>
			    <br/>
			    </Card>
			    {
			    	!this.props.isListTrigger &&
			    	<center>
			    		<br/>
			    		<Button type="primary" htmlType="submit" size="large" onClick={e=>{this.props.handlePrevious(); }} ghost={true}><Icon type="left" /> 上一步</Button>
			    		&nbsp;&nbsp;
			    		{
			    			!(this.props.mode && this.props.mode == "view") &&
			    			<Button type="primary" onClick={e=> {e.preventDefault(); this.props.onTest(this.state.apiId, this.props.test)}} loading={this.props.state.app.loading}>测试</Button>
			    		}
					    &nbsp;&nbsp;
					    <Button type="primary" onClick={e=>this.props.handleContinue()} ghost={true}>继续 <Icon type="right" /></Button>
			    	</center>
			    }
			    <br />
			    {
			    	this.props.test.isSuccess == true &&
			    	<div>
			    		<Alert message={<span>
			    			{
			    				this.props.test.result && this.props.test.result.indexOf('{') >= 0 && <ObjectInspector data={JSON.parse(this.props.test.result)} initialExpandedPaths={['root', 'root.*']} />
			    			}
			    			{
			    				!(this.props.test.result && this.props.test.result.indexOf('{') >= 0) && this.props.test.result
			    			}
			    			</span>} type="success" showIcon />
			    		<Button type="primary" onClick={e=> {e.preventDefault(); this.onSaveSuccessResult()}} >保存为正确示例</Button>
			    	</div>
			    }
			    {
			    	this.props.test.isSuccess == false && (
			    	<div>
			    		<Alert message={<span>
			    			{
			    				this.props.test.result && this.props.test.result.indexOf('{') >= 0 && <ObjectInspector data={JSON.parse(this.props.test.result)} initialExpandedPaths={['root', 'root.*']} />
			    			}
			    			{
			    				!(this.props.test.result && this.props.test.result.indexOf('{') >= 0) && this.props.test.result
			    			}
			    			</span>} type="error" showIcon />
			    		<Button type="primary" onClick={e=> {e.preventDefault(); this.onSaveFailResult()}} >保存为错误示例</Button>
			    	</div>)
			    }
			</div>
		);
	}

}

const mapStateToProps = (state) => {
	return {
		test: state.test,
		outer: state.outer,
		state: state
	}
}

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		initUrl: (api) => {
			dispatch({type: 'TEST_INIT_URL', api: api});
		},
		onAddParam: () => {
			dispatch({type: 'TEST_ADD_PARAM', id: uuidV1()});
		},
		onDeleteParam: (id) => {
			dispatch({type: 'TEST_DELETE_PARAM', id});
		},
		onSetFieldValue: (name, val) => {
			dispatch({type: 'TEST_SET_FIELD', field: name, value: val});
		},
		onSetParamValue: (id, col, val) => {
			dispatch({type: 'TEST_SET_PARAM', id: id, col: col, value: val});
		},
		onGenerateToken: (mobile, kdtId) => {
			if (!mobile) {
				//
				notification.warning({
					message: '账号不能为空'
				});
				return;
			}
			var qs = 'userId=' + mobile;
			if (typeof kdtId != 'undefined') {
				qs += '&kdtId=' + kdtId;
			}
			fetch('/web/tool/token?' + qs).then((resp) => {
				if (!resp.data) {
					notification.warning({
						message: '获取token失败，请检查账号是否正确，若填了店铺ID，请检查该账号是否拥有该店铺',
						duration: 7
					});
					return;
				}
				dispatch({type: 'TEST_SET_PARAM', id: 'test_param', col: 'value', value: resp.data});
            });
		},
		onGetToken: () => {
			fetch('/web/tool/token').then((resp) => {
				if (!resp.data) {
					notification.warning({
						message: '获取token失败，请联系卡门管理员',
						duration: 6
					});
					return;
				}
				dispatch({type: 'TEST_SET_PARAM', id: 'test_param', col: 'value', value: resp.data});
	        });
		},
		onReset: () => {
			dispatch({type: 'TEST_RESET_STORE'});
		},
		onTest: (apiId, test, fn) => {
			var params = {};
			var form = new FormData();
      var headers = {};
			for (var i=0; i<test.params.length; i++) {
				var p = test.params[i];
				if (p.type == 'text') {
          params[p.name] = p.value;
				}
				if (p.type == 'file') {
					form.append(p.name, p.value);
					params[p.name] = 'file';
				}else if(p.type=='header'){
          headers[p.name] = p.value;
				}
			}
			const testParam = {
				apiId: apiId,
				url: test.url.replace('carmen.youzan.com','carmen.s.qima-inc.com'),
				method: test.method == '0' ? 'GET' : 'POST',
				auth: test.auth,
				'params': params,
        'headers': headers
			}
			var blob = new Blob([JSON.stringify(testParam)], {type: 'application/json'});
			form.append('form', blob);
			fetch('/web/api/' + apiId + '/test', {
				method: 'POST',
				headers: { 'Content-Type': 'multipart/form-data' },
				body: form
			}).then(resp => {
				if (resp.data == null || typeof resp.data == 'undefined') {
					dispatch({type: 'TEST_SET_RESULT', isSuccess: false});
				} else if (resp.data.indexOf('error_response') >= 0) {
					dispatch({type: 'TEST_SET_RESULT', isSuccess: false, result: resp.data});
				} else if (resp.data.indexOf('response')) {
					dispatch({type: 'TEST_SET_RESULT', isSuccess: true, result: resp.data});
				} else {
					dispatch({type: 'TEST_SET_RESULT', isSuccess: false, result: resp.data});
				}
				if (fn) {
					fn();
				}
			});

		}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Test);

